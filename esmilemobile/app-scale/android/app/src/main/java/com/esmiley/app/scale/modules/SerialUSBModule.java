package com.esmiley.app.scale.modules;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;
import android.util.Log;

import com.felhr.usbserial.UsbSerialDevice;
import com.felhr.usbserial.UsbSerialInterface;

import java.util.Collection;

class SerialUSBModule extends ReactContextBaseJavaModule {
    private static final String ACTION_USB_PERMISSION = "com.appscale.USB_PERMISSION";
    private static final String TAG = "SerialUSB";

    private final ReactApplicationContext context;
    private UsbManager usbManager;

    SerialUSBModule(ReactApplicationContext context) {
        super(context);
        this.context = context;
        this.usbManager = (UsbManager) context.getSystemService(Context.USB_SERVICE);
    }

    private final BroadcastReceiver mUsbReceiver = new BroadcastReceiver() {
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            Log.d(TAG, "Action: ".concat(action));

            switch (action) {
                case ACTION_USB_PERMISSION: {
                    UsbDevice device = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
                    if (usbManager.hasPermission(device)) {
                        Log.d(TAG, "Permission granted");
                        connect(device);
                    } else {
                        Log.d(TAG, "Permission denied");
                    }
                    break;
                }
                case UsbManager.ACTION_USB_DEVICE_ATTACHED: {
                    emitEvent("DEVICE_ATTACHED", null);
                    UsbDevice device = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
                    connect(device);
                    break;
                }
                case UsbManager.ACTION_USB_DEVICE_DETACHED: {
                    emitEvent("DEVICE_DETACHED", null);
                    break;
                }
            }
        }
    };

    @ReactMethod
    public void register(Promise promise) {
        context.registerReceiver(mUsbReceiver, new IntentFilter(ACTION_USB_PERMISSION));
        context.registerReceiver(mUsbReceiver, new IntentFilter(UsbManager.ACTION_USB_DEVICE_ATTACHED));
        context.registerReceiver(mUsbReceiver, new IntentFilter(UsbManager.ACTION_USB_DEVICE_DETACHED));
        Log.d(TAG, "Registered receiver for USB events");
        promise.resolve(null);
    }

    @ReactMethod
    public void connectToDevice() {
        Collection<UsbDevice> devices = usbManager.getDeviceList().values();

        if (devices.iterator().hasNext()) {
            connect(devices.iterator().next());
        }
    }

    @ReactMethod
    public void unregister() {
        context.unregisterReceiver(mUsbReceiver);
        Log.d(TAG, "Unregistered receiver for USB events");
    }

    private void connect(UsbDevice device) {
        Log.d(TAG, "Attempting to connect to usb device: productId=" + device.getProductId() +
                " vendorId=" + device.getVendorId());

        // if (device.getProductId() == 24577 && device.getVendorId() == 1027) {

        if (usbManager.hasPermission(device)) {
            UsbSerialDevice serial = UsbSerialDevice.createUsbSerialDevice(device, usbManager.openDevice(device));

            if (serial != null && serial.open()) {
                emitEvent("DEVICE_CONNECTED", null);
                serial.setBaudRate(9600);
                serial.setDataBits(UsbSerialInterface.DATA_BITS_8);
                serial.setStopBits(UsbSerialInterface.STOP_BITS_1);
                serial.setParity(UsbSerialInterface.PARITY_NONE);
                serial.setFlowControl(UsbSerialInterface.FLOW_CONTROL_OFF);
                serial.read(new UsbSerialInterface.UsbReadCallback() {
                    @Override
                    public void onReceivedData(byte[] data) {
                        emitEvent("NewBytesReceivedEvent", new String(data));
                    }
                });
                Log.d(TAG, "Opened serial port");
            } else {
                Log.d(TAG, "Failed to open serial port");
            }
        } else {
            Log.d(TAG, "Requested permission");
            usbManager.requestPermission(device, PendingIntent
                    .getBroadcast(context, 0, new Intent(ACTION_USB_PERMISSION), 0));
        }
    }

    private void emitEvent(String name, String value) {
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(name, value);
    }

    @Override
    public String getName() {
        return "SerialUSB";
    }
}
