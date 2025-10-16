import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface SensorData {
  pm10: number;
  pm25: number;
  co2: number;
  humidity: number;
  temperature: number;
}

interface SensorDataContextType {
  sensorData: SensorData;
  isConnected: boolean;
  updateSensorData: (data: Partial<SensorData>) => void;
}

const SensorDataContext = createContext<SensorDataContextType | undefined>(undefined);

export const SensorDataProvider = ({ children }: { children: ReactNode }) => {
  const [sensorData, setSensorData] = useState<SensorData>({
    pm10: 45,
    pm25: 32,
    co2: 450,
    humidity: 55,
    temperature: 24,
  });
  const [isConnected, setIsConnected] = useState(true);

  // Simulate real-time sensor data changes
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => ({
        pm10: Math.max(0, prev.pm10 + (Math.random() - 0.5) * 10),
        pm25: Math.max(0, prev.pm25 + (Math.random() - 0.5) * 8),
        co2: Math.max(400, prev.co2 + (Math.random() - 0.5) * 50),
        humidity: Math.max(0, Math.min(100, prev.humidity + (Math.random() - 0.5) * 5)),
        temperature: Math.max(0, Math.min(50, prev.temperature + (Math.random() - 0.5) * 3)),
      }));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const updateSensorData = (data: Partial<SensorData>) => {
    setSensorData(prev => ({ ...prev, ...data }));
  };

  return (
    <SensorDataContext.Provider value={{ sensorData, isConnected, updateSensorData }}>
      {children}
    </SensorDataContext.Provider>
  );
};

export const useSensorData = () => {
  const context = useContext(SensorDataContext);
  if (!context) {
    throw new Error("useSensorData must be used within SensorDataProvider");
  }
  return context;
};
