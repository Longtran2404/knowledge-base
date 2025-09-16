/**
 * Invoice Generation & PDF Export System
 * Generate professional invoices with PDF export capability
 */

import { Order } from '../order/order-manager';
import { formatPrice, formatDate } from '../shared';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  userId: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    taxCode?: string;
  };
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    taxCode: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  status: 'draft' | 'issued' | 'paid' | 'cancelled';
  issuedAt?: string;
  dueDate?: string;
  paidAt?: string;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
}

export interface InvoiceTemplate {
  headerColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl?: string;
  showLogo: boolean;
  showTax: boolean;
  showDiscount: boolean;
  footerText?: string;
}

class InvoiceGenerator {
  private defaultCompanyInfo = {
    name: 'Nam Long Center',
    address: 'Tầng 5, Toà nhà ABC, 123 Đường XYZ, Quận 1, TP. Hồ Chí Minh',
    phone: '(028) 1234 5678',
    email: 'info@namlongcenter.vn',
    website: 'www.namlongcenter.vn',
    taxCode: '0123456789',
  };

  private defaultTemplate: InvoiceTemplate = {
    headerColor: '#1e40af',
    accentColor: '#3b82f6',
    fontFamily: 'Inter, system-ui, sans-serif',
    showLogo: true,
    showTax: true,
    showDiscount: true,
    footerText: 'Cảm ơn bạn đã tin tướng và sử dụng dịch vụ của Nam Long Center!',
  };

  /**
   * Create invoice from order
   */
  createInvoiceFromOrder(order: Order, customerInfo: Invoice['customerInfo']): Invoice {
    const invoiceNumber = this.generateInvoiceNumber();

    const invoice: Invoice = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      invoiceNumber,
      orderId: order.id,
      userId: order.userId,
      customerInfo,
      companyInfo: this.defaultCompanyInfo,
      items: order.items.map(item => ({
        description: item.title + (item.description ? ` - ${item.description}` : ''),
        quantity: item.quantity,
        unitPrice: item.price,
        discount: item.discount || 0,
        amount: (item.price * item.quantity) - (item.discount || 0),
        taxRate: 10, // 10% VAT
        taxAmount: Math.round(((item.price * item.quantity) - (item.discount || 0)) * 0.1),
      })),
      subtotal: order.subtotal,
      discount: order.discount,
      tax: order.tax,
      total: order.total,
      currency: order.currency,
      status: order.status === 'completed' ? 'paid' : 'issued',
      issuedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      paidAt: order.paidAt,
      notes: order.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return invoice;
  }

  /**
   * Generate HTML invoice
   */
  generateHTML(invoice: Invoice, template: InvoiceTemplate = this.defaultTemplate): string {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hóa đơn ${invoice.invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ${template.fontFamily};
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }

        .invoice-container {
            max-width: 800px;
            margin: 20px auto;
            padding: 40px;
            background: #fff;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid ${template.headerColor};
        }

        .company-info {
            flex: 1;
        }

        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: ${template.headerColor};
            margin-bottom: 10px;
        }

        .company-details {
            color: #666;
            font-size: 12px;
        }

        .invoice-info {
            text-align: right;
        }

        .invoice-title {
            font-size: 28px;
            font-weight: bold;
            color: ${template.headerColor};
            margin-bottom: 10px;
        }

        .invoice-number {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
        }

        .invoice-date {
            font-size: 12px;
            color: #999;
        }

        .customer-info {
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }

        .customer-title {
            font-size: 16px;
            font-weight: bold;
            color: ${template.headerColor};
            margin-bottom: 10px;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        .items-table th {
            background: ${template.headerColor};
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
        }

        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
        }

        .items-table tr:nth-child(even) {
            background: #f8f9fa;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .summary {
            margin-left: auto;
            width: 300px;
        }

        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }

        .summary-total {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            font-size: 18px;
            font-weight: bold;
            color: ${template.headerColor};
            border-top: 2px solid ${template.headerColor};
            border-bottom: 2px solid ${template.headerColor};
        }

        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 12px;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-paid {
            background: #dcfce7;
            color: #166534;
        }

        .status-issued {
            background: #fef3c7;
            color: #d97706;
        }

        .status-cancelled {
            background: #fee2e2;
            color: #dc2626;
        }

        @media print {
            body { margin: 0; }
            .invoice-container {
                box-shadow: none;
                margin: 0;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <div class="company-name">${invoice.companyInfo.name}</div>
                <div class="company-details">
                    ${invoice.companyInfo.address}<br>
                    Điện thoại: ${invoice.companyInfo.phone}<br>
                    Email: ${invoice.companyInfo.email}<br>
                    Website: ${invoice.companyInfo.website}<br>
                    Mã số thuế: ${invoice.companyInfo.taxCode}
                </div>
            </div>
            <div class="invoice-info">
                <div class="invoice-title">HÓA ĐƠN</div>
                <div class="invoice-number">Số: ${invoice.invoiceNumber}</div>
                <div class="invoice-date">Ngày: ${formatDate(invoice.issuedAt || invoice.createdAt)}</div>
                <div style="margin-top: 10px;">
                    <span class="status-badge status-${invoice.status}">${this.getStatusText(invoice.status)}</span>
                </div>
            </div>
        </div>

        <!-- Customer Information -->
        <div class="customer-info">
            <div class="customer-title">THÔNG TIN KHÁCH HÀNG</div>
            <div><strong>Họ tên:</strong> ${invoice.customerInfo.name}</div>
            <div><strong>Email:</strong> ${invoice.customerInfo.email}</div>
            ${invoice.customerInfo.phone ? `<div><strong>Điện thoại:</strong> ${invoice.customerInfo.phone}</div>` : ''}
            ${invoice.customerInfo.address ? `<div><strong>Địa chỉ:</strong> ${invoice.customerInfo.address}</div>` : ''}
            ${invoice.customerInfo.taxCode ? `<div><strong>Mã số thuế:</strong> ${invoice.customerInfo.taxCode}</div>` : ''}
        </div>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 50%">Mô tả</th>
                    <th class="text-center" style="width: 10%">SL</th>
                    <th class="text-right" style="width: 15%">Đơn giá</th>
                    ${template.showDiscount ? '<th class="text-right" style="width: 10%">Giảm giá</th>' : ''}
                    <th class="text-right" style="width: 15%">Thành tiền</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td class="text-center">${item.quantity}</td>
                        <td class="text-right">${formatPrice(item.unitPrice)}</td>
                        ${template.showDiscount ? `<td class="text-right">${item.discount > 0 ? formatPrice(item.discount) : '-'}</td>` : ''}
                        <td class="text-right">${formatPrice(item.amount)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <!-- Summary -->
        <div class="summary">
            <div class="summary-row">
                <span>Tạm tính:</span>
                <span>${formatPrice(invoice.subtotal)}</span>
            </div>
            ${invoice.discount > 0 && template.showDiscount ? `
                <div class="summary-row">
                    <span>Giảm giá:</span>
                    <span>-${formatPrice(invoice.discount)}</span>
                </div>
            ` : ''}
            ${invoice.tax > 0 && template.showTax ? `
                <div class="summary-row">
                    <span>Thuế VAT (10%):</span>
                    <span>${formatPrice(invoice.tax)}</span>
                </div>
            ` : ''}
            <div class="summary-total">
                <span>TỔNG CỘNG:</span>
                <span>${formatPrice(invoice.total)}</span>
            </div>
        </div>

        ${invoice.notes ? `
            <div style="margin-top: 30px;">
                <strong>Ghi chú:</strong><br>
                ${invoice.notes}
            </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
            ${template.footerText || 'Cảm ơn bạn đã tin tướng và sử dụng dịch vụ của chúng tôi!'}<br>
            <small>Hóa đơn được tạo tự động bởi hệ thống Nam Long Center</small>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate PDF buffer (requires server-side implementation)
   */
  async generatePDF(invoice: Invoice, template?: InvoiceTemplate): Promise<Blob> {
    const html = this.generateHTML(invoice, template);

    // For browser environment, use html2pdf library
    if (typeof window !== 'undefined') {
      try {
        // Dynamic import for client-side only
        const html2pdf = (await import('html2pdf.js')).default;

        const options = {
          margin: 10,
          filename: `invoice_${invoice.invoiceNumber}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        return await html2pdf()
          .from(html)
          .set(options)
          .outputPdf('blob');
      } catch (error) {
        throw new Error('PDF generation requires html2pdf.js library');
      }
    }

    // For server-side, would use puppeteer or similar
    throw new Error('PDF generation not available in this environment');
  }

  /**
   * Download PDF invoice
   */
  async downloadPDF(invoice: Invoice, template?: InvoiceTemplate): Promise<void> {
    try {
      const pdfBlob = await this.generatePDF(invoice, template);

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${invoice.invoiceNumber}.pdf`;

      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`Failed to download PDF: ${error}`);
    }
  }

  /**
   * Print invoice
   */
  printInvoice(invoice: Invoice, template?: InvoiceTemplate): void {
    const html = this.generateHTML(invoice, template);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }
  }

  /**
   * Generate invoice number
   */
  private generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    return `INV${year}${month}${sequence}`;
  }

  /**
   * Get status text in Vietnamese
   */
  private getStatusText(status: Invoice['status']): string {
    const statusMap = {
      draft: 'Nháp',
      issued: 'Đã phát hành',
      paid: 'Đã thanh toán',
      cancelled: 'Đã hủy',
    };

    return statusMap[status] || status;
  }
}

// Export singleton instance
export const invoiceGenerator = new InvoiceGenerator();
export default invoiceGenerator;