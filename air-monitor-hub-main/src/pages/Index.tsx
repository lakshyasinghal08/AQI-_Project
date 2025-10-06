import { Header } from "@/components/Header";
import { LiveAirQuality } from "@/components/LiveAirQuality";
import { WeatherComparisonSection } from "@/components/WeatherComparisonSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      
      <main className="pt-16">
        <LiveAirQuality />
        <WeatherComparisonSection />
      </main>
      
      <footer className="bg-card border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Team Project - AI & DS - B</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-base font-medium mb-3 text-muted-foreground">Name</h3>
              <ul className="space-y-2 text-foreground">
                <li>LAKSHYA Singhal</li>
                <li>LAKSHYA Goyal</li>
                <li>Manish Sharma</li>
                <li>Kuldeep Sihag</li>
                <li>Kumawat Yogesh</li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-medium mb-3 text-muted-foreground">RTU Rollno</h3>
              <ul className="space-y-2 text-foreground">
                <li>24EARAD090</li>
                <li>24EARAD089</li>
                <li>24EARAD094</li>
                <li>24EARAD084</li>
                <li>24EARAD085</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
