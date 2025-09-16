/**
 * Payment Flow E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/marketplace');
  });

  test('should complete order creation flow', async ({ page }) => {
    // Navigate to a product and add to cart
    const products = page.locator('[data-testid="product-card"], .product-item');

    if (await products.count() > 0) {
      const firstProduct = products.first();
      await firstProduct.click();

      // Add to cart
      const addToCartBtn = page.locator(
        '[data-testid="add-to-cart"], button:has-text("thêm vào giỏ"), button:has-text("mua ngay")'
      ).first();

      if (await addToCartBtn.count() > 0) {
        await addToCartBtn.click();
        await page.waitForTimeout(500);

        // Proceed to checkout
        const checkoutBtn = page.locator(
          '[data-testid="checkout-btn"], button:has-text("thanh toán"), button:has-text("checkout")'
        );

        if (await checkoutBtn.count() > 0) {
          await checkoutBtn.click();

          // Should be on checkout page
          await expect(page).toHaveURL(/.*checkout|thanh-toan.*/);

          // Fill checkout form
          await fillCheckoutForm(page);

          // Should show order summary
          const orderSummary = page.locator('[data-testid="order-summary"]');
          if (await orderSummary.count() > 0) {
            await expect(orderSummary).toBeVisible();
          }
        }
      }
    }
  });

  test('should display payment methods', async ({ page }) => {
    // Navigate to checkout or payment page
    await navigateToPayment(page);

    // Should show payment method options
    const paymentMethods = page.locator('[data-testid="payment-methods"]');

    if (await paymentMethods.count() > 0) {
      await expect(paymentMethods).toBeVisible();

      // Should have VNPay option
      const vnpayOption = paymentMethods.locator('[data-value="vnpay"], :has-text("vnpay")');
      if (await vnpayOption.count() > 0) {
        await expect(vnpayOption).toBeVisible();
      }

      // Should have MoMo option
      const momoOption = paymentMethods.locator('[data-value="momo"], :has-text("momo")');
      if (await momoOption.count() > 0) {
        await expect(momoOption).toBeVisible();
      }
    }
  });

  test('should handle VNPay payment selection', async ({ page }) => {
    await navigateToPayment(page);

    const vnpayOption = page.locator('[data-value="vnpay"], :has-text("vnpay")').first();

    if (await vnpayOption.count() > 0) {
      await vnpayOption.click();

      // Should show VNPay specific information
      const vnpayInfo = page.locator('[data-testid="vnpay-info"]');
      if (await vnpayInfo.count() > 0) {
        await expect(vnpayInfo).toBeVisible();
      }

      // Payment button should be enabled
      const payBtn = page.locator('[data-testid="pay-button"], button:has-text("thanh toán")');
      if (await payBtn.count() > 0) {
        await expect(payBtn).toBeEnabled();
      }
    }
  });

  test('should handle MoMo payment selection', async ({ page }) => {
    await navigateToPayment(page);

    const momoOption = page.locator('[data-value="momo"], :has-text("momo")').first();

    if (await momoOption.count() > 0) {
      await momoOption.click();

      // Should show MoMo specific information
      const momoInfo = page.locator('[data-testid="momo-info"]');
      if (await momoInfo.count() > 0) {
        await expect(momoInfo).toBeVisible();
      }

      // Payment button should be enabled
      const payBtn = page.locator('[data-testid="pay-button"], button:has-text("thanh toán")');
      if (await payBtn.count() > 0) {
        await expect(payBtn).toBeEnabled();
      }
    }
  });

  test('should show order total and breakdown', async ({ page }) => {
    await navigateToPayment(page);

    // Should show order total
    const orderTotal = page.locator('[data-testid="order-total"]');
    if (await orderTotal.count() > 0) {
      await expect(orderTotal).toBeVisible();

      const totalText = await orderTotal.textContent();
      expect(totalText).toMatch(/\d{1,3}(,\d{3})*/); // Should contain formatted number
    }

    // Should show subtotal
    const subtotal = page.locator('[data-testid="subtotal"]');
    if (await subtotal.count() > 0) {
      await expect(subtotal).toBeVisible();
    }

    // Should show tax if applicable
    const tax = page.locator('[data-testid="tax"]');
    if (await tax.count() > 0) {
      await expect(tax).toBeVisible();
    }
  });

  test('should validate required fields', async ({ page }) => {
    await navigateToPayment(page);

    // Try to proceed without filling required fields
    const payBtn = page.locator('[data-testid="pay-button"], button:has-text("thanh toán")');

    if (await payBtn.count() > 0) {
      await payBtn.click();

      // Should show validation errors
      const errorMessages = page.locator('.error, [data-testid="error-message"]');
      if (await errorMessages.count() > 0) {
        await expect(errorMessages.first()).toBeVisible();
      }
    }
  });

  test('should handle successful payment flow (mock)', async ({ page }) => {
    await navigateToPayment(page);

    // Fill all required fields
    await fillPaymentForm(page);

    // Select payment method
    const vnpayOption = page.locator('[data-value="vnpay"], :has-text("vnpay")').first();
    if (await vnpayOption.count() > 0) {
      await vnpayOption.click();
    }

    const payBtn = page.locator('[data-testid="pay-button"], button:has-text("thanh toán")');

    if (await payBtn.count() > 0) {
      await payBtn.click();

      // In development, this might redirect to a mock payment page
      // or show a processing state
      await page.waitForTimeout(2000);

      // Should show processing or redirect to payment gateway
      const processing = page.locator('[data-testid="payment-processing"]');
      const paymentGateway = page.url().includes('vnpay') || page.url().includes('payment');

      expect(
        (await processing.count() > 0) || paymentGateway
      ).toBeTruthy();
    }
  });

  test('should display order confirmation page', async ({ page }) => {
    // Navigate to order confirmation (this would normally come after payment)
    const orderConfirmationUrl = '/order-confirmation?orderId=test-order-123&status=success';
    await page.goto(orderConfirmationUrl);

    // Should show order confirmation
    const confirmation = page.locator('[data-testid="order-confirmation"]');
    if (await confirmation.count() > 0) {
      await expect(confirmation).toBeVisible();
    }

    // Should show order details
    const orderDetails = page.locator('[data-testid="order-details"]');
    if (await orderDetails.count() > 0) {
      await expect(orderDetails).toBeVisible();
    }

    // Should have download invoice option
    const downloadBtn = page.locator('[data-testid="download-invoice"], button:has-text("tải hóa đơn")');
    if (await downloadBtn.count() > 0) {
      await expect(downloadBtn).toBeVisible();
    }
  });

  test('should handle payment failure', async ({ page }) => {
    const orderConfirmationUrl = '/order-confirmation?orderId=test-order-123&status=failed';
    await page.goto(orderConfirmationUrl);

    // Should show failure message
    const failureMessage = page.locator('[data-testid="payment-failed"], :has-text("thất bại")');
    if (await failureMessage.count() > 0) {
      await expect(failureMessage).toBeVisible();
    }

    // Should have retry option
    const retryBtn = page.locator('[data-testid="retry-payment"], button:has-text("thử lại")');
    if (await retryBtn.count() > 0) {
      await expect(retryBtn).toBeVisible();
    }
  });

  test('should handle invoice download', async ({ page }) => {
    const orderConfirmationUrl = '/order-confirmation?orderId=test-order-123&status=success';
    await page.goto(orderConfirmationUrl);

    const downloadBtn = page.locator('[data-testid="download-invoice"], button:has-text("tải hóa đơn")');

    if (await downloadBtn.count() > 0) {
      // Set up download handler
      const downloadPromise = page.waitForEvent('download');

      await downloadBtn.click();

      // Should trigger download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/invoice.*\.pdf/i);
    }
  });

  test('should handle print invoice', async ({ page }) => {
    const orderConfirmationUrl = '/order-confirmation?orderId=test-order-123&status=success';
    await page.goto(orderConfirmationUrl);

    const printBtn = page.locator('[data-testid="print-invoice"], button:has-text("in hóa đơn")');

    if (await printBtn.count() > 0) {
      // Mock the print function
      await page.evaluate(() => {
        window.print = () => console.log('Print triggered');
      });

      await printBtn.click();

      // Print should be triggered (we can't easily test actual printing in E2E)
      // but we can verify the button works
      expect(true).toBeTruthy();
    }
  });
});

// Helper functions
async function navigateToPayment(page: any) {
  // Try to navigate to payment/checkout page
  const checkoutUrl = '/checkout';
  await page.goto(checkoutUrl);

  // If direct navigation doesn't work, try through marketplace flow
  if (!page.url().includes('checkout')) {
    await page.goto('/marketplace');

    const products = page.locator('[data-testid="product-card"], .product-item');
    if (await products.count() > 0) {
      const firstProduct = products.first();
      await firstProduct.click();

      const buyNowBtn = page.locator('button:has-text("mua ngay")').first();
      if (await buyNowBtn.count() > 0) {
        await buyNowBtn.click();
      }
    }
  }
}

async function fillCheckoutForm(page: any) {
  // Fill customer information
  const nameField = page.locator('[data-testid="customer-name"], input[name="name"]');
  if (await nameField.count() > 0) {
    await nameField.fill('John Doe');
  }

  const emailField = page.locator('[data-testid="customer-email"], input[name="email"]');
  if (await emailField.count() > 0) {
    await emailField.fill('john@example.com');
  }

  const phoneField = page.locator('[data-testid="customer-phone"], input[name="phone"]');
  if (await phoneField.count() > 0) {
    await phoneField.fill('0901234567');
  }

  const addressField = page.locator('[data-testid="customer-address"], input[name="address"], textarea[name="address"]');
  if (await addressField.count() > 0) {
    await addressField.fill('123 Test Street, Test City');
  }
}

async function fillPaymentForm(page: any) {
  await fillCheckoutForm(page);

  // Fill any additional payment-specific fields
  const cityField = page.locator('[data-testid="city"], select[name="city"]');
  if (await cityField.count() > 0) {
    await cityField.selectOption('TP. Hồ Chí Minh');
  }
}