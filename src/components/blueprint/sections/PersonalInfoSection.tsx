
import React, { useState } from "react";
import { format, parse } from "date-fns";
import BlueprintSection from "../BlueprintSection";
import { BlueprintData } from "@/services/blueprint-service";
import { Button } from "@/components/ui/button";
import { DatePickerWithYear } from "@/components/ui/date-picker-with-year";
import { useToast } from "@/hooks/use-toast";

interface PersonalInfoSectionProps {
  userMeta: BlueprintData["user_meta"];
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ userMeta }) => {
  const [isEditingBirthDate, setIsEditingBirthDate] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    userMeta.birth_date ? parse(userMeta.birth_date, "yyyy-MM-dd", new Date()) : undefined
  );
  const { toast } = useToast();
  
  const handleSaveBirthDate = () => {
    // In a real app, you would update this in the database
    // For now, we'll just show a toast message
    setIsEditingBirthDate(false);
    
    toast({
      title: "Birth date updated",
      description: birthDate 
        ? `Your birth date is now set to ${format(birthDate, "PPP")}` 
        : "Your birth date has been cleared",
    });
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
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSaveBirthDate}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <span 
              onClick={() => setIsEditingBirthDate(true)} 
              className="cursor-pointer hover:underline"
            >
              {userMeta.birth_date}
            </span>
          )}
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Birth Time:</span>
          <span>{userMeta.birth_time_local}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Birth Location:</span>
          <span>{userMeta.birth_location}</span>
        </div>
      </div>
    </BlueprintSection>
  );
};

export default PersonalInfoSection;
