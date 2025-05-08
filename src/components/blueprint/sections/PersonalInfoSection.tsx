
import React from "react";
import BlueprintSection from "../BlueprintSection";
import { BlueprintData } from "@/services/blueprint-service";

interface PersonalInfoSectionProps {
  userMeta: BlueprintData["user_meta"];
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ userMeta }) => {
  return (
    <BlueprintSection id="personal" title="Personal Information" defaultExpanded={true}>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Full Name:</span>
          <span>{userMeta.full_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Birth Date:</span>
          <span>{userMeta.birth_date}</span>
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
