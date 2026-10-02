package com.hairmart.salon;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Base64;
import android.util.Log;

import androidx.core.app.ActivityCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.IOException;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(
    name = "BluetoothPrinter",
    permissions = {
        @Permission(
            alias = "bluetooth",
            strings = {
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.BLUETOOTH_SCAN
            }
        )
    }
)
public class BluetoothPrinterPlugin extends Plugin {
    private static final String TAG = "BluetoothPrinterPlugin";
    // Standard Serial Port Profile (SPP) UUID for Bluetooth thermal printers
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

    private BluetoothAdapter bluetoothAdapter;
    private BluetoothSocket currentSocket;
    private OutputStream outputStream;
    private String connectedAddress = null;
    private String connectedName = null;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    @Override
    public void load() {
        super.load();
        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
    }

    private boolean hasBluetoothPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED;
        }
        return true;
    }

    @PluginMethod
    public void checkBluetoothAvailability(PluginCall call) {
        JSObject ret = new JSObject();
        if (bluetoothAdapter == null) {
            ret.put("available", false);
            ret.put("enabled", false);
            ret.put("error", "Bluetooth is not supported on this device.");
            call.resolve(ret);
            return;
        }

        ret.put("available", true);
        ret.put("enabled", bluetoothAdapter.isEnabled());
        ret.put("hasPermission", hasBluetoothPermissions());
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (!hasBluetoothPermissions()) {
                requestPermissionForAlias("bluetooth", call, "bluetoothPermissionCallback");
                return;
            }
        }
        JSObject ret = new JSObject();
        ret.put("granted", true);
        call.resolve(ret);
    }

    @PermissionCallback
    private void bluetoothPermissionCallback(PluginCall call) {
        JSObject ret = new JSObject();
        if (hasBluetoothPermissions()) {
            ret.put("granted", true);
            call.resolve(ret);
        } else {
            ret.put("granted", false);
            ret.put("error", "Bluetooth permissions were denied. Please allow Bluetooth access in tablet settings.");
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void listBluetoothPrinters(PluginCall call) {
        if (bluetoothAdapter == null) {
            call.reject("Bluetooth is not available on this device.");
            return;
        }

        if (!bluetoothAdapter.isEnabled()) {
            call.reject("Bluetooth is turned off. Please turn on Bluetooth in tablet settings and try again.");
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !hasBluetoothPermissions()) {
            requestPermissionForAlias("bluetooth", call, "listPrintersPermissionCallback");
            return;
        }

        doListPrinters(call);
    }

    @PermissionCallback
    private void listPrintersPermissionCallback(PluginCall call) {
        if (hasBluetoothPermissions()) {
            doListPrinters(call);
        } else {
            call.reject("Bluetooth permission denied. Cannot list paired printers.");
        }
    }

    private void doListPrinters(PluginCall call) {
        try {
            Set<BluetoothDevice> pairedDevices = bluetoothAdapter.getBondedDevices();
            JSArray deviceList = new JSArray();

            if (pairedDevices != null) {
                for (BluetoothDevice device : pairedDevices) {
                    JSObject d = new JSObject();
                    String name = device.getName() != null ? device.getName() : "Unknown Device";
                    String address = device.getAddress();

                    d.put("name", name);
                    d.put("address", address);

                    // Check if likely a thermal printer (EZO, POS-58, MPT, Printer)
                    String upper = name.toUpperCase();
                    boolean isLikelyPrinter = upper.contains("EZO")
                        || upper.contains("POS")
                        || upper.contains("58")
                        || upper.contains("80")
                        || upper.contains("PRINTER")
                        || upper.contains("MPT")
                        || upper.contains("RP")
                        || upper.contains("BLUETOOTH");

                    d.put("isPrinter", isLikelyPrinter);
                    deviceList.put(d);
                }
            }

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("devices", deviceList);
            call.resolve(ret);
        } catch (SecurityException se) {
            Log.e(TAG, "SecurityException listing printers", se);
            call.reject("Bluetooth permission error while listing printers.");
        } catch (Exception e) {
            Log.e(TAG, "Error listing printers", e);
            call.reject("Failed to list paired Bluetooth devices: " + e.getMessage());
        }
    }

    @PluginMethod
    public void connectBluetoothPrinter(PluginCall call) {
        String address = call.getString("address");
        if (address == null || address.trim().isEmpty()) {
            call.reject("Printer Bluetooth MAC address is required.");
            return;
        }

        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
            call.reject("Bluetooth is turned off. Please enable Bluetooth and try again.");
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !hasBluetoothPermissions()) {
            requestPermissionForAlias("bluetooth", call, "connectPermissionCallback");
            return;
        }

        doConnect(call, address.trim());
    }

    @PermissionCallback
    private void connectPermissionCallback(PluginCall call) {
        if (hasBluetoothPermissions()) {
            String address = call.getString("address");
            if (address != null) {
                doConnect(call, address.trim());
            } else {
                call.reject("Printer address missing after permission grant.");
            }
        } else {
            call.reject("Bluetooth permission denied. Cannot connect to printer.");
        }
    }

    private void doConnect(PluginCall call, String address) {
        // If already connected to this printer, verify and return
        if (currentSocket != null && currentSocket.isConnected() && address.equalsIgnoreCase(connectedAddress)) {
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("deviceName", connectedName != null ? connectedName : "EZO Portable 58mm");
            ret.put("deviceAddress", connectedAddress);
            ret.put("alreadyConnected", true);
            call.resolve(ret);
            return;
        }

        executor.execute(() -> {
            try {
                // Disconnect previous if any
                safelyDisconnect();

                BluetoothDevice device = bluetoothAdapter.getRemoteDevice(address);
                if (device == null) {
                    call.reject("Bluetooth device not found with address: " + address);
                    return;
                }

                String name = device.getName() != null ? device.getName() : "EZO Portable 58mm";

                // Cancel discovery before connecting to ensure reliable connection speed
                if (bluetoothAdapter.isDiscovering()) {
                    bluetoothAdapter.cancelDiscovery();
                }

                BluetoothSocket socket = null;
                try {
                    socket = device.createRfcommSocketToServiceRecord(SPP_UUID);
                    socket.connect();
                } catch (IOException directConnectEx) {
                    Log.w(TAG, "Direct SPP socket failed, attempting fallback reflection connection...", directConnectEx);
                    // Fallback using hidden createRfcommSocket method (common on Android for POS printers)
                    try {
                        Method m = device.getClass().getMethod("createRfcommSocket", new Class[]{int.class});
                        socket = (BluetoothSocket) m.invoke(device, 1);
                        if (socket != null) {
                            socket.connect();
                        } else {
                            throw new IOException("Reflection returned null socket");
                        }
                    } catch (Exception reflectionEx) {
                        Log.e(TAG, "Fallback reflection socket connect failed", reflectionEx);
                        throw new IOException("Could not connect to printer. Please check that printer is powered ON and within range.");
                    }
                }

                currentSocket = socket;
                outputStream = socket.getOutputStream();
                connectedAddress = address;
                connectedName = name;

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("deviceName", name);
                ret.put("deviceAddress", address);
                call.resolve(ret);

            } catch (SecurityException se) {
                Log.e(TAG, "SecurityException connecting to printer", se);
                call.reject("Bluetooth permission denied when connecting to printer.");
            } catch (Exception e) {
                Log.e(TAG, "Error connecting to Bluetooth printer", e);
                safelyDisconnect();
                call.reject("Could not connect to EZO printer (" + address + "). Make sure it is paired in Android Settings and powered ON.");
            }
        });
    }

    @PluginMethod
    public void disconnectBluetoothPrinter(PluginCall call) {
        executor.execute(() -> {
            safelyDisconnect();
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "Printer disconnected successfully.");
            call.resolve(ret);
        });
    }

    @PluginMethod
    public void getPrinterStatus(PluginCall call) {
        boolean isConnected = currentSocket != null && currentSocket.isConnected() && outputStream != null;
        JSObject ret = new JSObject();
        ret.put("connected", isConnected);
        ret.put("status", isConnected ? "connected" : "ready");
        if (isConnected) {
            ret.put("deviceName", connectedName != null ? connectedName : "EZO Portable 58mm");
            ret.put("deviceAddress", connectedAddress);
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void printRawBytes(PluginCall call) {
        String base64Data = call.getString("base64");
        if (base64Data == null || base64Data.isEmpty()) {
            call.reject("Receipt byte data (base64) is required for printing.");
            return;
        }

        if (currentSocket == null || !currentSocket.isConnected() || outputStream == null) {
            call.reject("Printer is not connected. Please connect to your EZO printer before printing.");
            return;
        }

        executor.execute(() -> {
            try {
                byte[] rawBytes = Base64.decode(base64Data, Base64.DEFAULT);
                outputStream.write(rawBytes);
                outputStream.flush();

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("bytesSent", rawBytes.length);
                call.resolve(ret);
            } catch (IOException ioe) {
                Log.e(TAG, "IOException writing to printer", ioe);
                safelyDisconnect();
                call.reject("Print failed: Printer disconnected or paper jam. Please reconnect.");
            } catch (Exception e) {
                Log.e(TAG, "Error printing bytes", e);
                call.reject("Print failed: " + e.getMessage());
            }
        });
    }

    private synchronized void safelyDisconnect() {
        if (outputStream != null) {
            try {
                outputStream.close();
            } catch (Exception ignored) {}
            outputStream = null;
        }
        if (currentSocket != null) {
            try {
                currentSocket.close();
            } catch (Exception ignored) {}
            currentSocket = null;
        }
        connectedAddress = null;
        connectedName = null;
    }

    @Override
    protected void handleOnDestroy() {
        safelyDisconnect();
        executor.shutdown();
        super.handleOnDestroy();
    }
}
