import { useHardware } from '../context/HardwareContext';
import { connectESP32BLE } from '../services/hardware';

export const useHardwareMode = () => {
  const { isLiveHardware, toggleHardwareMode } = useHardware();

  const connectBLE = async () => {
    const success = await connectESP32BLE();
    if (success) {
      toggleHardwareMode(true);
    }
    return success;
  };

  return {
    isLiveHardware,
    toggleHardwareMode,
    connectBLE
  };
};
