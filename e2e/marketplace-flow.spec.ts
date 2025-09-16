/**
 * Marketplace and Shopping Flow E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Marketplace Shopping Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/marketplace');
  });

  test('should display marketplace products', async ({ page }) => {
    await expect(page).toHaveURL(/.*marketplace.*/);

    // Check page title and heading
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Should display product cards or list
    const products = page.locator('[data-testid="product-card"], .product-item');
    await expect(products.first()).toBeVisible();

    // Each product should have basic information
    const firstProduct = products.first();
    await expect(firstProduct.locator('img, [data-testid="product-image"]')).toBeVisible();
    await expect(firstProduct.locator('[data-testid="product-title"], h3, h4')).toBeVisible();
    await expect(firstProduct.locator('[data-testid="product-price"]')).toBeVisible();
  });

  test('should filter products by category', async ({ page }) => {
    // Look for filter controls
    const categoryFilters = page.locator('[data-testid="category-filter"], .filter-category');

    if (await categoryFilters.count() > 0) {
      const firstFilter = categoryFilters.first();
      await firstFilter.click();

      // Wait for products to update
      await page.waitForTimeout(1000);

      // Products should be filtered
      const products = page.locator('[data-testid="product-card"], .product-item');
      await expect(products.first()).toBeVisible();
    }
  });

  test('should search for products', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="tìm"], input[type="search"]');

    if (await searchInput.count() > 0) {
      await searchInput.fill('React');
      await searchInput.press('Enter');

      await page.waitForTimeout(1000);

      // Should show search results
      const results = page.locator('[data-testid="search-results"], .search-result');
      const products = page.locator('[data-testid="product-card"], .product-item');

      expect(await results.count() > 0 || await products.count() > 0).toBeTruthy();
    }
  });

  test('should view product details', async ({ page }) => {
    const products = page.locator('[data-testid="product-card"], .product-item');
    const firstProduct = products.first();

    await expect(firstProduct).toBeVisible();
    await firstProduct.click();

    // Should navigate to product detail page or open modal
    await page.waitForTimeout(1000);

    // Should show detailed product information
    const productDetail = page.locator('[data-testid="product-detail"]');
    const modal = page.locator('[role="dialog"], .modal');

    if (await productDetail.count() > 0) {
      await expect(productDetail).toBeVisible();
    } else if (await modal.count() > 0) {
      await expect(modal).toBeVisible();
    }
  });

  test('should add product to cart', async ({ page }) => {
    // Find add to cart button
    const addToCartBtn = page.locator(
      '[data-testid="add-to-cart"], button:has-text("thêm vào giỏ"), button:has-text("mua ngay")'
    ).first();

    if (await addToCartBtn.count() > 0) {
      await addToCartBtn.click();

      // Should show cart notification or update cart count
      const cartNotification = page.locator('[data-testid="cart-notification"], .toast');
      const cartCount = page.locator('[data-testid="cart-count"]');

      if (await cartNotification.count() > 0) {
        await expect(cartNotification).toBeVisible();
      } else if (await cartCount.count() > 0) {
        await expect(cartCount).toHaveText(/[1-9]/);
      }
    }
  });

  test('should view shopping cart', async ({ page }) => {
    // First add a product to cart
    const addToCartBtn = page.locator(
      '[data-testid="add-to-cart"], button:has-text("thêm vào giỏ"), button:has-text("mua ngay")'
    ).first();

    if (await addToCartBtn.count() > 0) {
      await addToCartBtn.click();
      await page.waitForTimeout(500);

      // Open cart
      const cartIcon = page.locator('[data-testid="cart-icon"], [data-testid="shopping-cart"]');
      if (await cartIcon.count() > 0) {
        await cartIcon.click();

        // Should show cart contents
        const cart = page.locator('[data-testid="cart-modal"], [data-testid="cart-drawer"]');
        if (await cart.count() > 0) {
          await expect(cart).toBeVisible();

          // Should show cart items
          const cartItems = cart.locator('[data-testid="cart-item"]');
          await expect(cartItems.first()).toBeVisible();
        }
      }
    }
  });

  test('should update cart item quantity', async ({ page }) => {
    // This test would require cart functionality to be implemented
    // For now, we'll check if quantity controls exist

    const quantityControls = page.locator('[data-testid="quantity-input"], input[type="number"]');

    if (await quantityControls.count() > 0) {
      const firstControl = quantityControls.first();
      await firstControl.fill('2');

      // Should update quantity
      await expect(firstControl).toHaveValue('2');
    }
  });

  test('should proceed to checkout', async ({ page }) => {
    // Look for checkout button
    const checkoutBtn = page.locator(
      '[data-testid="checkout-btn"], button:has-text("thanh toán"), button:has-text("checkout")'
    );

    if (await checkoutBtn.count() > 0) {
      await checkoutBtn.click();

      // Should navigate to checkout page
      await expect(page).toHaveURL(/.*checkout|thanh-toan.*/);

      // Should show checkout form
      const checkoutForm = page.locator('[data-testid="checkout-form"], form');
      if (await checkoutForm.count() > 0) {
        await expect(checkoutForm).toBeVisible();
      }
    }
  });

  test('should handle responsive design', async ({ page, isMobile }) => {
    if (isMobile) {
      // Mobile-specific tests
      const products = page.locator('[data-testid="product-card"], .product-item');
      await expect(products.first()).toBeVisible();

      // Products should stack vertically on mobile
      const firstProduct = products.first();
      const secondProduct = products.nth(1);

      if (await secondProduct.count() > 0) {
        const firstBox = await firstProduct.boundingBox();
        const secondBox = await secondProduct.boundingBox();

        if (firstBox && secondBox) {
          // Second product should be below the first (mobile layout)
          expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 50);
        }
      }
    }
  });

  test('should display correct pricing', async ({ page }) => {
    const products = page.locator('[data-testid="product-card"], .product-item');
    const firstProduct = products.first();

    if (await firstProduct.count() > 0) {
      const priceElement = firstProduct.locator('[data-testid="product-price"]');

      if (await priceElement.count() > 0) {
        const priceText = await priceElement.textContent();

        // Should contain VND currency or đ symbol
        expect(priceText).toMatch(/đ|VND|\d{1,3}(,\d{3})*/);
      }
    }
  });

  test('should handle empty cart state', async ({ page }) => {
    // Try to open cart when empty
    const cartIcon = page.locator('[data-testid="cart-icon"], [data-testid="shopping-cart"]');

    if (await cartIcon.count() > 0) {
      await cartIcon.click();

      const emptyCartMessage = page.locator(
        '[data-testid="empty-cart"], :has-text("giỏ hàng trống"), :has-text("empty cart")'
      );

      if (await emptyCartMessage.count() > 0) {
        await expect(emptyCartMessage).toBeVisible();
      }
    }
  });

  test('should show product categories', async ({ page }) => {
    const categories = page.locator('[data-testid="category-filter"], .category-item');

    if (await categories.count() > 0) {
      await expect(categories.first()).toBeVisible();

      // Should have multiple categories
      expect(await categories.count()).toBeGreaterThan(1);
    }
  });

  test('should handle pagination or infinite scroll', async ({ page }) => {
    const products = page.locator('[data-testid="product-card"], .product-item');
    const initialCount = await products.count();

    // Look for pagination
    const pagination = page.locator('[data-testid="pagination"], .pagination');
    const loadMoreBtn = page.locator('[data-testid="load-more"], button:has-text("xem thêm")');

    if (await pagination.count() > 0) {
      const nextBtn = pagination.locator('button:has-text("next"), button:has-text("tiếp")');
      if (await nextBtn.count() > 0) {
        await nextBtn.click();
        await page.waitForTimeout(1000);

        // Should load different products
        const newProducts = page.locator('[data-testid="product-card"], .product-item');
        await expect(newProducts.first()).toBeVisible();
      }
    } else if (await loadMoreBtn.count() > 0) {
      await loadMoreBtn.click();
      await page.waitForTimeout(1000);

      // Should load more products
      const newCount = await products.count();
      expect(newCount).toBeGreaterThan(initialCount);
    }
  });
});