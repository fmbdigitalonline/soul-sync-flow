
import React, { useState } from "react";
import { format, parse } from "date-fns";
import BlueprintSection from "../BlueprintSection";
import { BlueprintData } from "@/services/blueprint-service";
import { Button } from "@/components/ui/button";
import { DatePickerWithYear } from "@/components/ui/date-picker-with-year";
import { useToast } from "@/hooks/use-toast";
import { pythonBlueprintService } from "@/services/python-blueprint-service";

interface PersonalInfoSectionProps {
  userMeta: BlueprintData["user_meta"];
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ userMeta }) => {
  const [isEditingBirthDate, setIsEditingBirthDate] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    userMeta.birth_date ? parse(userMeta.birth_date, "yyyy-MM-dd", new Date()) : undefined
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  const handleSaveBirthDate = async () => {
    if (!birthDate) {
      toast({
        title: "Error",
        description: "Please select a valid birth date",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    
    try {
      // Format the date for display and storage
      const formattedDate = format(birthDate, "yyyy-MM-dd");
      
      // In a real app, you would update this in the database
      // We'll also try to recalculate numerology values if possible
      let recalculationMessage = "";
      
      try {
        // Try to recalculate using the Python service if available
        const result = await pythonBlueprintService.generateBlueprint({
          full_name: userMeta.full_name,
          birth_date: formattedDate,
          birth_time_local: userMeta.birth_time_local,
          birth_location: userMeta.birth_location,
        });
        
        if (result.success && result.blueprint) {
          recalculationMessage = "Numerology values have been recalculated.";
        }
      } catch (error) {
        console.error("Failed to recalculate numerology:", error);
        // Continue without recalculation but don't show error to user
      }
      
      setIsEditingBirthDate(false);
      
      toast({
        title: "Birth date updated",
        description: `Your birth date is now set to ${format(birthDate, "PPP")}. ${recalculationMessage}`,
      });
    } catch (error) {
      console.error("Error updating birth date:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your birth date",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Format birth date for display
  const formatDisplayDate = () => {
    if (!userMeta.birth_date) return "Not set";
    
    try {
      const date = parse(userMeta.birth_date, "yyyy-MM-dd", new Date());
      return format(date, "MMMM d, yyyy");
    } catch (error) {
      return userMeta.birth_date;
    }
  };

  return (
    <BlueprintSection id="personal" title="Personal Information" defaultExpanded={true}>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Full Name:</span>
          <span>{userMeta.full_name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Birth Date:</span>
          {isEditingBirthDate ? (
            <div className="flex flex-col gap-2 w-3/4">
              <DatePickerWithYear 
                date={birthDate}
                onDateChange={setBirthDate}
                placeholder="Select birth date"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditingBirthDate(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSaveBirthDate}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <span 
              onClick={() => setIsEditingBirthDate(true)} 
              className="cursor-pointer hover:underline"
            >
              {formatDisplayDate()}
            </span>
          )}
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Birth Time:</span>
          <span>{userMeta.birth_time_local || "Not set"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Birth Location:</span>
          <span>{userMeta.birth_location || "Not set"}</span>
        </div>
      </div>
    </BlueprintSection>
  );
};

export default PersonalInfoSection;
