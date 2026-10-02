/**
 * HairMart — Native Android Bluetooth Printer Bridge (Capacitor)
 * 
 * This module provides a TypeScript API that communicates with the
 * native BluetoothPrinterPlugin.java via Capacitor on Android.
 * On browsers, it falls back to the existing Web Bluetooth / print window.
 */

import { generateEscPosBytes, type BillPrintData } from './thermalPrinter';

// ─── Platform Detection ───────────────────────────────────────
function isNativeAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.() &&
         (window as any).Capacitor?.getPlatform?.() === 'android';
}

function getPlugin(): any {
  if (typeof window === 'undefined') return null;
  return (window as any).Capacitor?.Plugins?.BluetoothPrinter ?? null;
}

// ─── Types ────────────────────────────────────────────────────
export interface BluetoothDevice {
  name: string;
  address: string;
  isPrinter: boolean;
}

export type PrinterConnectionStatus =
  | 'ready'        // Not connected, waiting
  | 'connecting'   // Connection in progress
  | 'connected'    // Actively connected
  | 'printing'     // Sending data
  | 'error';       // Error state

export interface PrinterState {
  status: PrinterConnectionStatus;
  deviceName: string | null;
  deviceAddress: string | null;
  error: string | null;
}

// ─── Check if native Bluetooth printing is available ──────────
export function isNativeBluetoothAvailable(): boolean {
  return isNativeAndroid() && getPlugin() !== null;
}

// ─── Check Bluetooth Availability on Device ───────────────────
export async function checkBluetoothAvailability(): Promise<{
  available: boolean;
  enabled: boolean;
  hasPermission: boolean;
  error?: string;
}> {
  const plugin = getPlugin();
  if (!plugin) {
    return { available: false, enabled: false, hasPermission: false, error: 'Not running on Android' };
  }
  try {
    return await plugin.checkBluetoothAvailability();
  } catch (e: any) {
    return { available: false, enabled: false, hasPermission: false, error: e.message };
  }
}

// ─── Request Bluetooth Permissions ────────────────────────────
export async function requestBluetoothPermissions(): Promise<{ granted: boolean; error?: string }> {
  const plugin = getPlugin();
  if (!plugin) return { granted: false, error: 'Not running on Android' };
  try {
    return await plugin.requestPermissions();
  } catch (e: any) {
    return { granted: false, error: e.message };
  }
}

// ─── List Paired Bluetooth Printers ───────────────────────────
export async function listBluetoothPrinters(): Promise<{
  success: boolean;
  devices: BluetoothDevice[];
  error?: string;
}> {
  const plugin = getPlugin();
  if (!plugin) return { success: false, devices: [], error: 'Not running on Android' };
  try {
    const result = await plugin.listBluetoothPrinters();
    return {
      success: result.success,
      devices: result.devices || [],
    };
  } catch (e: any) {
    return { success: false, devices: [], error: e.message };
  }
}

// ─── Connect to a Bluetooth Printer ──────────────────────────
export async function connectBluetoothPrinter(address: string): Promise<{
  success: boolean;
  deviceName?: string;
  deviceAddress?: string;
  error?: string;
}> {
  const plugin = getPlugin();
  if (!plugin) return { success: false, error: 'Not running on Android' };
  try {
    return await plugin.connectBluetoothPrinter({ address });
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Disconnect Bluetooth Printer ────────────────────────────
export async function disconnectBluetoothPrinter(): Promise<{ success: boolean; error?: string }> {
  const plugin = getPlugin();
  if (!plugin) return { success: false, error: 'Not running on Android' };
  try {
    return await plugin.disconnectBluetoothPrinter();
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Get Current Printer Status ──────────────────────────────
export async function getPrinterStatus(): Promise<PrinterState> {
  const plugin = getPlugin();
  if (!plugin) {
    return { status: 'ready', deviceName: null, deviceAddress: null, error: null };
  }
  try {
    const result = await plugin.getPrinterStatus();
    return {
      status: result.connected ? 'connected' : 'ready',
      deviceName: result.deviceName || null,
      deviceAddress: result.deviceAddress || null,
      error: null,
    };
  } catch (e: any) {
    return { status: 'error', deviceName: null, deviceAddress: null, error: e.message };
  }
}

// ─── Send Raw ESC/POS Bytes to Connected Printer ─────────────
export async function sendBytesToPrinter(bytes: Uint8Array): Promise<{
  success: boolean;
  bytesSent?: number;
  error?: string;
}> {
  const plugin = getPlugin();
  if (!plugin) return { success: false, error: 'Not running on Android' };

  // Convert Uint8Array to base64 for Capacitor bridge
  let base64: string;
  if (typeof btoa === 'function') {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    base64 = btoa(binary);
  } else {
    // Node.js fallback (should not happen in browser/Android)
    base64 = Buffer.from(bytes).toString('base64');
  }

  try {
    return await plugin.printRawBytes({ base64 });
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Print a Full Bill Receipt ───────────────────────────────
export async function printReceipt(data: BillPrintData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const escPosBytes = generateEscPosBytes(data);
    const result = await sendBytesToPrinter(escPosBytes);
    return result;
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Test Print ──────────────────────────────────────────────
export async function testPrint(): Promise<{ success: boolean; error?: string }> {
  const now = new Date();
  return printReceipt({
    billNo: 'HM-TEST-58MM',
    date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    customerName: 'EZO Printer Test',
    customerPhone: 'OK',
    items: [
      { name: 'EZO 58mm Test Print', quantity: 1, price: 0 },
      { name: 'HairMart Connection', quantity: 1, price: 0 },
    ],
    subtotal: 0,
    discount: 0,
    total: 0,
    paymentMethod: 'TEST OK',
    notes: 'Printer connected and working!',
  });
}

// ─── Stored Printer Address (localStorage) ───────────────────
const PRINTER_STORAGE_KEY = 'hairmart_bluetooth_printer';

export function getSavedPrinterAddress(): { address: string; name: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(PRINTER_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

export function savePrinterAddress(address: string, name: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRINTER_STORAGE_KEY, JSON.stringify({ address, name }));
  } catch {}
}

export function clearSavedPrinterAddress() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PRINTER_STORAGE_KEY);
  } catch {}
}
