/**
 * Test Auth Persistence
 * Script để test tính năng lưu trữ phiên đăng nhập
 */

import { authPersistence } from '../lib/auth-persistence';
import { supabase } from '../lib/supabase-config';

export const testAuthPersistence = {
  /**
   * Test basic storage and retrieval
   */
  async testBasicStorage(): Promise<boolean> {
    console.log('🧪 Testing basic auth storage...');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        console.log('❌ No active session to test');
        return false;
      }

      // Save auth data
      await authPersistence.saveAuthData(session.user, session);
      console.log('✅ Auth data saved');

      // Restore auth data
      const restored = await authPersistence.restoreAuthData();
      if (restored) {
        console.log('✅ Auth data restored successfully');
        console.log('📋 Restored user:', restored.user.email);
        return true;
      } else {
        console.log('❌ Failed to restore auth data');
        return false;
      }
    } catch (error) {
      console.error('❌ Test failed:', error);
      return false;
    }
  },

  /**
   * Test session validity checking
   */
  async testSessionValidity(): Promise<void> {
    console.log('🧪 Testing session validity...');

    const restored = await authPersistence.restoreAuthData();
    if (restored) {
      console.log('✅ Session is valid');
      console.log(`📅 Last activity: ${new Date(restored.lastActivity).toLocaleString()}`);
    } else {
      console.log('❌ No valid session found');
    }
  },

  /**
   * Test IndexedDB storage
   */
  async testIndexedDBStorage(): Promise<boolean> {
    console.log('🧪 Testing IndexedDB storage...');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        console.log('❌ No active session to test');
        return false;
      }

      // This will automatically save to IndexedDB
      await authPersistence.saveAuthData(session.user, session);

      // Clear localStorage to force IndexedDB recovery
      localStorage.removeItem('nlc_auth_backup');
      sessionStorage.removeItem('nlc_auth_backup');

      const restored = await authPersistence.restoreAuthData();
      if (restored) {
        console.log('✅ IndexedDB storage works');
        return true;
      } else {
        console.log('❌ IndexedDB storage failed');
        return false;
      }
    } catch (error) {
      console.error('❌ IndexedDB test failed:', error);
      return false;
    }
  },

  /**
   * Test activity tracking
   */
  testActivityTracking(): void {
    console.log('🧪 Testing activity tracking...');

    // Start tracking
    authPersistence.startActivityTracking();

    // Simulate user activity
    setTimeout(() => {
      const event = new Event('click');
      document.dispatchEvent(event);
      console.log('✅ Activity event simulated');

      setTimeout(() => {
        const lastUser = authPersistence.getLastUserData();
        if (lastUser) {
          console.log('✅ Activity tracking works');
          console.log('📋 Last user data:', lastUser);
        } else {
          console.log('❌ Activity tracking failed');
        }
      }, 1000);
    }, 1000);
  },

  /**
   * Test recovery after manual session clear
   */
  async testRecoveryAfterClear(): Promise<boolean> {
    console.log('🧪 Testing recovery after session clear...');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        console.log('❌ No active session to test');
        return false;
      }

      // Save auth data first
      await authPersistence.saveAuthData(session.user, session);

      // Manually sign out to clear Supabase session
      await supabase.auth.signOut();
      console.log('📤 Signed out manually');

      // Try to restore
      const restored = await authPersistence.restoreSupabaseSession();
      if (restored) {
        console.log('✅ Session recovered successfully');
        return true;
      } else {
        console.log('❌ Failed to recover session');
        return false;
      }
    } catch (error) {
      console.error('❌ Recovery test failed:', error);
      return false;
    }
  },

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Running all auth persistence tests...');
    console.log('========================');

    const results = {
      basicStorage: await this.testBasicStorage(),
      indexedDB: await this.testIndexedDBStorage(),
      recovery: await this.testRecoveryAfterClear(),
    };

    console.log('========================');
    console.log('📊 Test Results:');
    console.log(`Basic Storage: ${results.basicStorage ? '✅' : '❌'}`);
    console.log(`IndexedDB: ${results.indexedDB ? '✅' : '❌'}`);
    console.log(`Recovery: ${results.recovery ? '✅' : '❌'}`);

    await this.testSessionValidity();
    this.testActivityTracking();

    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.values(results).length;

    console.log(`\n🎯 ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
      console.log('🎉 All auth persistence features working correctly!');
    } else {
      console.log('⚠️ Some features need attention');
    }
  }
};

// Để chạy tests từ console:
// testAuthPersistence.runAllTests()

export default testAuthPersistence;