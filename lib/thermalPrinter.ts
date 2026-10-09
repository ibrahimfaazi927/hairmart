/**
 * EZO Portable 58mm Thermal Billing Printer Integration
 * Supports:
 * 1. Web Bluetooth API (Wireless ESC/POS)
 * 2. Web Serial API (USB Cable ESC/POS)
 * 3. 58mm Native Browser Print Window (POS-58 driver fallback)
 */

import QRCode from 'qrcode';
import { generateQrSvg } from './qrCode';

export interface BillPrintData {
  billNo: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  notes?: string;
}

/**
 * Exact Hair Mart Salon UPI credentials extracted from physical EZO receipt:
 * Payee VPA: Q085073724@ybl (Yes Bank / PhonePe merchant)
 * Payee Name: Hair Mart Unisex Salon
 */
export const HAIR_MART_UPI_VPA = 'Q085073724@ybl';
export const HAIR_MART_UPI_NAME = 'Hair Mart Unisex Salon';

/**
 * Generate standard UPI intent URL matching physical receipt:
 * upi://pay?pa=Q085073724@ybl&pn=Hair Mart Unisex Salon&am=100&cu=INR&tn=9027468798
 */
export function generateHairMartUpiUrl(total: number, billNo: string): string {
  const cleanBillNo = billNo ? billNo.replace(/[^a-zA-Z0-9-]/g, '') : 'BILL';
  return `upi://pay?pa=${HAIR_MART_UPI_VPA}&pn=${encodeURIComponent(HAIR_MART_UPI_NAME)}&am=${total}&cu=INR&tn=${cleanBillNo}`;
}

/**
 * Generate ESC/POS Raster Bit Image (GS v 0 0) for QR code
 * 384 dots wide (standard 58mm thermal printable width)
 * Pre-centered with zero-padding on both margins for 100% printer firmware compatibility
 */
export function generateEscPosRasterQrBytes(text: string, scale = 5): number[] {
  try {
    const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
    const qrSize = qr.modules.size;
    const margin = 2; // quiet zone
    const totalModules = qrSize + margin * 2;
    const imgWidth = totalModules * scale; // in dots
    const imgHeight = imgWidth;

    const targetWidthDots = 384; // 58mm standard dot width (48mm @ 203 DPI)
    const leftPaddingDots = Math.max(0, Math.floor((targetWidthDots - imgWidth) / 2));
    const bytesWidth = Math.ceil(targetWidthDots / 8); // 48 bytes per raster row

    const bytes: number[] = [];
    // GS v 0 0 xL xH yL yH
    const xL = bytesWidth % 256;
    const xH = Math.floor(bytesWidth / 256);
    const yL = imgHeight % 256;
    const yH = Math.floor(imgHeight / 256);

    bytes.push(0x1d, 0x76, 0x30, 0x00, xL, xH, yL, yH);

    for (let y = 0; y < imgHeight; y++) {
      const modY = Math.floor(y / scale) - margin;
      for (let byteX = 0; byteX < bytesWidth; byteX++) {
        let b = 0;
        for (let bit = 0; bit < 8; bit++) {
          const dotX = byteX * 8 + bit;
          const relX = dotX - leftPaddingDots;
          if (relX >= 0 && relX < imgWidth) {
            const modX = Math.floor(relX / scale) - margin;
            if (modY >= 0 && modY < qrSize && modX >= 0 && modX < qrSize) {
              if (qr.modules.get(modY, modX)) {
                b |= (1 << (7 - bit));
              }
            }
          }
        }
        bytes.push(b);
      }
    }
    return bytes;
  } catch (err) {
    console.error('Failed to generate ESC/POS QR raster:', err);
    return [];
  }
}

// Global active connections
let activeBluetoothDevice: any = null;
let activeBluetoothCharacteristic: any = null;
let activeSerialPort: any = null;

// Common Bluetooth Printer Service & Characteristic UUIDs (Standard 58mm/80mm Thermal Printers)
const BT_PRINTER_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard Printer Service
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC Serial Transmit
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '0000e0ff-0000-1000-8000-00805f9b34fb',
];

const BT_PRINTER_CHARACTERISTICS = [
  '00002af1-0000-1000-8000-00805f9b34fb',
  '49535343-1e4d-4bd9-ba61-23c647249616',
  'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f',
];

/**
 * Connect to EZO portable printer via Web Bluetooth
 */
export async function connectEzoBluetooth(): Promise<{ success: boolean; deviceName?: string; error?: string }> {
  try {
    if (typeof navigator === 'undefined' || !(navigator as any).bluetooth) {
      return { success: false, error: 'Web Bluetooth is not supported in this browser. Please use Chrome or Edge.' };
    }

    const device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: BT_PRINTER_SERVICES,
    });

    if (!device) {
      return { success: false, error: 'No device selected' };
    }

    const server = await device.gatt.connect();

    // Look for matching printer service & characteristic
    let matchedCharacteristic = null;
    for (const serviceUuid of BT_PRINTER_SERVICES) {
      try {
        const service = await server.getPrimaryService(serviceUuid);
        for (const charUuid of BT_PRINTER_CHARACTERISTICS) {
          try {
            const char = await service.getCharacteristic(charUuid);
            if (char) {
              matchedCharacteristic = char;
              break;
            }
          } catch {
            // continue
          }
        }
        if (matchedCharacteristic) break;

        // If specific characteristic not found, pick first writable characteristic
        const chars = await service.getCharacteristics();
        for (const c of chars) {
          if (c.properties.write || c.properties.writeWithoutResponse) {
            matchedCharacteristic = c;
            break;
          }
        }
        if (matchedCharacteristic) break;
      } catch {
        // continue
      }
    }

    activeBluetoothDevice = device;
    activeBluetoothCharacteristic = matchedCharacteristic;

    // Listen for disconnect
    device.addEventListener('gattserverdisconnected', () => {
      activeBluetoothDevice = null;
      activeBluetoothCharacteristic = null;
    });

    return {
      success: true,
      deviceName: device.name || 'EZO Portable 58mm Printer',
    };
  } catch (err: any) {
    console.error('Bluetooth connection error:', err);
    return { success: false, error: err.message || 'Failed to connect via Bluetooth' };
  }
}

/**
 * Connect to EZO printer via USB Cable (Web Serial API)
 */
export async function connectEzoSerial(): Promise<{ success: boolean; error?: string }> {
  try {
    if (typeof navigator === 'undefined' || !(navigator as any).serial) {
      return { success: false, error: 'Web Serial is not supported in this browser. Please use Chrome or Edge.' };
    }

    const port = await (navigator as any).serial.requestPort();
    await port.open({ baudRate: 9600 });
    activeSerialPort = port;

    return { success: true };
  } catch (err: any) {
    console.error('Serial connection error:', err);
    return { success: false, error: err.message || 'Failed to connect via USB Serial' };
  }
}

/**
 * Check current hardware connection status
 */
export function getEzoConnectionStatus(): {
  isBluetoothConnected: boolean;
  isSerialConnected: boolean;
  deviceName: string | null;
} {
  return {
    isBluetoothConnected: !!(activeBluetoothDevice && activeBluetoothDevice.gatt?.connected),
    isSerialConnected: !!activeSerialPort,
    deviceName: activeBluetoothDevice?.name || null,
  };
}

/**
 * Disconnect EZO printer
 */
export function disconnectEzoPrinter() {
  if (activeBluetoothDevice && activeBluetoothDevice.gatt?.connected) {
    activeBluetoothDevice.gatt.disconnect();
  }
  activeBluetoothDevice = null;
  activeBluetoothCharacteristic = null;

  if (activeSerialPort) {
    try {
      activeSerialPort.close();
    } catch {}
    activeSerialPort = null;
  }
}

/**
 * Generates raw ESC/POS byte sequence tailored for 58mm paper (32 characters per line)
 */
export function generateEscPosBytes(data: BillPrintData): Uint8Array {
  const encoder = new TextEncoder();
  const chunks: number[] = [];

  // Helpers
  const addBytes = (...bytes: number[]) => chunks.push(...bytes);
  const addText = (text: string) => {
    const encoded = encoder.encode(text);
    for (let i = 0; i < encoded.length; i++) {
      chunks.push(encoded[i]);
    }
  };
  const addLine = (text: string = '') => addText(text + '\n');

  // ESC @ - Initialize printer
  addBytes(0x1b, 0x40);

  // Center align
  addBytes(0x1b, 0x61, 0x01);

  // Bold & Double Height for Title
  addBytes(0x1b, 0x45, 0x01); // Bold ON
  addBytes(0x1d, 0x21, 0x11); // Double width & height
  addLine('HAIR MART');

  // Normal text
  addBytes(0x1d, 0x21, 0x00);
  addLine('Studio');
  addLine('UNISEX FAMILY SALON');
  addBytes(0x1b, 0x45, 0x00); // Bold OFF

  addLine('Surathkal, Mangalore');
  addLine('Ph: 0824-4060938 / WhatsApp');
  addLine('--------------------------------'); // 32 chars

  // Left align for bill meta
  addBytes(0x1b, 0x61, 0x00);
  addLine(`Bill No: ${data.billNo}`);
  addLine(`Date: ${data.date}  Time: ${data.time}`);
  addLine(`Client: ${data.customerName}`);
  if (data.customerPhone && data.customerPhone !== 'Not Provided') {
    addLine(`Phone:  ${data.customerPhone}`);
  }
  addLine('--------------------------------');

  // Table header: 32 chars -> Name (18), Qty (4), Amt (10)
  addLine('Service / Item     Qty    Amount');
  addLine('--------------------------------');

  // Table rows
  data.items.forEach((item) => {
    const name = item.name.length > 17 ? item.name.substring(0, 17) : item.name.padEnd(18, ' ');
    const qty = String(item.quantity).padStart(3, ' ') + ' ';
    const amt = ('Rs.' + (item.price * item.quantity)).padStart(10, ' ');
    addLine(`${name}${qty}${amt}`);
  });

  addLine('--------------------------------');

  // Totals
  const subtotalLine = 'Subtotal:'.padEnd(20, ' ') + ('Rs.' + data.subtotal).padStart(12, ' ');
  addLine(subtotalLine);

  if (data.discount > 0) {
    const discLine = 'Discount:'.padEnd(20, ' ') + ('-Rs.' + data.discount).padStart(12, ' ');
    addLine(discLine);
  }

  // Grand total in Bold
  addBytes(0x1b, 0x45, 0x01); // Bold ON
  const totalLine = 'TOTAL AMOUNT:'.padEnd(20, ' ') + ('Rs.' + data.total).padStart(12, ' ');
  addLine(totalLine);
  addBytes(0x1b, 0x45, 0x00); // Bold OFF

  addLine(`Payment: ${data.paymentMethod.toUpperCase()}`);
  if (data.notes) {
    addLine(`Notes: ${data.notes}`);
  }

  addLine('--------------------------------');

  // Dynamic UPI Payment QR Code Section (Accurately extracted from Hair Mart EZO receipt)
  addBytes(0x1b, 0x61, 0x01); // Center align
  addLine('Thank You! Visit Again!');
  addLine('Powered by Ezo');

  // Generate UPI QR raster image centered for 58mm paper (384 dots)
  const upiUrl = generateHairMartUpiUrl(data.total, data.billNo);
  const qrRasterBytes = generateEscPosRasterQrBytes(upiUrl, 5);
  if (qrRasterBytes.length > 0) {
    addBytes(...qrRasterBytes);
    addLine();
  }

  addLine(`Scan To Pay Rs. ${data.total} /-`);
  addLine('--------------------------------');

  // Footer - Center Align
  addLine('Thank you for choosing Hair Mart!');
  addLine('Look Stylish. Feel Confident.');
  addLine('Follow us on Instagram: @hairmart');
  addLine('Scan QR for Reviews & Offers');

  // Feed 4 lines and cut paper
  addLine('\n\n\n\n');
  addBytes(0x1d, 0x56, 0x42, 0x00); // GS V 66 0 (Cut paper)

  return new Uint8Array(chunks);
}

/**
 * Generate test slip ESC/POS bytes
 */
export function generateTestSlipBytes(): Uint8Array {
  const now = new Date();
  return generateEscPosBytes({
    billNo: 'HM-TEST-58MM',
    date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    customerName: 'EZO Printer Diagnostic',
    customerPhone: 'Hardware Test OK',
    items: [
      { name: 'EZO 58mm Thermal Port', quantity: 1, price: 0 },
      { name: 'HairMart Studio Driver', quantity: 1, price: 0 },
    ],
    subtotal: 0,
    discount: 0,
    total: 0,
    paymentMethod: 'TEST OK',
    notes: 'Printer is paired and ready for fast billing.',
  });
}

/**
 * Send raw bytes to active Bluetooth or Serial printer
 */
export async function sendRawBytesToPrinter(bytes: Uint8Array): Promise<boolean> {
  // Try Web Bluetooth first if connected
  if (activeBluetoothCharacteristic) {
    try {
      // Chunk into 512 bytes for BLE MTU safety
      const chunkSize = 128;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const slice = bytes.slice(i, i + chunkSize);
        if (activeBluetoothCharacteristic.writeValueWithResponse) {
          await activeBluetoothCharacteristic.writeValueWithResponse(slice);
        } else {
          await activeBluetoothCharacteristic.writeValue(slice);
        }
      }
      return true;
    } catch (e) {
      console.warn('BLE write error, trying fallback:', e);
    }
  }

  // Try Web Serial next
  if (activeSerialPort && activeSerialPort.writable) {
    try {
      const writer = activeSerialPort.writable.getWriter();
      await writer.write(bytes);
      writer.releaseLock();
      return true;
    } catch (e) {
      console.error('Serial write error:', e);
    }
  }

  return false;
}

/**
 * Native 58mm browser print fallback window
 * Formatted strictly for 58mm thermal rolls (width: 48mm-54mm printable, 0 margin)
 */
export function printVia58mmWindow(data: BillPrintData) {
  const printWindow = window.open('', '_blank', 'width=340,height=600,top=100,left=100');
  if (!printWindow) {
    window.print();
    return;
  }

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="font-weight: 600; padding: 2px 0;">${item.name}</td>
        <td style="text-align: center; padding: 2px 0;">${item.quantity}</td>
        <td style="text-align: right; padding: 2px 0;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `
    )
    .join('');

  const upiUrl = generateHairMartUpiUrl(data.total, data.billNo);
  const upiQrSvg = generateQrSvg(upiUrl, 140);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - ${data.billNo}</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: 58mm auto;
            margin: 0mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace, system-ui;
            font-size: 11px;
            line-height: 1.25;
            color: #000000;
            background: #ffffff;
            width: 58mm;
            max-width: 58mm;
            padding: 2mm 3mm;
            margin: 0 auto;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .title { font-size: 14px; font-weight: 900; letter-spacing: 0.5px; }
          .subtitle { font-size: 10px; font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          .grand-total { font-size: 13px; font-weight: 900; }
          @media print {
            body { width: 58mm; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="text-center">
          <!-- Logo Emblem -->
          <div style="margin-bottom: 2px;">
            <svg width="40" height="40" viewBox="0 0 160 160" fill="none" style="margin: 0 auto; display: block;">
              <circle cx="80" cy="80" r="76" fill="#1C2433" stroke="#000000" stroke-width="4" />
              <path d="M 77 34 C 62 34 50 42 45 54 C 43 59 42 62 39 65 C 36 67 33 68 33 70 C 33 71.5 36 72 38 73 C 36 74.5 35 76 35 77.5 C 35 79 38 79.5 40 80.5 C 37 83 40 86 44 87 C 48 88 52 87 55 93 C 58 99 57 108 55 118 C 60 114 65 106 67 98 C 68 94 67 88 65 83 C 62 77 62 71 65 65 C 69 57 74 50 78 45 Z" fill="#000" />
              <path d="M 84 34 C 95 30 108 34 117 43 C 123 49 125 56 122 62 C 119 66 113 67 108 65 C 103 63 100 57 97 53 C 93 48 89 39 84 34 Z" fill="#000" />
            </svg>
          </div>
          <div class="title">HAIR MART</div>
          <div class="subtitle">Studio &bull; UNISEX FAMILY SALON</div>
          <div style="font-size: 9.5px;">Surathkal, Mangalore</div>
          <div style="font-size: 9.5px;">Ph: 0824-4060938</div>
        </div>

        <div class="divider"></div>

        <div>
          <div><b>Bill No:</b> ${data.billNo}</div>
          <div><b>Date:</b> ${data.date} &nbsp; <b>Time:</b> ${data.time}</div>
          <div><b>Client:</b> ${data.customerName}</div>
          ${data.customerPhone && data.customerPhone !== 'Not Provided' ? `<div><b>Phone:</b> ${data.customerPhone}</div>` : ''}
        </div>

        <div class="divider"></div>

        <table>
          <thead>
            <tr>
              <th style="text-align: left; width: 55%; padding-bottom: 2px;">Service</th>
              <th style="text-align: center; width: 15%; padding-bottom: 2px;">Qty</th>
              <th style="text-align: right; width: 30%; padding-bottom: 2px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="divider"></div>

        <div>
          <div style="display: flex; justify-content: space-between;">
            <span>Subtotal:</span>
            <span>₹${data.subtotal.toLocaleString('en-IN')}</span>
          </div>
          ${
            data.discount > 0
              ? `
          <div style="display: flex; justify-content: space-between;">
            <span>Discount:</span>
            <span>-₹${data.discount.toLocaleString('en-IN')}</span>
          </div>`
              : ''
          }
          <div style="display: flex; justify-content: space-between; margin-top: 2px;" class="grand-total">
            <span>TOTAL:</span>
            <span>₹${data.total.toLocaleString('en-IN')}</span>
          </div>
          <div style="font-size: 9.5px; margin-top: 2px;">
            Payment: ${data.paymentMethod.toUpperCase()} (Recorded)
          </div>
        </div>

        <div class="divider"></div>

        <!-- Dynamic Payment QR Code -->
        <div class="text-center" style="margin: 6px 0;">
          <div style="font-size: 10px; font-weight: bold;">Thank You! Visit Again!</div>
          <div style="font-size: 9px; color: #555;">Powered by Ezo</div>
          <div style="display: flex; justify-content: center; margin: 6px auto;">
            ${upiQrSvg}
          </div>
          <div style="font-weight: 900; font-size: 11.5px; letter-spacing: 0.3px;">Scan To Pay Rs. ${data.total} /-</div>
          <div style="font-size: 8.5px; color: #666; margin-top: 2px;">UPI: ${HAIR_MART_UPI_VPA}</div>
        </div>

        <div class="divider"></div>

        <div class="text-center" style="font-size: 9.5px;">
          <div><b>Thank you for choosing Hair Mart!</b></div>
          <div>Look Stylish. Feel Confident.</div>
          <div>Follow us on Instagram: @hairmart</div>
          <div>Scan QR for Reviews &amp; Offers</div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 350);
}

/**
 * Universal print handler for EZO 58mm printer
 * Priority: Native Android Bluetooth → Web Bluetooth → Web Serial → Print Window
 */
export async function printBillToEzoPrinter(data: BillPrintData): Promise<{ method: 'native-bluetooth' | 'bluetooth' | 'serial' | 'window'; success: boolean }> {
  const bytes = generateEscPosBytes(data);

  // 1. Try native Android Bluetooth printer (Capacitor)
  try {
    const { isNativeBluetoothAvailable, sendBytesToPrinter } = await import('./bluetoothPrinter');
    if (isNativeBluetoothAvailable()) {
      const result = await sendBytesToPrinter(bytes);
      if (result.success) {
        return { method: 'native-bluetooth', success: true };
      }
      // If native fails (e.g. not connected), fall through to other methods
    }
  } catch (nativeErr) {
    console.warn('Native Android Bluetooth not available, trying web fallbacks:', nativeErr);
  }

  // 2. Try Web Bluetooth / Web Serial
  const sentRaw = await sendRawBytesToPrinter(bytes);
  if (sentRaw) {
    return {
      method: activeBluetoothCharacteristic ? 'bluetooth' : 'serial',
      success: true,
    };
  }

  // 3. Fallback to optimized 58mm print window
  printVia58mmWindow(data);
  return { method: 'window', success: true };
}
