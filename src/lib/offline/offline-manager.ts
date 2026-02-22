/**
 * Offline Support and Data Synchronization System
 * Provides offline functionality with automatic sync when connection is restored
 */

import React from "react";
import { safeParseJson } from "../safe-json";

export interface OfflineAction {
  id: string;
  type: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  entityId: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: "PENDING" | "SYNCING" | "SUCCESS" | "FAILED";
  error?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingActions: number;
  lastSyncTime: number | null;
  syncErrors: number;
}

export interface OfflineConfig {
  maxRetries: number;
  retryDelay: number;
  syncInterval: number;
  maxPendingActions: number;
  enableAutoSync: boolean;
}

export class OfflineManager {
  private static instance: OfflineManager;
  private actions: OfflineAction[] = [];
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private config: OfflineConfig;

  private constructor() {
    this.config = {
      maxRetries: 3,
      retryDelay: 5000,
      syncInterval: 30000, // 30 seconds
      maxPendingActions: 100,
      enableAutoSync: true,
    };

    this.setupEventListeners();
    this.loadFromStorage();
    this.startAutoSync();
  }

  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  /**
   * Setup event listeners for online/offline detection
   */
  private setupEventListeners(): void {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.notifyListeners();
      this.syncPendingActions();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.notifyListeners();
    });

    // Listen for page visibility changes to sync when tab becomes active
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && this.isOnline) {
        this.syncPendingActions();
      }
    });
  }

  /**
   * Add an offline action to the queue
   */
  public addAction(
    type: OfflineAction["type"],
    entity: string,
    entityId: string,
    data: any,
    maxRetries: number = this.config.maxRetries
  ): string {
    const action: OfflineAction = {
      id: this.generateId(),
      type,
      entity,
      entityId,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries,
      status: "PENDING",
    };

    // Check if we've reached the maximum pending actions
    if (this.actions.length >= this.config.maxPendingActions) {
      // Remove oldest pending action
      const oldestIndex = this.actions.findIndex((a) => a.status === "PENDING");
      if (oldestIndex !== -1) {
        this.actions.splice(oldestIndex, 1);
      }
    }

    this.actions.push(action);
    this.saveToStorage();
    this.notifyListeners();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncPendingActions();
    }

    return action.id;
  }

  /**
   * Update an existing action
   */
  public updateAction(id: string, updates: Partial<OfflineAction>): boolean {
    const actionIndex = this.actions.findIndex((a) => a.id === id);
    if (actionIndex === -1) return false;

    this.actions[actionIndex] = { ...this.actions[actionIndex], ...updates };
    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  /**
   * Remove an action from the queue
   */
  public removeAction(id: string): boolean {
    const actionIndex = this.actions.findIndex((a) => a.id === id);
    if (actionIndex === -1) return false;

    this.actions.splice(actionIndex, 1);
    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  /**
   * Get all pending actions
   */
  public getPendingActions(): OfflineAction[] {
    return this.actions.filter(
      (a) => a.status === "PENDING" || a.status === "FAILED"
    );
  }

  /**
   * Get actions by entity
   */
  public getActionsByEntity(entity: string): OfflineAction[] {
    return this.actions.filter((a) => a.entity === entity);
  }

  /**
   * Get sync status
   */
  public getSyncStatus(): SyncStatus {
    const pendingActions = this.getPendingActions();
    const syncErrors = this.actions.filter((a) => a.status === "FAILED").length;

    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingActions: pendingActions.length,
      lastSyncTime: this.getLastSyncTime(),
      syncErrors,
    };
  }

  /**
   * Subscribe to sync status changes
   */
  public subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Start auto-sync
   */
  public startAutoSync(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.config.enableAutoSync) {
        this.syncPendingActions();
      }
    }, this.config.syncInterval);
  }

  /**
   * Stop auto-sync
   */
  public stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Manually trigger sync
   */
  public async syncPendingActions(): Promise<void> {
    if (!this.isOnline || this.isSyncing) return;

    const pendingActions = this.getPendingActions();
    if (pendingActions.length === 0) return;

    this.isSyncing = true;
    this.notifyListeners();

    try {
      for (const action of pendingActions) {
        await this.syncAction(action);
      }
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Sync a single action
   */
  private async syncAction(action: OfflineAction): Promise<void> {
    try {
      this.updateAction(action.id, { status: "SYNCING" });

      // Simulate API call based on action type
      const result = await this.executeAction(action);

      if (result.success) {
        this.updateAction(action.id, { status: "SUCCESS" });
        // Remove successful action after a delay
        setTimeout(() => this.removeAction(action.id), 5000);
      } else {
        throw new Error(result.error || "Sync failed");
      }
    } catch (error) {
      const retryCount = action.retryCount + 1;

      if (retryCount >= action.maxRetries) {
        this.updateAction(action.id, {
          status: "FAILED",
          retryCount,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } else {
        this.updateAction(action.id, {
          status: "PENDING",
          retryCount,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        // Retry after delay
        setTimeout(() => {
          if (this.isOnline) {
            this.syncAction(action);
          }
        }, this.config.retryDelay);
      }
    }
  }

  /**
   * Execute an action (simulate API call)
   */
  private async executeAction(
    action: OfflineAction
  ): Promise<{ success: boolean; error?: string }> {
    // In a real implementation, this would make actual API calls
    // For now, we'll simulate with a delay and occasional failures

    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    );

    // Simulate occasional failures
    if (Math.random() < 0.1) {
      throw new Error("Simulated network error");
    }

    return { success: true };
  }

  /**
   * Clear all actions
   */
  public clearAllActions(): void {
    this.actions = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Clear failed actions
   */
  public clearFailedActions(): void {
    this.actions = this.actions.filter((a) => a.status !== "FAILED");
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<OfflineConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart auto-sync if interval changed
    if (newConfig.syncInterval) {
      this.stopAutoSync();
      this.startAutoSync();
    }
  }

  /**
   * Get configuration
   */
  public getConfig(): OfflineConfig {
    return { ...this.config };
  }

  /**
   * Save actions to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem("offline_actions", JSON.stringify(this.actions));
    } catch (error) {
      console.error("Failed to save offline actions:", error);
    }
  }

  /**
   * Load actions from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("offline_actions");
      const parsed = safeParseJson(stored, [] as unknown[]);
      this.actions = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to load offline actions:", error);
      this.actions = [];
    }
  }

  /**
   * Notify listeners of status changes
   */
  private notifyListeners(): void {
    const status = this.getSyncStatus();
    this.listeners.forEach((listener) => listener(status));
  }

  /**
   * Get last sync time
   */
  private getLastSyncTime(): number | null {
    const successfulActions = this.actions.filter(
      (a) => a.status === "SUCCESS"
    );
    if (successfulActions.length === 0) return null;

    return Math.max(...successfulActions.map((a) => a.timestamp));
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get statistics
   */
  public getStatistics(): {
    totalActions: number;
    pendingActions: number;
    successfulActions: number;
    failedActions: number;
    syncingActions: number;
  } {
    return {
      totalActions: this.actions.length,
      pendingActions: this.actions.filter((a) => a.status === "PENDING").length,
      successfulActions: this.actions.filter((a) => a.status === "SUCCESS")
        .length,
      failedActions: this.actions.filter((a) => a.status === "FAILED").length,
      syncingActions: this.actions.filter((a) => a.status === "SYNCING").length,
    };
  }
}

// Export singleton instance
export const offlineManager = OfflineManager.getInstance();

// React hook for offline functionality
export function useOfflineManager() {
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus>(() =>
    offlineManager.getSyncStatus()
  );

  React.useEffect(() => {
    const unsubscribe = offlineManager.subscribe(setSyncStatus);
    return unsubscribe;
  }, []);

  return {
    ...syncStatus,
    addAction: offlineManager.addAction.bind(offlineManager),
    updateAction: offlineManager.updateAction.bind(offlineManager),
    removeAction: offlineManager.removeAction.bind(offlineManager),
    getPendingActions: offlineManager.getPendingActions.bind(offlineManager),
    getActionsByEntity: offlineManager.getActionsByEntity.bind(offlineManager),
    syncPendingActions: offlineManager.syncPendingActions.bind(offlineManager),
    clearAllActions: offlineManager.clearAllActions.bind(offlineManager),
    clearFailedActions: offlineManager.clearFailedActions.bind(offlineManager),
    getStatistics: offlineManager.getStatistics.bind(offlineManager),
  };
}
