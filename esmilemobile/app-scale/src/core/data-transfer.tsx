/*
 Flow:
  - Prioritise connect using USB, if succeeded, stop trying to connect via BLE
  - To connect via BLE, USB scale must be first disconnected by unplugging the usb cable
 */
import {
  Platform,
  NativeModules,
  NativeEventEmitter,
  AppState,
  PermissionsAndroid
} from 'react-native';
import { WebView } from 'react-native-webview';
import UsbMessageParser, { WeightResponse as UsbWeightResponse } from './util/usb-message-parser';
import BleMessageParser, { WeightResponse as BleWeightResponse } from './util/ble-message-parser';
import BleManager from 'react-native-ble-manager';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import Scanner from './Scanner';

const { SerialUSB } = NativeModules;
const BleManagerModule = NativeModules.BleManager;

// by trial-and-error, it seems the scale name can be with or without '-'
const ScaleNames = new Set<string>(['esmiley-scale', 'esmiley scale']);
// low duration value can cause issues with discovering device
// but simplifies the selection in case of multiple devices found and we want to pick closest device
const ScanDurationInSeconds = 3;

enum BleScaleState {
  connecting = 'connecting',
  connected = 'connected',
  disconnecting = 'disconnecting',
  disconnected = 'disconnected'
}

// https://developer.android.com/reference/android/bluetooth/le/ScanSettings#MATCH_MODE_STICKY
// https://developer.android.com/reference/android/bluetooth/le/ScanSettings#SCAN_MODE_BALANCED
const BleScanOptions = {
  matchMode: 2, // sticky, favor devices in close proximity
  scanMode: 1 // balanced between scan frequency and power consumption
};

type WeightServiceUUIDs = {
  service: string;
  characteristic: string;
};

export default class DataTransfer {
  webView: WebView;
  usbMessageParser: UsbMessageParser;
  bleMessageParser: BleMessageParser;
  serialUSBEmitter: NativeEventEmitter;
  bleManagerEmitter: NativeEventEmitter;
  private isConnectedViaUSB: boolean;
  private bleScaleState: BleScaleState;
  private weightServiceUUIDs: WeightServiceUUIDs | null;
  private scanner: Scanner;

  constructor(webView: WebView) {
    this.webView = webView;
    this.serialUSBEmitter = new NativeEventEmitter(SerialUSB);
    this.usbMessageParser = new UsbMessageParser((measurement: UsbWeightResponse) => {
      this.webView.injectJavaScript(`window.postMessage(${JSON.stringify(measurement)}, '*');`);
    });

    this.bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
    this.bleMessageParser = new BleMessageParser((measurement: BleWeightResponse) => {
      this.webView.injectJavaScript(`window.postMessage(${JSON.stringify(measurement)}, '*');`);
    });

    this.bleScaleState = BleScaleState.disconnected;
    this.weightServiceUUIDs = null;
    this.scanner = Scanner({
      maxAttempts: 10,
      scanDurationInSeconds: ScanDurationInSeconds,
      onScan: this.executeBleScaleScan
    });

    this.open = this.open.bind(this);
  }

  /**
   * Start by attempting a connection via USB.
   * If that is unsuccessful, initialise a BLE connection
   */
  async open() {
    try {
      await SerialUSB.register();
      this.addUSBListeners();
      // this is not async function - isConnectedViaUSB flag is set in event handler,
      // thus initBluetooth is most likely called
      await SerialUSB.connectToDevice();
      this.addBleListeners();

      if (!this.isConnectedViaUSB) {
        await this.initBluetooth();
      }
    } catch (e) {
      console.log(e);
    }
  }

  initBluetooth = async (): Promise<void> => {
    try {
      this.bleManagerEmitter.addListener('BleManagerDidUpdateState', this.handleBleStateChange);
      await BleManager.start({ showAlert: false, restoreIdentifierKey: 'foodwasteBLE' });
      const { hasPermissions, isPoweredOn } = await this.isBluetoothEnabled();
      if (hasPermissions && isPoweredOn) {
        this.scanner.scan();
      } else {
        await this.enableBluetoothAndScan();
      }
    } catch (error) {
      console.log('Could not initialize bluetooth', error);
    }
  };

  isBluetoothEnabled = async (): Promise<{ hasPermissions: boolean; isPoweredOn: boolean }> => {
    try {
      const hasPermissions: boolean = await this.hasPermissionToBluetooth();
      return {
        hasPermissions,
        isPoweredOn: (await BluetoothStateManager.getState()) === 'PoweredOn'
      };
    } catch (error) {
      console.log('Could not get bluetooth enabled status', error);
    }
  };

  enableBluetoothAndScan = async (): Promise<void> => {
    if (this.isConnectedViaUSB) {
      return;
    }
    const { hasPermissions, isPoweredOn } = await this.isBluetoothEnabled();
    if (hasPermissions && isPoweredOn) {
      // for some reason web client gets notified first about disconnected ble scale, before
      // the react native does.. which causes error when trying to connect again to a scale
      // that had just disconnected (edge case but still). Hence, if bleScaleState is still connected,
      // we shall wait for disconnected callback, which will reset and start scan
      if (this.bleScaleState !== BleScaleState.connected) {
        this.scanner.resetAndScan();
      }
    } else {
      const isBluetoothEnabled = await this.enableBluetooth();
      if (isBluetoothEnabled && isPoweredOn) {
        this.scanner.resetAndScan();
      }
    }
  };

  enableBluetooth = async (): Promise<boolean> => {
    try {
      const hasPermissionToBluetooth: boolean = await this.requestPermissionToBluetooth();
      if (!hasPermissionToBluetooth) {
        return false;
      }

      const bluetoothState: string = await BluetoothStateManager.getState();
      if (bluetoothState !== 'PoweredOn') {
        try {
          // returns null if request accepted
          await BluetoothStateManager.requestToEnable();
        } catch (error) {
          // throws error if request denied by user
          return false;
        }
      }
    } catch (error) {
      console.log('Could not enable bluetooth', error);
      return false;
    }

    return true;
  };

  requestPermissionToBluetooth = async (): Promise<boolean> => {
    const hasPermissionToBluetooth: boolean = await this.hasPermissionToBluetooth();

    if (hasPermissionToBluetooth) {
      return hasPermissionToBluetooth;
    }

    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (Platform.Version > 28) {
      const bgLocationPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
      );
      return [fineLocationPermission, bgLocationPermission].every(
        (permission) => permission === 'granted'
      );
    }
    return fineLocationPermission === 'granted';
  };

  /**
   * Android (api >= 23) requires coarse location permission for bluetooth.
   * Note api > 28 requires fine coarse location access
   */
  hasPermissionToBluetooth = async (): Promise<boolean> => {
    if (Platform.Version < 23) {
      return true;
    }

    const fineLocationPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (Platform.Version > 28) {
      const bgLocationPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
      );
      return fineLocationPermission && bgLocationPermission;
    }
    return fineLocationPermission;
  };

  /**
   * Add the Bluetooth listeners
   */
  addBleListeners = () => {
    this.bleManagerEmitter.addListener('BleManagerStopScan', this.handleScanStopped);
    this.bleManagerEmitter.addListener(
      'BleManagerDisconnectPeripheral',
      this.handleDisconnectedPeripheral
    );
    this.bleManagerEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      this.handleUpdateValueForCharacteristic
    );
  };

  /**
   * Remove the Bluetooth listeners
   */
  removeBleListeners = () => {
    this.bleManagerEmitter.removeListener('BleManagerStopScan', this.handleScanStopped);
    this.bleManagerEmitter.removeListener(
      'BleManagerDisconnectPeripheral',
      this.handleDisconnectedPeripheral
    );
    this.bleManagerEmitter.removeListener(
      'BleManagerDidUpdateValueForCharacteristic',
      this.handleUpdateValueForCharacteristic
    );
  };

  /**
   * Add the USB listeners
   */
  addUSBListeners = () => {
    this.serialUSBEmitter.addListener('DEVICE_CONNECTED', this.onUSBConnected);
    this.serialUSBEmitter.addListener('DEVICE_DETACHED', this.onUSBDetached);
    this.serialUSBEmitter.addListener('NewBytesReceivedEvent', this.onUSBBytesReceived);
  };

  /**
   * Remove the USB listeners
   */
  removeUSBListeners = () => {
    this.serialUSBEmitter.removeListener('DEVICE_CONNECTED', this.onUSBConnected);
    this.serialUSBEmitter.removeListener('DEVICE_DETACHED', this.onUSBDetached);
    this.serialUSBEmitter.removeListener('NewBytesReceivedEvent', this.onUSBBytesReceived);
  };

  /**
   * When the USB is connected to the device, disconnect any scale connected via BLE,
   * and notify the client that the scale is now connected
   */
  onUSBConnected = async () => {
    this.isConnectedViaUSB = true;
    await this.disconnectBleScale();
    this.webView.injectJavaScript(
      "window.postMessage({ isConnected: true, isConnecting: false, type: 'USB'}, '*');"
    );
  };

  /**
   * When the USB is detached from the device, notify the client that the scale is now disconnected
   * and trigger a scan for a possible BLE connection
   */
  onUSBDetached = () => {
    this.webView.injectJavaScript("window.postMessage({ isConnected: false }, '*');");
    this.isConnectedViaUSB = false;
  };

  /**
   * When the device is receiving messages from the scale through USB,
   * parse the message and ultimately send the value to the client
   */
  onUSBBytesReceived = (measurement) => {
    this.usbMessageParser.append(measurement);
  };

  /**
   * Disconnect the Ble scale. Only one scale should be connected at any given time.
   */
  disconnectBleScale = async () => {
    try {
      const connectedScales: BleManager.Peripheral[] = await BleManager.getConnectedPeripherals([]);
      if (connectedScales.length > 0) {
        this.bleScaleState = BleScaleState.disconnecting;
        this.webView.injectJavaScript("window.postMessage({ isConnecting: false }, '*')");
        await connectedScales.map((scale) => BleManager.disconnect(scale.id));
      }
    } catch (error) {
      console.log('Could not disconnected scale', error);
    }
  };

  /**
   * Trigger a scan for the Ble scale.
   */
  executeBleScaleScan = (durationInSeconds) => {
    if (this.bleScaleState !== BleScaleState.connected && this.scanner.hasRunMaxAttempts()) {
      this.webView.injectJavaScript("window.postMessage({ isConnecting: false }, '*')");
      this.scanner.reset();
      return;
    }
    BleManager.scan([], durationInSeconds, false /* only iOS */, BleScanOptions)
      .then(() => {
        this.webView.injectJavaScript("window.postMessage({ isConnecting: true }, '*')");
      })
      .catch((error) => {
        console.log('Scanning error', error);
        this.webView.injectJavaScript("window.postMessage({ isConnecting: false }, '*')");
      });
  };

  /**
   * Connect to the scale and start receiving messages right away
   */
  connectToDevice = async (peripheral: BleManager.Peripheral): Promise<BleScaleState> => {
    try {
      await BleManager.connect(peripheral.id);
      const services = await BleManager.retrieveServices(peripheral.id);
      const notificationCharacteristics = services.characteristics.find(
        (c) => !!c.properties.Notify
      );
      if (!notificationCharacteristics) {
        return BleScaleState.disconnected;
      } else {
        const { service, characteristic } = notificationCharacteristics;
        await BleManager.startNotification(peripheral.id, service, characteristic);
        this.weightServiceUUIDs = { service, characteristic };
        this.webView.injectJavaScript(
          "window.postMessage({ isConnected: true, isConnecting: false, type: 'BLE' }, '*')"
        );
        return BleScaleState.connected;
      }
    } catch (error) {
      // .connect seems to randomly result in connection error, which also sends out device disconnected event
      console.log('connectDevice Error ', JSON.stringify(error));
      return BleScaleState.disconnected;
    }
  };

  /** Restart notifications (if they were stopped when app went to background)
   * Start receiving messages from the scale, and if it's a success,
   * notify the client that we are now connected to the scale
   */
  restartNotification = (peripheral: BleManager.Peripheral) => {
    if (this.weightServiceUUIDs) {
      const { service, characteristic } = this.weightServiceUUIDs;
      BleManager.startNotification(peripheral.id, service, characteristic)
        .then(() => {
          this.webView.injectJavaScript(
            "window.postMessage({ isConnected: true, isConnecting: false, type: 'BLE' }, '*')"
          );
        })
        .catch((error) => {
          this.webView.injectJavaScript("window.postMessage({ isConnecting: false }, '*')");
          console.log('Ble notification error', error);
        });
    }
  };

  /**
   * Stop receiving messages from the scale, and if it's a success,
   * notify the client that we are now disconnected from the scale
   */
  stopNotification = (peripheral) => {
    if (this.weightServiceUUIDs) {
      const { service, characteristic } = this.weightServiceUUIDs;
      BleManager.stopNotification(peripheral.id, service, characteristic)
        .then(() => {
          this.webView.injectJavaScript("window.postMessage({ isConnected: false }, '*')");
        })
        .catch((error) => {
          console.log('Ble notification error', error);
        });
    }
  };

  /**
   * Remove the USB listeners, and unregister the USB
   */
  closeTheUSBConnection = () => {
    SerialUSB.unregister();
    this.isConnectedViaUSB = false;
  };

  /**
   * Remove the Ble listeners and disconnect the Ble scale
   */
  closeTheBleConnection = () => {
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.disconnectBleScale().then(() => {
      this.bleScaleState = BleScaleState.disconnected;
    });
  };

  /**
   * Remove event listeners, and close connections when unmounting
   * Note: this is not called at all. When app is killed by user/android,
   * unmount is not called in parent component (which would call this method)
   */
  close = () => {
    this.closeTheUSBConnection();
    this.closeTheBleConnection();
    this.removeBleListeners();
    this.removeUSBListeners();
    this.bleManagerEmitter.removeListener('BleManagerDidUpdateState', this.handleBleStateChange);
    delete this.webView;
  };

  /**
   *
   * Bluetooth related event handlers
   *
   * */

  /**
   * Handle app state changes.
   * When the app gets minimised or the screen turns off, stop receiving notifications from the scale
   * When the app comes into focus again, start receiving notifications without doing any extra scan for the scale
   * Note the difference between disconnecting the scale, and stopping the notifications.
   *
   * IMPORTANT: This event gets triggered also when connecting the USB to the scale, as that creates a new activity,
   * which in turn, sends two new app state changes: "background", followed quickly by the "active" app state.
   * Basically any notification will put the app background (eg asking for permission to enable bluetooth)
   */
  handleAppStateChange = async (nextAppState) => {
    if (this.isConnectedViaUSB) {
      return;
    }

    const connectedScale: BleManager.Peripheral = (await BleManager.getConnectedPeripherals([]))[0];
    const isBleEnabled = await this.isBluetoothEnabled();

    if (connectedScale) {
      if (nextAppState.match(/inactive|background/)) {
        this.stopNotification(connectedScale);
      } else if (nextAppState.match(/active/)) {
        this.restartNotification(connectedScale);
      }
    } else if (nextAppState.match(/active/) && isBleEnabled) {
      this.scanner.scan();
    }
  };

  handleBleStateChange = async ({ state }) => {
    switch (state) {
      case 'turning_off':
      case 'off':
        this.closeTheBleConnection();
        return;
      case 'on':
        if (this.isConnectedViaUSB) {
          return;
        }
        this.scanner.resetAndScan();
        return;
      default:
        return;
    }
  };

  /**
   * Rescan for devices, if device got unexpectecly disconnected.
   * Possible status codes:
   * 0 - device disconnected
   * 8 - device timed out and disconnected itself (GATT_CONN_TIMEOUT)
   * 133 - Android's custom generic GATT_ERROR, eg device never connected or some low-level error occured
   **
   */
  handleDisconnectedPeripheral = ({ status }) => {
    if (status !== 0) {
      return;
    }
    const shouldReconnect =
      this.bleScaleState === BleScaleState.connected ||
      this.bleScaleState === BleScaleState.connecting;
    this.weightServiceUUIDs = null;
    this.bleScaleState = BleScaleState.disconnected;
    AppState.removeEventListener('change', this.handleAppStateChange);
    if (shouldReconnect) {
      this.scanner.resetAndScan();
    }
  };

  /**
   * Parse the new message received from the scale,
   * and ultimately send it to the client
   */
  handleUpdateValueForCharacteristic = (data) => {
    let decodedMessage = String.fromCharCode(...data.value);
    this.bleMessageParser.append(decodedMessage);
  };

  /**
   * After scan has stopped and theres no connected device yet, pick closest device
   */
  handleScanStopped = async () => {
    if (this.isConnectedViaUSB) {
      return;
    }
    try {
      const discoveredDevices = await BleManager.getDiscoveredPeripherals();
      const discoveredScales = discoveredDevices.filter(
        (device) => device.name && ScaleNames.has(device.name.toLowerCase())
      );
      const closestScale: BleManager.Peripheral = discoveredScales.sort(
        (a, b) => b.rssi - a.rssi
      )[0];
      const connectedScales = await BleManager.getConnectedPeripherals([]);
      const targetScale =
        connectedScales[0] &&
        this.bleScaleState !== BleScaleState.connected &&
        this.bleScaleState !== BleScaleState.connecting
          ? connectedScales[0]
          : closestScale;
      if (targetScale) {
        this.bleScaleState = BleScaleState.connecting;
        this.bleScaleState = await this.connectToDevice(targetScale);
      }
    } catch (error) {
      console.log('handleScanStopped error', error);
    }

    if (this.bleScaleState !== BleScaleState.connected) {
      this.scanner.reScan();
    } else {
      AppState.addEventListener('change', this.handleAppStateChange);
    }
  };
}
