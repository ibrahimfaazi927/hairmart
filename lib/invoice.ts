// Invoice generation utility
import { generateQrSvg } from './qrCode';
import { generateHairMartUpiUrl, HAIR_MART_UPI_VPA } from './thermalPrinter';

export interface InvoiceData {
  invoiceNumber: string;
  salonName: string;
  salonPhone?: string;
  salonEmail?: string;
  salonAddress?: string;
  salonLogo?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  appointmentDate: string;
  services: Array<{
    name: string;
    price: number;
  }>;
  packageName?: string;
  productsUsed?: string[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentStatus: string;
  paymentMethod?: string;
  chair?: string;
  section?: string;
  createdAt: string;
}

export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}${day}-${random}`;
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const servicesRows = data.services
    .map(
      (s, i) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #2a2a2a;">${i + 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #2a2a2a;">${s.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #2a2a2a; text-align: right;">₹${s.price.toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; color: #e0e0e0; background: #0d0d0d; margin: 0; padding: 40px; }
    .invoice-container { max-width: 800px; margin: 0 auto; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #C9A96E; }
    .salon-name { font-size: 28px; font-weight: 700; color: #C9A96E; font-family: 'Playfair Display', serif; }
    .invoice-title { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-top: 8px; }
    .invoice-number { font-size: 18px; font-weight: 600; color: #C9A96E; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .detail-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 4px; }
    .detail-value { font-size: 15px; color: #e0e0e0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { padding: 12px 10px; background: #141414; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888; border-bottom: 2px solid #C9A96E; }
    th:last-child { text-align: right; }
    .totals { margin-top: 20px; text-align: right; }
    .totals-row { display: flex; justify-content: flex-end; gap: 40px; padding: 8px 0; font-size: 15px; }
    .totals-row.total { font-size: 20px; font-weight: 700; color: #C9A96E; border-top: 2px solid #C9A96E; padding-top: 12px; margin-top: 8px; }
    .status-badge { display: inline-block; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .status-paid { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
    .status-pending { background: rgba(234, 179, 8, 0.2); color: #eab308; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #2a2a2a; text-align: center; font-size: 13px; color: #666; }
    @media print { body { background: white; color: #333; } .invoice-container { border: 1px solid #ddd; background: white; } .salon-name { color: #8B6914; } th { background: #f5f5f5; color: #666; border-bottom-color: #8B6914; } .totals-row.total { color: #8B6914; border-top-color: #8B6914; } .header { border-bottom-color: #8B6914; } }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div>
        <div class="salon-name">${data.salonName}</div>
        <div class="invoice-title">Invoice</div>
        ${data.salonPhone ? `<div style="font-size:13px;color:#888;margin-top:4px;">${data.salonPhone}</div>` : ''}
        ${data.salonAddress ? `<div style="font-size:13px;color:#888;">${data.salonAddress}</div>` : ''}
      </div>
      <div style="text-align:right;">
        <div class="invoice-number">${data.invoiceNumber}</div>
        <div style="font-size:13px;color:#888;margin-top:4px;">${data.createdAt}</div>
        <div style="margin-top:8px;">
          <span class="status-badge ${data.paymentStatus === 'paid' ? 'status-paid' : 'status-pending'}">
            ${data.paymentStatus}
          </span>
        </div>
      </div>
    </div>

    <div class="details-grid">
      <div>
        <div class="detail-label">Bill To</div>
        <div class="detail-value">${data.customerName}</div>
        <div class="detail-value" style="color:#888;">${data.customerPhone}</div>
        ${data.customerEmail ? `<div class="detail-value" style="color:#888;">${data.customerEmail}</div>` : ''}
      </div>
      <div>
        <div class="detail-label">Appointment Date</div>
        <div class="detail-value">${data.appointmentDate}</div>
        <div class="detail-label" style="margin-top:12px;">Chair / Station</div>
        <div class="detail-value" style="color: #C9A96E; font-weight: 600;">${data.chair || 'Not Assigned'}${data.section ? ` (${data.section.toUpperCase()})` : ''}</div>
        ${data.packageName ? `<div class="detail-label" style="margin-top:12px;">Package</div><div class="detail-value">${data.packageName}</div>` : ''}
        ${data.paymentMethod ? `<div class="detail-label" style="margin-top:12px;">Payment Method</div><div class="detail-value" style="text-transform:capitalize;">${data.paymentMethod}</div>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:50px;">#</th>
          <th>Service</th>
          <th style="text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${servicesRows}
      </tbody>
    </table>

    ${data.productsUsed && data.productsUsed.length > 0 ? `
    <div style="margin: 20px 0; padding: 16px; background: #141414; border-radius: 8px;">
      <div class="detail-label" style="margin-bottom:8px;">Products Used</div>
      <div style="color:#e0e0e0;font-size:14px;">${data.productsUsed.join(', ')}</div>
    </div>
    ` : ''}

    <div class="totals">
      <div class="totals-row"><span>Subtotal</span><span>₹${data.subtotal.toFixed(2)}</span></div>
      ${data.tax > 0 ? `<div class="totals-row"><span>Tax</span><span>₹${data.tax.toFixed(2)}</span></div>` : ''}
      ${data.discount > 0 ? `<div class="totals-row"><span>Discount</span><span>-₹${data.discount.toFixed(2)}</span></div>` : ''}
      <div class="totals-row total"><span>Total</span><span>₹${data.total.toFixed(2)}</span></div>
    </div>

    <!-- Dynamic UPI Payment QR Code -->
    <div style="margin: 28px auto 10px; text-align: center; padding: 16px; background: #141414; border: 1px dashed #333; border-radius: 10px; max-width: 260px;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #C9A96E; font-weight: 700; margin-bottom: 8px;">Scan &amp; Pay via UPI</div>
      <div style="display: flex; justify-content: center; margin: 4px 0;">
        ${generateQrSvg(generateHairMartUpiUrl(data.total, data.invoiceNumber), 140)}
      </div>
      <div style="font-weight: 700; color: #FFF; font-size: 13px; margin-top: 6px;">Scan To Pay ₹${data.total.toFixed(2)}</div>
      <div style="font-size: 10px; color: #888; margin-top: 2px;">UPI: ${HAIR_MART_UPI_VPA}</div>
      <div style="font-size: 9px; color: #666; margin-top: 2px;">GPay • PhonePe • Paytm • BHIM</div>
    </div>

    <div class="footer">
      <p>Thank you for choosing ${data.salonName}!</p>
    </div>
  </div>
</body>
</html>`;
}
