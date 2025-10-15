import { Header } from "@/components/Header";
import { LiveAirQuality } from "@/components/LiveAirQuality";
import { WeatherComparisonSection } from "@/components/WeatherComparisonSection";
import { SensorCharts } from "@/components/SensorCharts";
import { HistoricalData } from "@/components/HistoricalData";
import { AlertsPanel } from "@/components/AlertsPanel";
import { useSensorData } from "@/contexts/SensorDataContext";
import { useSensorDataSync } from "@/hooks/useSensorDataSync";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { sensorData } = useSensorData();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useSensorDataSync(sensorData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Header />
      
      <main className="pt-16">
        <LiveAirQuality />
        
        <section className="py-16 px-4 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-4xl font-bold text-center mb-4 text-gradient">Real-Time Data Visualization</h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Monitor live air quality metrics with interactive charts updating every 3 seconds
            </p>
            <div className="animate-fade-in">
              <SensorCharts />
            </div>
          </div>
        </section>

        {user ? (
          <>
            <section className="py-16 px-4 bg-muted/30 backdrop-blur-sm">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-4xl font-bold text-center mb-4 text-gradient">Historical Data Analysis</h2>
                <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
                  View past readings, analyze trends, and export data for further analysis
                </p>
                <HistoricalData />
              </div>
            </section>

            <section className="py-16 px-4 bg-gradient-to-b from-transparent to-primary/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-4xl font-bold text-center mb-4 text-gradient">Alert Management</h2>
                <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
                  Configure custom alerts and stay informed about air quality changes
                </p>
                <AlertsPanel />
              </div>
            </section>

          </>
        ) : (
          <section className="py-16 px-4 bg-gradient-to-br from-primary/10 to-accent/10">
            <div className="container mx-auto max-w-2xl text-center">
              <div className="animate-float inline-block mb-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                  <LogIn className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4">Unlock Advanced Features</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Sign in to access historical data analysis, custom alerts, real-time notifications, and data export capabilities.
              </p>
              <Button onClick={() => navigate('/auth')} size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                <LogIn className="mr-2 h-5 w-5" />
                Sign In / Sign Up
              </Button>
            </div>
          </section>
        )}

        <WeatherComparisonSection />
      </main>
      
      <footer className="bg-card/80 backdrop-blur-sm border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gradient mb-2">Team Project - AI & DS - B</h2>
            <p className="text-muted-foreground"> Air Quality Monitoring System</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-muted/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-primary">Team Members</h3>
              <ul className="space-y-2 text-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  LAKSHYA Goyal
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  Manish Sharma
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  LAKSHYA Singhal
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-warning"></div>
                  Kuldeep Sihag
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-destructive"></div>
                  Kumawat Yogesh
                </li>
              </ul>
            </div>
            <div className="bg-muted/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-accent">RTU Roll Numbers</h3>
              <ul className="space-y-2 text-foreground font-mono text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  24EARAD089
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  24EARAD094
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  24EARAD090
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-warning"></div>
                  24EARAD084
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-destructive"></div>
                  24EARAD085
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
