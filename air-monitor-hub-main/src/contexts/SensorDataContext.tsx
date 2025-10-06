import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";

export interface SensorData {
  pm10: number;
  pm25: number;
  co2: number;
  humidity: number;
  temperature: number;
}

interface SensorDataContextType {
  sensorData: SensorData;
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

  const pollingRef = useRef<number | null>(null);

  useEffect(() => {
    const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';

    const fetchLatest = async () => {
      try {
        // Try configured backend base URL (default localhost:8080)
        const res = await fetch(`${API_BASE}/readings`);
        if (!res.ok) throw new Error('Backend read failed');
        const data = await res.json();
        // API might return array of readings; pick last
        const last = Array.isArray(data) ? data[data.length - 1] : data;
        if (last) {
          setSensorData(prev => ({
            pm10: last.pm10 ?? prev.pm10,
            pm25: last.pm25 ?? prev.pm25,
            co2: last.co2 ?? prev.co2,
            humidity: last.humidity ?? prev.humidity,
            temperature: last.temperature ?? prev.temperature,
          }));
        }
      } catch (e) {
        // keep previous values on error; optionally console log
        // console.warn('Failed to fetch backend readings', e);
      }
    };

    // Initial fetch and then poll every 5 seconds
    fetchLatest();
    pollingRef.current = window.setInterval(fetchLatest, 5000) as unknown as number;

    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current as unknown as number);
    };
  }, []);

  const updateSensorData = (data: Partial<SensorData>) => {
    setSensorData(prev => ({ ...prev, ...data }));
  };

  return (
    <SensorDataContext.Provider value={{ sensorData, updateSensorData }}>
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
