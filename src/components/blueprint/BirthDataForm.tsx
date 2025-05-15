
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BirthDataFormProps {
  birthData: {
    birthDate: string;
    birthTime: string;
    birthLocation: string;
    timezone: string;
  };
  onChange: (data: {
    birthDate: string;
    birthTime: string;
    birthLocation: string;
    timezone: string;
  }) => void;
}

export const BirthDataForm: React.FC<BirthDataFormProps> = ({ birthData, onChange }) => {
  const [location, setLocation] = useState(birthData.birthLocation);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Update form data with new values
  const updateData = (key: string, value: string) => {
    onChange({
      ...birthData,
      [key]: value
    });
  };

  // Function to get location suggestions
  const getLocationSuggestions = async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    // Simulate loading suggestions - in a real app this would call an API
    setIsLoadingSuggestions(true);
    setTimeout(() => {
      // Example suggestions based on input
      const exampleCities = [
        "New York, USA",
        "Los Angeles, USA",
        "London, UK",
        "Paris, France",
        "Tokyo, Japan",
        "Sydney, Australia",
        "Toronto, Canada",
        "Berlin, Germany",
        "Mumbai, India",
        "Beijing, China",
      ];
      
      const filteredCities = exampleCities.filter(city => 
        city.toLowerCase().includes(input.toLowerCase())
      );
      
      setSuggestions(filteredCities.length > 0 ? filteredCities : []);
      setIsLoadingSuggestions(false);
    }, 500);
  };

  // Handle location input change with debounce
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    updateData('birthLocation', value);
    
    // Debounce the suggestion request
    const timeoutId = setTimeout(() => {
      getLocationSuggestions(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  // Select a suggestion
  const selectSuggestion = (suggestion: string) => {
    setLocation(suggestion);
    updateData('birthLocation', suggestion);
    setSuggestions([]);
  };

  // Format the date to ensure it uses YYYY-MM-DD format
  const formatDate = (date: string) => {
    if (!date) return '';
    
    try {
      const [year, month, day] = date.split('-').map(Number);
      return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    } catch (e) {
      return date;
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="birthDate">Birth Date</Label>
        <Input
          id="birthDate"
          type="date"
          value={birthData.birthDate}
          onChange={(e) => updateData('birthDate', formatDate(e.target.value))}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="birthTime">Birth Time (as precise as possible)</Label>
        <Input
          id="birthTime"
          type="time"
          value={birthData.birthTime}
          onChange={(e) => updateData('birthTime', e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          If you don't know your exact birth time, please use 12:00
        </p>
      </div>
      
      <div className="space-y-2 relative">
        <Label htmlFor="birthLocation">Birth Location (City, Country)</Label>
        <Input
          id="birthLocation"
          type="text"
          value={location}
          onChange={handleLocationChange}
          placeholder="e.g. New York, USA"
          required
        />
        
        {isLoadingSuggestions && (
          <div className="absolute right-3 top-8">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
        
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-accent cursor-pointer"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <select
          id="timezone"
          className="w-full px-4 py-2 border border-border rounded-md bg-card"
          value={birthData.timezone}
          onChange={(e) => updateData('timezone', e.target.value)}
        >
          <option value="UTC">UTC (Coordinated Universal Time)</option>
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Chicago">Central Time (CT)</option>
          <option value="America/Denver">Mountain Time (MT)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
          <option value="Europe/London">London (GMT/BST)</option>
          <option value="Europe/Paris">Central European (CET/CEST)</option>
          <option value="Asia/Tokyo">Japan (JST)</option>
          <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
        </select>
        <p className="text-xs text-muted-foreground">
          The system will automatically adjust for historical timezone changes
        </p>
      </div>
    </div>
  );
};
