// ESP32 Bluetooth / Prototype Hardware Interface Service

export const connectESP32BLE = async (onDataReceived) => {
  if (!navigator.bluetooth) {
    console.warn('Web Bluetooth API not available in this browser.');
    return false;
  }

  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: 'ESP32-NPK' }],
      optionalServices: ['battery_service', 'environmental_sensing']
    });

    const server = await device.gatt.connect();
    console.log('Connected to ESP32 BLE Device:', device.name);
    
    // Listen for disconnect
    device.addEventListener('gattserverdisconnected', () => {
      console.log('ESP32 BLE Disconnected');
    });

    return true;
  } catch (error) {
    console.error('BLE connection failed:', error);
    return false;
  }
};
