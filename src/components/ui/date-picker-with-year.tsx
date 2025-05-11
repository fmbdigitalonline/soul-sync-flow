
import * as React from "react";
import { format, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

interface DatePickerWithYearProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePickerWithYear({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
}: DatePickerWithYearProps) {
  const isMobile = useIsMobile();
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [selectedYear, setSelectedYear] = React.useState<string>(
    date ? date.getFullYear().toString() : new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = React.useState<string>(
    date ? (date.getMonth() + 1).toString() : (new Date().getMonth() + 1).toString()
  );

  // Generate year options (current year down to 150 years ago for birth dates)
  const currentYear = new Date().getFullYear();
  const years = React.useMemo(() => {
    const yearsArray = [];
    for (let year = currentYear; year >= currentYear - 150; year--) {
      yearsArray.push(year.toString());
    }
    return yearsArray;
  }, [currentYear]);

  // Generate month options
  const months = React.useMemo(() => {
    return [
      { value: "1", label: "January" },
      { value: "2", label: "February" },
      { value: "3", label: "March" },
      { value: "4", label: "April" },
      { value: "5", label: "May" },
      { value: "6", label: "June" },
      { value: "7", label: "July" },
      { value: "8", label: "August" },
      { value: "9", label: "September" },
      { value: "10", label: "October" },
      { value: "11", label: "November" },
      { value: "12", label: "December" },
    ];
  }, []);

  // Update calendar view when year or month changes
  React.useEffect(() => {
    if (selectedYear && selectedMonth) {
      const newDate = new Date();
      newDate.setFullYear(parseInt(selectedYear));
      newDate.setMonth(parseInt(selectedMonth) - 1);
      
      // Don't trigger onDateChange, just update the calendar view
      if (date) {
        const updatedDate = new Date(date);
        updatedDate.setFullYear(parseInt(selectedYear));
        updatedDate.setMonth(parseInt(selectedMonth) - 1);
        
        // Only update if the day exists in the selected month (avoid invalid dates)
        const daysInMonth = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
        if (date.getDate() <= daysInMonth) {
          updatedDate.setDate(date.getDate());
          onDateChange(updatedDate);
        } else {
          // Set to last day of month if current day doesn't exist in selected month
          updatedDate.setDate(daysInMonth);
          onDateChange(updatedDate);
        }
      }
    }
  }, [selectedYear, selectedMonth]);

  // Update selected year and month when date changes
  React.useEffect(() => {
    if (date) {
      setSelectedYear(date.getFullYear().toString());
      setSelectedMonth((date.getMonth() + 1).toString());
    }
  }, [date]);

  // Handle native date input for mobile - improved for birth date selection
  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      onDateChange(undefined);
      return;
    }
    
    const selectedDate = parse(e.target.value, "yyyy-MM-dd", new Date());
    onDateChange(selectedDate);
  };

  // Mobile-friendly native date input with special handling for birth dates
  if (isMobile) {
    return (
      <div className="space-y-2 w-full">
        {/* Custom Year Selector for Mobile */}
        <div className="flex gap-2 w-full">
          <div className="flex-1">
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                
                // Create a new date with the selected month and year
                if (date) {
                  const newDate = new Date(date);
                  newDate.setMonth(parseInt(e.target.value) - 1);
                  
                  // Check if the day is valid in the new month
                  const daysInMonth = new Date(
                    parseInt(selectedYear), 
                    parseInt(e.target.value), 
                    0
                  ).getDate();
                  
                  if (date.getDate() > daysInMonth) {
                    newDate.setDate(daysInMonth);
                  }
                  
                  onDateChange(newDate);
                } else {
                  // If no date is selected yet, create one with today's day
                  const newDate = new Date();
                  newDate.setFullYear(parseInt(selectedYear));
                  newDate.setMonth(parseInt(e.target.value) - 1);
                  onDateChange(newDate);
                }
              }}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              disabled={disabled}
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                
                // Create a new date with the selected year
                if (date) {
                  const newDate = new Date(date);
                  newDate.setFullYear(parseInt(e.target.value));
                  onDateChange(newDate);
                } else {
                  // If no date is selected yet, create one
                  const newDate = new Date();
                  newDate.setFullYear(parseInt(e.target.value));
                  newDate.setMonth(parseInt(selectedMonth) - 1);
                  onDateChange(newDate);
                }
              }}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              disabled={disabled}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Day selector */}
        <div className="w-full">
          {date && (
            <select
              value={date.getDate().toString()}
              onChange={(e) => {
                if (date) {
                  const newDate = new Date(date);
                  newDate.setDate(parseInt(e.target.value));
                  onDateChange(newDate);
                }
              }}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              disabled={disabled}
            >
              {Array.from(
                { length: new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate() },
                (_, i) => i + 1
              ).map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          )}
        </div>
        
        {/* Hidden native input for form submission compatibility */}
        <input 
          type="date" 
          value={date ? format(date, "yyyy-MM-dd") : ""} 
          onChange={handleNativeDateChange}
          className="hidden"
          disabled={disabled}
          max={format(new Date(), "yyyy-MM-dd")}
        />
        
        {/* Display selected date in a nice format */}
        {date && (
          <div className="text-center text-sm text-muted-foreground">
            Selected: {format(date, "MMMM d, yyyy")}
          </div>
        )}
      </div>
    );
  }

  // Desktop version with improved year selection
  return (
    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex p-3 gap-2 border-b">
          <div className="flex-1">
            <Select 
              value={selectedMonth} 
              onValueChange={(value) => setSelectedMonth(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-60 overflow-y-auto">
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select 
              value={selectedYear} 
              onValueChange={(value) => setSelectedYear(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-60 overflow-y-auto">
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            onDateChange(newDate);
            setCalendarOpen(false);
          }}
          month={date || new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1)}
          onMonthChange={(newMonth) => {
            setSelectedMonth((newMonth.getMonth() + 1).toString());
            setSelectedYear(newMonth.getFullYear().toString());
          }}
          disabled={(calendarDate) => calendarDate > new Date()}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}
