
import React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TimePicker } from "@/components/ui/time-picker";
import { CalendarIcon } from "lucide-react";

export interface BirthDataFormProps {
  birthData: {
    birthDate: string;
    birthTime: string;
    birthLocation: string;
    timezone: string;
  };
  onChange: (data: BirthDataFormProps["birthData"]) => void;
  showDateOnly?: boolean;
  showTimeOnly?: boolean;
  showLocationOnly?: boolean;
  className?: string;
}

export const BirthDataForm: React.FC<BirthDataFormProps> = ({
  birthData,
  onChange,
  showDateOnly = false,
  showTimeOnly = false,
  showLocationOnly = false,
  className,
}) => {
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      onChange({
        ...birthData,
        birthDate: format(date, "yyyy-MM-dd"),
      });
    }
  };

  const handleTimeChange = (time: string) => {
    onChange({
      ...birthData,
      birthTime: time,
    });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...birthData,
      birthLocation: e.target.value,
    });
  };

  const handleTimezoneChange = (timezone: string) => {
    onChange({
      ...birthData,
      timezone,
    });
  };

  // If no show flags are specified, show all forms
  const showAll = !showDateOnly && !showTimeOnly && !showLocationOnly;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Birth Date */}
      {(showAll || showDateOnly) && (
        <div className="space-y-2">
          <Label htmlFor="birthDate">Birth Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal bg-white/5",
                  !birthData.birthDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {birthData.birthDate ? (
                  format(new Date(birthData.birthDate), "PPP")
                ) : (
                  <span>Select your date of birth</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                captionLayout="dropdown-buttons"
                selected={birthData.birthDate ? new Date(birthData.birthDate) : undefined}
                onSelect={handleDateChange}
                initialFocus
                fromYear={1900}
                toYear={new Date().getFullYear()}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Birth Time */}
      {(showAll || showTimeOnly) && (
        <div className="space-y-2">
          <Label htmlFor="birthTime">Birth Time (if known)</Label>
          <TimePicker
            value={birthData.birthTime}
            onChange={handleTimeChange}
            className="bg-white/5"
          />
        </div>
      )}

      {/* Birth Location */}
      {(showAll || showLocationOnly) && (
        <div className="space-y-2">
          <Label htmlFor="birthLocation">Birth Location (City, Country)</Label>
          <Input
            id="birthLocation"
            value={birthData.birthLocation}
            onChange={handleLocationChange}
            placeholder="e.g., New York, USA"
            className="bg-white/5"
          />
        </div>
      )}

      {/* Timezone - Only show if date or time is shown */}
      {(showAll || showDateOnly || showTimeOnly) && (
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select
            value={birthData.timezone}
            onValueChange={handleTimezoneChange}
          >
            <SelectTrigger className="bg-white/5">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
              <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
              <SelectItem value="America/Chicago">Central Time (US & Canada)</SelectItem>
              <SelectItem value="America/Denver">Mountain Time (US & Canada)</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectItem>
              <SelectItem value="Europe/London">London</SelectItem>
              <SelectItem value="Europe/Paris">Paris</SelectItem>
              <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
              <SelectItem value="Australia/Sydney">Sydney</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
