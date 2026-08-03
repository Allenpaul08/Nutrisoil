import { useHardware } from '../context/HardwareContext';

export const useSensorData = () => {
  const { sensorState, updateSensors, isLiveHardware, toggleHardwareMode } = useHardware();
  return { sensorState, updateSensors, isLiveHardware, toggleHardwareMode };
};
