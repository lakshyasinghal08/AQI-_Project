import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Extended Indian cities with pin codes and popular places for autocomplete
const INDIAN_CITIES = [
  { name: "Jaipur", pincode: "302001", places: ["Amer Fort", "Hawa Mahal", "City Palace", "Jantar Mantar", "Nahargarh Fort"] },
  { name: "Delhi", pincode: "110001", places: ["India Gate", "Red Fort", "Qutub Minar", "Lotus Temple", "Connaught Place"] },
  { name: "Mumbai", pincode: "400001", places: ["Gateway of India", "Marine Drive", "Juhu Beach", "Bandra Kurla Complex", "Colaba"] },
  { name: "Bangalore", pincode: "560001", places: ["Lalbagh", "Cubbon Park", "Whitefield", "Koramangala", "MG Road"] },
  { name: "Chennai", pincode: "600001", places: ["Marina Beach", "T Nagar", "Mylapore", "Anna Nagar", "Adyar"] },
  { name: "Kolkata", pincode: "700001", places: ["Victoria Memorial", "Howrah Bridge", "Park Street", "Salt Lake", "Esplanade"] },
  { name: "Hyderabad", pincode: "500001", places: ["Charminar", "Hitech City", "Gachibowli", "Banjara Hills", "Secunderabad"] },
  { name: "Pune", pincode: "411001", places: ["Shivaji Nagar", "Koregaon Park", "Hinjewadi", "Kothrud", "Viman Nagar"] },
  { name: "Ahmedabad", pincode: "380001", places: ["Sabarmati Ashram", "Manek Chowk", "Law Garden", "SG Highway", "Satellite"] },
  { name: "Surat", pincode: "395001", places: ["Dumas Beach", "Gopi Talav", "Adajan", "Athwa", "Vesu"] },
  { name: "Lucknow", pincode: "226001", places: ["Hazratganj", "Gomti Nagar", "Aminabad", "Alambagh", "Indira Nagar"] },
  { name: "Kanpur", pincode: "208001", places: ["Mall Road", "Kidwai Nagar", "Civil Lines", "Govind Nagar", "Swaroop Nagar"] },
  { name: "Nagpur", pincode: "440001", places: ["Sitabuldi", "Sadar", "Civil Lines", "Dharampeth", "Manish Nagar"] },
  { name: "Indore", pincode: "452001", places: ["Rajwada", "Sarafa Bazaar", "Vijay Nagar", "AB Road", "Palasia"] },
  { name: "Bhopal", pincode: "462001", places: ["Upper Lake", "New Market", "MP Nagar", "Arera Colony", "Kolar Road"] },
  { name: "Jodhpur", pincode: "342001", places: ["Mehrangarh Fort", "Clock Tower", "Umaid Bhawan", "Mandore", "Sardarpura"] },
  { name: "Udaipur", pincode: "313001", places: ["City Palace", "Lake Pichola", "Fateh Sagar", "Saheliyon Ki Bari", "Sukhadia Circle"] },
];

interface LocationData {
  pm10: number;
  pm25: number;
  co2: number;
  humidity: number;
  temperature: number;
  lat?: number;
  lng?: number;
}

interface HealthAdvisory {
  type: 'pm25' | 'co2' | 'temperature';
  message: string;
}

export const WeatherComparisonSection = () => {
  const [mainCity, setMainCity] = useState("");
  const [place1, setPlace1] = useState("");
  const [place2, setPlace2] = useState("");
  const [cityData, setCityData] = useState<LocationData | null>(null);
  const [place1Data, setPlace1Data] = useState<LocationData | null>(null);
  const [place2Data, setPlace2Data] = useState<LocationData | null>(null);
  const [comparison, setComparison] = useState<{
    safer: string;
    bestPlace: string;
    advisories: HealthAdvisory[];
  } | null>(null);

  const [cityInput, setCityInput] = useState("");
  const [place1Input, setPlace1Input] = useState("");
  const [place2Input, setPlace2Input] = useState("");
  const [cityError, setCityError] = useState("");
  const [place1Error, setPlace1Error] = useState("");
  const [place2Error, setPlace2Error] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showPlace1Suggestions, setShowPlace1Suggestions] = useState(false);
  const [showPlace2Suggestions, setShowPlace2Suggestions] = useState(false);

  // Levenshtein distance for spell checking
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  // City autocomplete suggestions with alphabet filtering
  const citySuggestions = useMemo(() => {
    if (!cityInput) return [];
    const input = cityInput.toLowerCase();
    
    // First, filter by starting letter for quick suggestions
    const startsWith = INDIAN_CITIES.filter(city =>
      city.name.toLowerCase().startsWith(input.charAt(0))
    );
    
    // Then filter by contains
    const contains = INDIAN_CITIES.filter(city =>
      city.name.toLowerCase().includes(input)
    );
    
    // Combine and deduplicate
    const combined = [...new Map([...contains, ...startsWith].map(city => [city.name, city])).values()];
    
    return combined.slice(0, 8);
  }, [cityInput]);

  // Place suggestions based on selected city
  const place1Suggestions = useMemo(() => {
    if (!place1Input || !mainCity) return [];
    const selectedCity = INDIAN_CITIES.find(c => c.name === mainCity);
    if (!selectedCity || !selectedCity.places) return [];
    
    return selectedCity.places.filter(place =>
      place.toLowerCase().includes(place1Input.toLowerCase())
    );
  }, [place1Input, mainCity]);

  const place2Suggestions = useMemo(() => {
    if (!place2Input || !mainCity) return [];
    const selectedCity = INDIAN_CITIES.find(c => c.name === mainCity);
    if (!selectedCity || !selectedCity.places) return [];
    
    return selectedCity.places.filter(place =>
      place.toLowerCase().includes(place2Input.toLowerCase())
    );
  }, [place2Input, mainCity]);

  const generateMockData = (): LocationData => ({
    pm10: Math.random() * 150,
    pm25: Math.random() * 100,
    co2: 400 + Math.random() * 800,
    humidity: 40 + Math.random() * 40,
    temperature: 20 + Math.random() * 25,
    lat: 28.7041 + (Math.random() - 0.5) * 10,
    lng: 77.1025 + (Math.random() - 0.5) * 10,
  });

  const calculateSafety = (data: LocationData): number => {
    let score = 0;
    if (data.pm10 <= 100) score++;
    if (data.pm25 <= 60) score++;
    if (data.co2 <= 1000) score++;
    if (data.humidity <= 70) score++;
    if (data.temperature <= 40) score++;
    return score;
  };

  const generateHealthAdvisories = (data: LocationData): HealthAdvisory[] => {
    const advisories: HealthAdvisory[] = [];
    
    if (data.pm25 > 60) {
      advisories.push({
        type: 'pm25',
        message: '⚠️ High PM2.5 levels may cause breathing issues. Consider wearing a mask outdoors.'
      });
    }
    
    if (data.co2 > 1000) {
      advisories.push({
        type: 'co2',
        message: '⚠️ Elevated CO2 may lead to fatigue or headaches. Ensure good ventilation indoors.'
      });
    }
    
    if (data.temperature > 40) {
      advisories.push({
        type: 'temperature',
        message: '⚠️ Avoid outdoor activity due to extreme heat. Stay hydrated and seek shade.'
      });
    }

    if (data.pm10 > 100 || data.pm25 > 60) {
      advisories.push({
        type: 'pm25',
        message: '⚠️ Poor air quality detected. Limit outdoor activities and close windows.'
      });
    }
    
    return advisories;
  };

  const validateCity = (input: string) => {
    const exactMatch = INDIAN_CITIES.find(
      city => city.name.toLowerCase() === input.toLowerCase()
    );
    if (exactMatch) {
      setMainCity(exactMatch.name);
      setCityError("");
      const mockData = generateMockData();
      setCityData(mockData);
      setPlace1Data(null);
      setPlace2Data(null);
      setComparison(null);
      toast({
        title: "City Found",
        description: `Showing data for ${exactMatch.name} (PIN: ${exactMatch.pincode})`,
      });
      return true;
    }
    
    // Try autocorrect with Levenshtein distance
    const closestMatch = INDIAN_CITIES.reduce((closest, city) => {
      const distance = levenshteinDistance(input.toLowerCase(), city.name.toLowerCase());
      if (!closest || distance < closest.distance) {
        return { city, distance };
      }
      return closest;
    }, null as { city: typeof INDIAN_CITIES[0]; distance: number } | null);
    
    if (closestMatch && closestMatch.distance <= 3) {
      setCityError(`Did you mean "${closestMatch.city.name}"? (Wrong spelling: "${input}")`);
    } else {
      const suggestions = INDIAN_CITIES.filter(city =>
        city.name.toLowerCase().includes(input.toLowerCase())
      );
      if (suggestions.length > 0) {
        setCityError(`Wrong spelling. Did you mean: ${suggestions.map(s => s.name).join(", ")}?`);
      } else {
        setCityError(`City "${input}" not found. Please check spelling.`);
      }
    }
    return false;
  };

  const validatePlace = (input: string, setter: (val: string) => void, errorSetter: (val: string) => void, placeType: 'place1' | 'place2') => {
    if (input.trim().length < 2) {
      errorSetter("Please enter a valid place name (at least 2 characters)");
      return false;
    }
    
    const selectedCity = INDIAN_CITIES.find(c => c.name === mainCity);
    if (!selectedCity || !selectedCity.places) {
      setter(input);
      errorSetter("");
      return true;
    }
    
    // Check if place exists in the city's known places
    const exactMatch = selectedCity.places.find(
      place => place.toLowerCase() === input.toLowerCase()
    );
    
    if (exactMatch) {
      setter(exactMatch);
      errorSetter("");
      return true;
    }
    
    // Try autocorrect with Levenshtein distance
    const closestMatch = selectedCity.places.reduce((closest, place) => {
      const distance = levenshteinDistance(input.toLowerCase(), place.toLowerCase());
      if (!closest || distance < closest.distance) {
        return { place, distance };
      }
      return closest;
    }, null as { place: string; distance: number } | null);
    
    if (closestMatch && closestMatch.distance <= 3) {
      errorSetter(`Did you mean "${closestMatch.place}"? (Wrong spelling: "${input}")`);
      return false;
    }
    
    // Allow custom place names
    setter(input);
    errorSetter("");
    return true;
  };

  const handleCitySubmit = () => {
    if (validateCity(cityInput)) {
      setCityInput("");
      setShowCitySuggestions(false);
    }
  };

  const handleComparison = () => {
    const isPlace1Valid = validatePlace(place1Input, setPlace1, setPlace1Error, 'place1');
    const isPlace2Valid = validatePlace(place2Input, setPlace2, setPlace2Error, 'place2');
    
    if (isPlace1Valid && isPlace2Valid && mainCity) {
      const mockPlace1Data = generateMockData();
      const mockPlace2Data = generateMockData();
      setPlace1Data(mockPlace1Data);
      setPlace2Data(mockPlace2Data);
      
      const place1Score = calculateSafety(mockPlace1Data);
      const place2Score = calculateSafety(mockPlace2Data);
      
      const safer = place1Score > place2Score ? place1Input : place2Score > place1Score ? place2Input : "Both locations have similar air quality";
      const bestPlace = place1Score > place2Score ? place1Input : place2Input;
      const unsafeLocation = place1Score < place2Score ? mockPlace1Data : mockPlace2Data;
      const advisories = generateHealthAdvisories(unsafeLocation);
      
      setComparison({ safer, bestPlace, advisories });
      
      toast({
        title: "Comparison Complete",
        description: `Analyzed air quality for ${place1Input} and ${place2Input} in ${mainCity}`,
      });
      
      setPlace1Input("");
      setPlace2Input("");
      setShowPlace1Suggestions(false);
      setShowPlace2Suggestions(false);
    }
  };

  return (
    <section className="py-12 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl space-y-8">

        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Weather Information & Comparison
        </h2>

        {/* Main City Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Main City</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Enter city name (e.g., Delhi, Jaipur)"
                  value={cityInput}
                  onChange={(e) => {
                    setCityInput(e.target.value);
                    setShowCitySuggestions(true);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleCitySubmit()}
                  onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                  className="flex-1"
                />
                {citySuggestions.length > 0 && cityInput && showCitySuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                    {citySuggestions.map((city) => (
                      <div
                        key={city.pincode}
                        className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                        onClick={() => {
                          setCityInput(city.name);
                          validateCity(city.name);
                          setShowCitySuggestions(false);
                        }}
                      >
                        <div className="font-medium text-foreground">{city.name}</div>
                        <div className="text-xs text-muted-foreground">PIN: {city.pincode}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={handleCitySubmit} className="bg-primary hover:bg-primary/90">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            {cityError && (
              <p className="text-sm text-destructive mt-2">{cityError}</p>
            )}
            {mainCity && !cityError && (
              <p className="text-sm text-success mt-2">✓ {mainCity} selected</p>
            )}
          </CardContent>
        </Card>

        {/* City Data Display */}
        {cityData && (
          <div className="space-y-6 animate-fade-in">
            <Card className="overflow-hidden">
              <div className="relative h-64 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-success mx-auto mb-4 animate-bounce" style={{ fill: '#2ecc71' }} />
                  <p className="text-lg font-semibold text-foreground">{mainCity}</p>
                  <p className="text-sm text-muted-foreground">
                    Lat: {cityData.lat?.toFixed(4)}, Lng: {cityData.lng?.toFixed(4)}
                  </p>
                  <p className="text-sm font-medium text-success mt-2">✅ Safe Location</p>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-foreground">Air Quality Readings</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center transition-all hover:scale-105">
                    <p className="text-sm text-muted-foreground mb-1">PM10</p>
                    <p className={`text-2xl font-bold ${cityData.pm10 <= 100 ? 'text-success' : 'text-destructive'}`}>
                      {cityData.pm10.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">μg/m³</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center transition-all hover:scale-105">
                    <p className="text-sm text-muted-foreground mb-1">PM2.5</p>
                    <p className={`text-2xl font-bold ${cityData.pm25 <= 60 ? 'text-success' : 'text-destructive'}`}>
                      {cityData.pm25.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">μg/m³</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center transition-all hover:scale-105">
                    <p className="text-sm text-muted-foreground mb-1">CO2</p>
                    <p className={`text-2xl font-bold ${cityData.co2 <= 1000 ? 'text-success' : 'text-destructive'}`}>
                      {cityData.co2.toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">ppm</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center transition-all hover:scale-105">
                    <p className="text-sm text-muted-foreground mb-1">Humidity</p>
                    <p className={`text-2xl font-bold ${cityData.humidity <= 70 ? 'text-success' : 'text-destructive'}`}>
                      {cityData.humidity.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">%</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center transition-all hover:scale-105">
                    <p className="text-sm text-muted-foreground mb-1">Temperature</p>
                    <p className={`text-2xl font-bold ${cityData.temperature <= 40 ? 'text-success' : 'text-destructive'}`}>
                      {cityData.temperature.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">°C</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Two Place Comparison Search */}
            <Card className="bg-gradient-to-br from-card to-muted/20">
              <CardHeader>
                <CardTitle>Compare Two Places in {mainCity}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder={`Compare Place 1 in ${mainCity}`}
                      value={place1Input}
                      onChange={(e) => {
                        setPlace1Input(e.target.value);
                        setShowPlace1Suggestions(true);
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleComparison()}
                      onBlur={() => setTimeout(() => setShowPlace1Suggestions(false), 200)}
                    />
                    {place1Suggestions.length > 0 && place1Input && showPlace1Suggestions && (
                      <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                        {place1Suggestions.map((place, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-2 hover:bg-accent cursor-pointer text-sm text-foreground"
                            onClick={() => {
                              setPlace1Input(place);
                              setShowPlace1Suggestions(false);
                            }}
                          >
                            {place}
                          </div>
                        ))}
                      </div>
                    )}
                    {place1Error && (
                      <p className="text-sm text-destructive mt-1">{place1Error}</p>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder={`Compare Place 2 in ${mainCity}`}
                      value={place2Input}
                      onChange={(e) => {
                        setPlace2Input(e.target.value);
                        setShowPlace2Suggestions(true);
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleComparison()}
                      onBlur={() => setTimeout(() => setShowPlace2Suggestions(false), 200)}
                    />
                    {place2Suggestions.length > 0 && place2Input && showPlace2Suggestions && (
                      <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                        {place2Suggestions.map((place, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-2 hover:bg-accent cursor-pointer text-sm text-foreground"
                            onClick={() => {
                              setPlace2Input(place);
                              setShowPlace2Suggestions(false);
                            }}
                          >
                            {place}
                          </div>
                        ))}
                      </div>
                    )}
                    {place2Error && (
                      <p className="text-sm text-destructive mt-1">{place2Error}</p>
                    )}
                  </div>
                  <Button 
                    onClick={handleComparison}
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={!place1Input || !place2Input}
                  >
                    Compare Places
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Comparison Results */}
        {place1Data && place2Data && comparison && (
          <div className="space-y-6 animate-fade-in">
            {/* Map Visualization */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-64 bg-gradient-to-br from-primary/5 to-primary/10">
                  <div className="absolute inset-0 flex items-center justify-around p-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className={`relative ${comparison.safer === place1 ? 'text-success' : 'text-destructive'}`}>
                        <MapPin 
                          className="h-12 w-12" 
                          style={{ fill: comparison.safer === place1 ? '#2ecc71' : '#e74c3c' }} 
                        />
                        {comparison.safer === place1 && (
                          <CheckCircle2 className="absolute -top-1 -right-1 h-5 w-5 text-success bg-background rounded-full" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground">{place1}</p>
                        {comparison.safer === place1 ? (
                          <p className="text-sm text-success font-medium">✅ Safer for you</p>
                        ) : (
                          <p className="text-sm text-destructive font-medium">⚠️ Unsafe</p>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 h-px bg-border mx-4"></div>

                    <div className="flex flex-col items-center gap-2">
                      <div className={`relative ${comparison.safer === place2 ? 'text-success' : 'text-destructive'}`}>
                        <MapPin 
                          className="h-12 w-12" 
                          style={{ fill: comparison.safer === place2 ? '#2ecc71' : '#e74c3c' }} 
                        />
                        {comparison.safer === place2 && (
                          <CheckCircle2 className="absolute -top-1 -right-1 h-5 w-5 text-success bg-background rounded-full" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground">{place2}</p>
                        {comparison.safer === place2 ? (
                          <p className="text-sm text-success font-medium">✅ Safer for you</p>
                        ) : (
                          <p className="text-sm text-destructive font-medium">⚠️ Unsafe</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Best Place to Visit */}
            <Card className="border-2 border-success bg-gradient-to-r from-success/5 to-success/10">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Best Place to Visit</p>
                  <p className="text-2xl font-bold text-success">{comparison.bestPlace}</p>
                </div>
              </CardContent>
            </Card>

            {/* Safety Recommendation */}
            <Card className="border-2 border-primary bg-gradient-to-r from-card to-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                  <p className="text-lg font-semibold text-foreground">
                    <span className="text-success">{comparison.safer}</span> is safer for you to visit
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Health Advisories */}
            {comparison.advisories.length > 0 && (
              <Card className="border-2 border-destructive/50 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Health Advisory
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {comparison.advisories.map((advisory, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-background border border-destructive/20"
                    >
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-foreground">{advisory.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Detailed Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className={comparison.safer === place1 ? "border-2 border-success" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {place1}
                    {comparison.safer === place1 && (
                      <span className="text-success text-sm flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Safer
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PM10:</span>
                    <span className={place1Data.pm10 <= 100 ? "text-success" : "text-destructive"}>
                      {place1Data.pm10.toFixed(1)} μg/m³
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PM2.5:</span>
                    <span className={place1Data.pm25 <= 60 ? "text-success" : "text-destructive"}>
                      {place1Data.pm25.toFixed(1)} μg/m³
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CO2:</span>
                    <span className={place1Data.co2 <= 1000 ? "text-success" : "text-destructive"}>
                      {place1Data.co2.toFixed(0)} ppm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Humidity:</span>
                    <span className={place1Data.humidity <= 70 ? "text-success" : "text-destructive"}>
                      {place1Data.humidity.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temperature:</span>
                    <span className={place1Data.temperature <= 40 ? "text-success" : "text-destructive"}>
                      {place1Data.temperature.toFixed(1)}°C
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className={comparison.safer === place2 ? "border-2 border-success" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {place2}
                    {comparison.safer === place2 && (
                      <span className="text-success text-sm flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Safer
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PM10:</span>
                    <span className={place2Data.pm10 <= 100 ? "text-success" : "text-destructive"}>
                      {place2Data.pm10.toFixed(1)} μg/m³
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PM2.5:</span>
                    <span className={place2Data.pm25 <= 60 ? "text-success" : "text-destructive"}>
                      {place2Data.pm25.toFixed(1)} μg/m³
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CO2:</span>
                    <span className={place2Data.co2 <= 1000 ? "text-success" : "text-destructive"}>
                      {place2Data.co2.toFixed(0)} ppm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Humidity:</span>
                    <span className={place2Data.humidity <= 70 ? "text-success" : "text-destructive"}>
                      {place2Data.humidity.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temperature:</span>
                    <span className={place2Data.temperature <= 40 ? "text-success" : "text-destructive"}>
                      {place2Data.temperature.toFixed(1)}°C
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
