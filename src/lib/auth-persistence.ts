/**
 * Authentication Persistence Service
 * Quản lý việc lưu trữ và khôi phục phiên đăng nhập
 */

import { supabase } from './supabase-config';
import type { User, Session } from '@supabase/supabase-js';

export interface StoredAuthData {
  user: User;
  session: Session;
  lastActivity: number;
  deviceInfo: {
    userAgent: string;
    timestamp: number;
  };
}

class AuthPersistenceService {
  private readonly STORAGE_KEY = 'nlc_auth_backup';
  private readonly USER_DATA_KEY = 'nlc_user_data';
  private readonly SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
  private readonly ACTIVITY_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

  /**
   * Lưu thông tin auth vào multiple storage layers
   */
  async saveAuthData(user: User, session: Session): Promise<void> {
    const authData: StoredAuthData = {
      user,
      session,
      lastActivity: Date.now(),
      deviceInfo: {
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      }
    };

    try {
      // Layer 1: localStorage (primary)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));

      // Layer 2: sessionStorage (fallback)
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));

      // Layer 3: IndexedDB (persistent across private browsing)
      await this.saveToIndexedDB(authData);

      // Layer 4: User-specific data
      const userData = {
        email: user.email,
        id: user.id,
        lastSeen: Date.now(),
        fullName: user.user_metadata?.full_name
      };
      localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));

      // console.log('✅ Auth data saved to multiple layers');
    } catch (error) {
      console.warn('⚠️ Failed to save auth data:', error);
    }
  }

  /**
   * Khôi phục thông tin auth từ storage
   */
  async restoreAuthData(): Promise<StoredAuthData | null> {
    try {
      // Try Layer 1: localStorage
      let stored = localStorage.getItem(this.STORAGE_KEY);

      // Try Layer 2: sessionStorage if localStorage fails
      if (!stored) {
        stored = sessionStorage.getItem(this.STORAGE_KEY);
      }

      // Try Layer 3: IndexedDB if both fail
      if (!stored) {
        const indexedData = await this.getFromIndexedDB();
        if (indexedData) {
          stored = JSON.stringify(indexedData);
        }
      }

      if (!stored) return null;

      const authData: StoredAuthData = JSON.parse(stored);

      // Check if session is still valid
      if (!this.isSessionValid(authData)) {
        await this.clearAllAuthData();
        return null;
      }

      // console.log('✅ Auth data restored from storage');
      return authData;
    } catch (error) {
      console.warn('⚠️ Failed to restore auth data:', error);
      return null;
    }
  }

  /**
   * Cập nhật last activity
   */
  updateLastActivity(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const authData: StoredAuthData = JSON.parse(stored);
        authData.lastActivity = Date.now();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));
      }
    } catch (error) {
      console.warn('⚠️ Failed to update last activity:', error);
    }
  }

  /**
   * Kiểm tra session có còn valid không
   */
  private isSessionValid(authData: StoredAuthData): boolean {
    const now = Date.now();
    const sessionAge = now - authData.lastActivity;

    // Session expired after 30 days
    if (sessionAge > this.SESSION_DURATION) {
      return false;
    }

    // Session token expiry check
    if (authData.session.expires_at) {
      const expiryTime = new Date(authData.session.expires_at).getTime();
      if (now >= expiryTime) {
        return false;
      }
    }

    return true;
  }

  /**
   * Xóa tất cả auth data
   */
  async clearAllAuthData(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.USER_DATA_KEY);
      sessionStorage.removeItem(this.STORAGE_KEY);
      await this.clearIndexedDB();
      // console.log('✅ All auth data cleared');
    } catch (error) {
      console.warn('⚠️ Failed to clear auth data:', error);
    }
  }

  /**
   * Khôi phục session với Supabase
   */
  async restoreSupabaseSession(): Promise<boolean> {
    try {
      console.log('🔄 Checking for existing session...');

      // First check if Supabase already has a session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        console.log('✅ Active session found in Supabase, saving to storage');
        await this.saveAuthData(currentSession.user, currentSession);
        return true;
      }

      console.log('🔄 No active session, attempting to restore from storage...');
      const authData = await this.restoreAuthData();
      if (!authData) {
        console.log('❌ No auth data found in storage');
        return false;
      }

      console.log('✅ Auth data found, restoring session...');

      // Check if tokens are still valid
      const now = Date.now();
      if (authData.session.expires_at) {
        const expiryTime = new Date(authData.session.expires_at).getTime();
        if (now >= expiryTime) {
          console.log('❌ Session expired, clearing data');
          await this.clearAllAuthData();
          return false;
        }
      }

      // Set session in Supabase
      const { data, error } = await supabase.auth.setSession({
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
      });

      if (error) {
        console.warn('⚠️ Failed to restore Supabase session:', error);
        await this.clearAllAuthData();
        return false;
      }

      if (data?.session) {
        console.log('✅ Supabase session restored successfully');
        // Update with the fresh session data
        await this.saveAuthData(data.user!, data.session);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error restoring Supabase session:', error);
      await this.clearAllAuthData();
      return false;
    }
  }

  /**
   * Lưu vào IndexedDB
   */
  private async saveToIndexedDB(authData: StoredAuthData): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open('NamLongCenterAuth', 1);

        request.onerror = () => {
          console.warn('IndexedDB open failed');
          resolve(); // Don't reject, just skip IndexedDB
        };

        request.onsuccess = () => {
          try {
            const db = request.result;

            // Check if object store exists
            if (!db.objectStoreNames.contains('auth')) {
              console.warn('Auth object store not found');
              resolve();
              return;
            }

            const transaction = db.transaction(['auth'], 'readwrite');
            const store = transaction.objectStore('auth');

            // Save user profile data to Supabase (but don't let it block IndexedDB)
            this.saveUserProfileToDatabase(authData.user)
              .catch(error => console.warn('Failed to save user profile:', error));

            store.put({ id: 'current', data: authData });

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => {
              console.warn('IndexedDB transaction failed');
              resolve(); // Don't reject
            };
          } catch (error) {
            console.warn('IndexedDB save error:', error);
            resolve(); // Don't reject
          }
        };

        request.onupgradeneeded = (event) => {
          try {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('auth')) {
              db.createObjectStore('auth', { keyPath: 'id' });
            }
          } catch (error) {
            console.warn('IndexedDB upgrade error:', error);
            resolve(); // Don't reject
          }
        };
      } catch (error) {
        console.warn('IndexedDB not available:', error);
        resolve(); // Don't reject, just skip IndexedDB
      }
    });
  }

  /**
   * Lấy từ IndexedDB
   */
  private async getFromIndexedDB(): Promise<StoredAuthData | null> {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open('NamLongCenterAuth', 1);

        request.onerror = () => resolve(null);

        request.onsuccess = () => {
          try {
            const db = request.result;

            // Check if object store exists
            if (!db.objectStoreNames.contains('auth')) {
              resolve(null);
              return;
            }

            const transaction = db.transaction(['auth'], 'readonly');
            const store = transaction.objectStore('auth');
            const getRequest = store.get('current');

            getRequest.onsuccess = () => {
              resolve(getRequest.result?.data || null);
            };

            getRequest.onerror = () => resolve(null);
          } catch (error) {
            console.warn('IndexedDB read error:', error);
            resolve(null);
          }
        };

        request.onupgradeneeded = (event) => {
          try {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('auth')) {
              db.createObjectStore('auth', { keyPath: 'id' });
            }
          } catch (error) {
            console.warn('IndexedDB upgrade error:', error);
          }
          resolve(null);
        };
      } catch (error) {
        console.warn('IndexedDB access error:', error);
        resolve(null);
      }
    });
  }

  /**
   * Save user profile to database (disabled until schema is ready)
   */
  private async saveUserProfileToDatabase(user: User): Promise<void> {
    try {
      // TODO: Enable after database schema is updated
      console.log('User profile save disabled - waiting for schema update:', user.email);
      // const { error } = await supabase
      //   .from('users')
      //   .upsert({
      //     id: user.id,
      //     email: user.email || '',
      //     full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      //     role: 'student',
      //     email_verified: user.email_confirmed_at ? true : false,
      //     email_verified_at: user.email_confirmed_at,
      //     last_login_at: new Date().toISOString(),
      //     login_count: 1,
      //     updated_at: new Date().toISOString()
      //   }, {
      //     onConflict: 'id'
      //   });

      // if (error && error.code !== '23505') { // Ignore unique constraint violations
      //   console.warn('Failed to save user profile to database:', error);
      // }
    } catch (error) {
      console.warn('Error saving user profile to database:', error);
    }
  }

  /**
   * Xóa IndexedDB
   */
  private async clearIndexedDB(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open('NamLongCenterAuth', 1);

        request.onsuccess = () => {
          try {
            const db = request.result;

            // Check if object store exists before using it
            if (!db.objectStoreNames.contains('auth')) {
              console.warn('Auth object store not found during clear');
              resolve();
              return;
            }

            const transaction = db.transaction(['auth'], 'readwrite');
            const store = transaction.objectStore('auth');
            store.clear();
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => {
              console.warn('IndexedDB clear transaction failed');
              resolve();
            };
          } catch (error) {
            console.warn('IndexedDB clear error:', error);
            resolve();
          }
        };

        request.onerror = () => {
          console.warn('IndexedDB open failed during clear');
          resolve();
        };

        request.onupgradeneeded = () => {
          // If upgrade is needed, just resolve as database is being recreated
          resolve();
        };
      } catch (error) {
        console.warn('IndexedDB clear error:', error);
        resolve();
      }
    });
  }

  /**
   * Thiết lập auto activity tracking
   */
  startActivityTracking(): void {
    // Update activity on user interaction
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const updateActivity = () => this.updateLastActivity();

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Periodic activity update
    setInterval(() => {
      this.updateLastActivity();
    }, this.ACTIVITY_UPDATE_INTERVAL);

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updateLastActivity();
      }
    });
  }

  /**
   * Lấy thông tin user cuối cùng (để hiển thị UI)
   */
  getLastUserData(): { email?: string; fullName?: string } | null {
    try {
      const userData = localStorage.getItem(this.USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }
}

export const authPersistence = new AuthPersistenceService();