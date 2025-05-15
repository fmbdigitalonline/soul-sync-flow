
import { Clock } from "lucide-react";
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  
  // Handle manual time input
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Helper to set common time values quickly
  const handleSetTime = (hour: number, minute: number) => {
    const hourString = hour.toString().padStart(2, '0');
    const minuteString = minute.toString().padStart(2, '0');
    onChange(`${hourString}:${minuteString}`);
    setOpen(false);
  };

  const timeFormat = (time: string) => {
    if (!time) return 'Select time';
    
    // If time is already in HH:MM format, return it
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      return time;
    }
    
    return 'Select time';
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <Clock className="mr-2 h-4 w-4" />
            {timeFormat(value)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timeInput">Enter Time</Label>
              <Input
                id="timeInput"
                type="time"
                value={value}
                onChange={handleTimeChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSetTime(6, 0)}
              >
                6:00 AM
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSetTime(9, 0)}
              >
                9:00 AM
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSetTime(12, 0)}
              >
                12:00 PM
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSetTime(15, 0)}
              >
                3:00 PM
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSetTime(18, 0)}
              >
                6:00 PM
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSetTime(21, 0)}
              >
                9:00 PM
              </Button>
            </div>
            <Button 
              className="w-full" 
              onClick={() => handleSetTime(0, 0)}
            >
              Not known
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
