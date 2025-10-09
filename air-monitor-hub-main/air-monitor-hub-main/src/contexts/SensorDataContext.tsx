import { createContext, useContext, useState, ReactNode, useEffect } from "react";

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

  const updateSensorData = (data: Partial<SensorData>) => {
    setSensorData(prev => ({ ...prev, ...data }));
  };

  useEffect(() => {
    let mounted = true;

    // Compose candidate backend bases: prefer env var, otherwise try typical backend ports
    const envBase = (import.meta as any).env?.VITE_API_BASE;
    const candidates: string[] = [];
    if (envBase && typeof envBase === 'string' && envBase.trim() !== '') {
      candidates.push(envBase.replace(/\/$/, ''));
    }
    // Common defaults used by this repo: 5008 (preferred) then 5000
    candidates.push('http://localhost:5008');
    candidates.push('http://localhost:5000');

    const fetchLatest = async () => {
      for (const base of candidates) {
        try {
          const url = `${base}/readings`;
          const res = await fetch(url, { cache: 'no-store' });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          const json = await res.json();
          if (mounted && json) {
            setSensorData(prev => ({
              pm10: json.pm10 ?? prev.pm10,
              pm25: json.pm25 ?? prev.pm25,
              co2: json.co2 ?? prev.co2,
              humidity: json.humidity ?? prev.humidity,
              temperature: json.temperature ?? prev.temperature,
            }));
            return;
          }
        } catch (e) {
          // try next candidate
        }
      }
      // If none of the backends responded, keep simulated/mock data in place
    };

    // Initial fetch + polling
    fetchLatest();
    const iv = setInterval(fetchLatest, 5000);

    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, []);

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
