/**
 * Homepage E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display homepage with main navigation', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Nam Long Center/);

    // Check main navigation elements
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.getByRole('link', { name: /trang chủ/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /khóa học/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sản phẩm/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /tài nguyên/i })).toBeVisible();
  });

  test('should display hero section', async ({ page }) => {
    // Check hero section elements
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();

    // Check for main heading
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Check for call-to-action buttons
    const ctaButtons = page.locator('button, a').filter({ hasText: /bắt đầu|tìm hiểu|đăng ký/i });
    await expect(ctaButtons.first()).toBeVisible();
  });

  test('should have functional search', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="tìm"]');

    if (await searchInput.count() > 0) {
      await searchInput.first().fill('React');
      await searchInput.first().press('Enter');

      // Should navigate to search results or show results
      await page.waitForTimeout(1000);

      // Check if search results are displayed or URL changed
      const url = page.url();
      const hasResults = await page.locator('[data-testid="search-results"]').count() > 0;

      expect(url.includes('search') || url.includes('React') || hasResults).toBeTruthy();
    }
  });

  test('should navigate to course page', async ({ page }) => {
    const courseLink = page.getByRole('link', { name: /khóa học/i });
    await courseLink.click();

    // Should navigate to courses page
    await expect(page).toHaveURL(/.*khoa-hoc|course.*/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should navigate to products page', async ({ page }) => {
    const productLink = page.getByRole('link', { name: /sản phẩm/i });
    await productLink.click();

    // Should navigate to products page
    await expect(page).toHaveURL(/.*san-pham|product.*/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should navigate to marketplace', async ({ page }) => {
    const marketplaceLink = page.getByRole('link', { name: /marketplace|thị trường/i });

    if (await marketplaceLink.count() > 0) {
      await marketplaceLink.click();
      await expect(page).toHaveURL(/.*marketplace.*/);
    }
  });

  test('should display footer with links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Check for common footer links
    await expect(footer.getByRole('link')).toHaveCount({ min: 3 });
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Check mobile menu toggle
      const mobileMenuToggle = page.locator('[aria-label*="menu"], [data-testid="mobile-menu-toggle"]');

      if (await mobileMenuToggle.count() > 0) {
        await mobileMenuToggle.click();

        // Mobile navigation should be visible
        const mobileNav = page.locator('[data-testid="mobile-nav"], nav[aria-expanded="true"]');
        await expect(mobileNav).toBeVisible();
      }
    }
  });

  test('should handle theme toggle if available', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"], button[aria-label*="theme"]');

    if (await themeToggle.count() > 0) {
      await themeToggle.click();

      // Check if theme changed (dark/light class on html or body)
      const htmlElement = page.locator('html');
      const bodyElement = page.locator('body');

      const htmlClass = await htmlElement.getAttribute('class');
      const bodyClass = await bodyElement.getAttribute('class');

      expect(
        htmlClass?.includes('dark') ||
        htmlClass?.includes('light') ||
        bodyClass?.includes('dark') ||
        bodyClass?.includes('light')
      ).toBeTruthy();
    }
  });

  test('should load without console errors', async ({ page }) => {
    const messages: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        messages.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known acceptable errors
    const criticalErrors = messages.filter(msg =>
      !msg.includes('favicon') &&
      !msg.includes('404') &&
      !msg.includes('Failed to fetch')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should have good performance metrics', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check basic performance
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });

    // DOM should load within reasonable time (5 seconds)
    expect(performanceMetrics.domContentLoaded).toBeLessThan(5000);
  });
});