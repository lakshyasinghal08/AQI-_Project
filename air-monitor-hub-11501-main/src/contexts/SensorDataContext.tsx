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
  updateSensorData: (data: Partial<SensorData>) => void;
}

const SensorDataContext = createContext<SensorDataContextType | undefined>(undefined);

const DEFAULT_API_BASES = [
  (import.meta.env.VITE_API_BASE as string | undefined) || undefined,
  'http://localhost:5008',
  'http://localhost:5000'
];

function pickApiBase() {
  for (const b of DEFAULT_API_BASES) {
    if (!b) continue;
    try {
      // Basic validation
      // eslint-disable-next-line no-new
      new URL(b);
      return b.replace(/\/$/, '');
    } catch (_) {
      continue;
    }
  }
  return 'http://localhost:5000';
}

export const SensorDataProvider = ({ children }: { children: ReactNode }) => {
  const [sensorData, setSensorData] = useState<SensorData>({
    pm10: 45,
    pm25: 32,
    co2: 450,
    humidity: 55,
    temperature: 24,
  });

  const API_BASE = pickApiBase();

  // Poll backend /readings every 3 seconds. If backend is not reachable, keep local simulation.
  useEffect(() => {
    let mounted = true;
    const fetchLatest = async () => {
      try {
        const res = await fetch(`${API_BASE}/readings`, { method: 'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        // Ensure numeric fields exist and update state
        setSensorData(prev => ({
          pm10: typeof data.pm10 === 'number' ? data.pm10 : prev.pm10,
          pm25: typeof data.pm25 === 'number' ? data.pm25 : prev.pm25,
          co2: typeof data.co2 === 'number' ? data.co2 : prev.co2,
          humidity: typeof data.humidity === 'number' ? data.humidity : prev.humidity,
          temperature: typeof data.temperature === 'number' ? data.temperature : prev.temperature,
        }));
      } catch (e) {
        // Backend not reachable; fall back to small local random walk to keep UI lively
        setSensorData(prev => ({
          pm10: Math.max(0, +(prev.pm10 + (Math.random() - 0.5) * 4).toFixed(1)),
          pm25: Math.max(0, +(prev.pm25 + (Math.random() - 0.5) * 3).toFixed(1)),
          co2: Math.max(400, Math.round(prev.co2 + (Math.random() - 0.5) * 20)),
          humidity: Math.max(0, Math.min(100, +(prev.humidity + (Math.random() - 0.5) * 2).toFixed(1))),
          temperature: Math.max(0, Math.min(50, +(prev.temperature + (Math.random() - 0.5) * 0.5).toFixed(1)))
        }));
      }
    };

    // Initial fetch immediately, then interval
    fetchLatest();
    const id = setInterval(fetchLatest, 3000);
    return () => { mounted = false; clearInterval(id); };
  }, [API_BASE]);

  // Local update function used by UI/testing components
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
