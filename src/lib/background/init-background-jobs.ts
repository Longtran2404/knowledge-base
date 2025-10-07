/**
 * Background Jobs Initialization
 * Khởi tạo và quản lý các background jobs
 */

import React from 'react';
import { startGlobalRenewalJob, stopGlobalRenewalJob, getRenewalJobService } from './renewal-job-service';

export interface BackgroundJobsConfig {
  enableRenewalJob: boolean;
  renewalJobConfig?: {
    checkIntervalMs?: number;
    daysBeforeExpiry?: number;
    maxRetryAttempts?: number;
    retryDelayMs?: number;
  };
}

class BackgroundJobsManager {
  private static instance: BackgroundJobsManager;
  private isInitialized = false;
  private config: BackgroundJobsConfig;

  private constructor() {
    this.config = {
      enableRenewalJob: true,
      renewalJobConfig: {
        checkIntervalMs: 60 * 60 * 1000, // 1 hour
        daysBeforeExpiry: 3,
        maxRetryAttempts: 3,
        retryDelayMs: 5 * 60 * 1000 // 5 minutes
      }
    };
  }

  public static getInstance(): BackgroundJobsManager {
    if (!BackgroundJobsManager.instance) {
      BackgroundJobsManager.instance = new BackgroundJobsManager();
    }
    return BackgroundJobsManager.instance;
  }

  /**
   * Khởi tạo tất cả background jobs
   */
  public async initializeJobs(config?: Partial<BackgroundJobsConfig>): Promise<void> {
    if (this.isInitialized) {
      console.log('Background jobs already initialized');
      return;
    }

    // Merge config
    this.config = { ...this.config, ...config };

    console.log('🚀 Initializing background jobs...', this.config);

    try {
      // Khởi tạo renewal job nếu được enable
      if (this.config.enableRenewalJob) {
        await this.initializeRenewalJob();
      }

      this.isInitialized = true;
      console.log('✅ Background jobs initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize background jobs:', error);
      throw error;
    }
  }

  /**
   * Khởi tạo renewal job
   */
  private async initializeRenewalJob(): Promise<void> {
    try {
      console.log('📅 Starting subscription renewal background job...');

      // Chỉ start renewal job trong production hoặc khi có environment variable
      if (process.env.NODE_ENV === 'production' || process.env.REACT_APP_ENABLE_BACKGROUND_JOBS === 'true') {
        startGlobalRenewalJob(this.config.renewalJobConfig);
        console.log('✅ Renewal job started successfully');
      } else {
        console.log('⏸️ Renewal job skipped (not in production environment)');
      }

    } catch (error) {
      console.error('❌ Failed to start renewal job:', error);
      throw error;
    }
  }

  /**
   * Dừng tất cả background jobs
   */
  public async shutdownJobs(): Promise<void> {
    if (!this.isInitialized) {
      console.log('Background jobs not initialized');
      return;
    }

    console.log('🛑 Shutting down background jobs...');

    try {
      // Dừng renewal job
      if (this.config.enableRenewalJob) {
        stopGlobalRenewalJob();
      }

      this.isInitialized = false;
      console.log('✅ Background jobs shut down successfully');

    } catch (error) {
      console.error('❌ Failed to shutdown background jobs:', error);
      throw error;
    }
  }

  /**
   * Chạy renewal job manually (cho testing hoặc admin)
   */
  public async runRenewalJobManually(): Promise<any> {
    console.log('🔄 Running renewal job manually...');

    try {
      const renewalService = getRenewalJobService();
      const result = await renewalService.runRenewalCheck();

      console.log('✅ Manual renewal job completed:', result);
      return result;

    } catch (error) {
      console.error('❌ Manual renewal job failed:', error);
      throw error;
    }
  }

  /**
   * Lấy trạng thái của các jobs
   */
  public getJobsStatus(): any {
    const renewalService = getRenewalJobService();

    return {
      isInitialized: this.isInitialized,
      config: this.config,
      renewalJob: renewalService.getJobStatus()
    };
  }

  /**
   * Cập nhật config của jobs
   */
  public updateConfig(newConfig: Partial<BackgroundJobsConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Cập nhật config của renewal job nếu có
    if (newConfig.renewalJobConfig) {
      const renewalService = getRenewalJobService();
      renewalService.updateConfig(newConfig.renewalJobConfig);
    }

    console.log('📝 Background jobs config updated:', this.config);
  }
}

// Export singleton instance
export const backgroundJobsManager = BackgroundJobsManager.getInstance();

/**
 * Convenience functions
 */
export const initializeBackgroundJobs = (config?: Partial<BackgroundJobsConfig>) => {
  return backgroundJobsManager.initializeJobs(config);
};

export const shutdownBackgroundJobs = () => {
  return backgroundJobsManager.shutdownJobs();
};

export const runManualRenewalJob = () => {
  return backgroundJobsManager.runRenewalJobManually();
};

export const getBackgroundJobsStatus = () => {
  return backgroundJobsManager.getJobsStatus();
};

/**
 * React Hook để quản lý background jobs từ UI
 */
export const useBackgroundJobs = () => {
  const [status, setStatus] = React.useState(getBackgroundJobsStatus());

  const refreshStatus = () => {
    setStatus(getBackgroundJobsStatus());
  };

  const runManualRenewal = async () => {
    try {
      const result = await runManualRenewalJob();
      refreshStatus();
      return result;
    } catch (error) {
      console.error('Manual renewal failed:', error);
      throw error;
    }
  };

  return {
    status,
    refreshStatus,
    runManualRenewal,
    updateConfig: backgroundJobsManager.updateConfig.bind(backgroundJobsManager)
  };
};