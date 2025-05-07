
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StarField from "@/components/ui/star-field";
import MainLayout from "@/components/Layout/MainLayout";
import { useToast } from "@/hooks/use-toast";

const steps = [
  "Welcome",
  "Birth Date",
  "Birth Time",
  "Birth Location",
  "Personality",
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    birthLocation: "",
    personality: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const goToNextStep = () => {
    if (currentStep === steps.length - 1) {
      // Submit the form and navigate to the blueprint page
      toast({
        title: "Blueprint generated!",
        description: "Your Soul Blueprint has been created successfully.",
      });
      navigate("/blueprint");
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goToPrevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-display font-bold">Welcome to SoulSync</h2>
            <p>
              Let's create your unique Soul Blueprint by collecting some key information.
              This will help us provide personalized guidance aligned with your cosmic design.
            </p>
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-center">Your Birth Date</h2>
            <p className="text-center">
              Your birth date helps us calculate your astrological signs and numerology.
            </p>
            <div className="flex items-center space-x-4">
              <Calendar className="text-soul-purple h-8 w-8 flex-shrink-0" />
              <div className="space-y-1 w-full">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-center">Your Birth Time</h2>
            <p className="text-center">
              Your birth time helps us calculate your Rising sign and moon position.
            </p>
            <div className="flex items-center space-x-4">
              <Clock className="text-soul-purple h-8 w-8 flex-shrink-0" />
              <div className="space-y-1 w-full">
                <Label htmlFor="birthTime">Birth Time (if known)</Label>
                <Input
                  id="birthTime"
                  name="birthTime"
                  type="time"
                  value={formData.birthTime}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-center">Your Birth Location</h2>
            <p className="text-center">
              Your birth location helps us calculate your exact astrological chart.
            </p>
            <div className="flex items-center space-x-4">
              <MapPin className="text-soul-purple h-8 w-8 flex-shrink-0" />
              <div className="space-y-1 w-full">
                <Label htmlFor="birthLocation">Birth City/Country</Label>
                <Input
                  id="birthLocation"
                  name="birthLocation"
                  placeholder="e.g., New York, USA"
                  value={formData.birthLocation}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-center">Your Personality Type</h2>
            <p className="text-center">
              If you know your MBTI personality type, please select it below.
            </p>
            <div className="space-y-1">
              <Label htmlFor="personality">MBTI Personality Type (optional)</Label>
              <select
                id="personality"
                name="personality"
                value={formData.personality}
                onChange={handleInputChange}
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select personality type</option>
                <option value="INTJ">INTJ</option>
                <option value="INTP">INTP</option>
                <option value="ENTJ">ENTJ</option>
                <option value="ENTP">ENTP</option>
                <option value="INFJ">INFJ</option>
                <option value="INFP">INFP</option>
                <option value="ENFJ">ENFJ</option>
                <option value="ENFP">ENFP</option>
                <option value="ISTJ">ISTJ</option>
                <option value="ISFJ">ISFJ</option>
                <option value="ESTJ">ESTJ</option>
                <option value="ESFJ">ESFJ</option>
                <option value="ISTP">ISTP</option>
                <option value="ISFP">ISFP</option>
                <option value="ESTP">ESTP</option>
                <option value="ESFP">ESFP</option>
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout hideNav>
      <StarField />
      <div className="min-h-screen p-6 flex flex-col">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-display font-bold">
            <span className="gradient-text">SoulSync</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 mt-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`h-2 w-2 rounded-full ${
                  index === currentStep
                    ? "bg-soul-purple"
                    : index < currentStep
                    ? "bg-soul-lavender"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center">
          <CosmicCard className="w-full max-w-md" floating>
            <div className="space-y-6">{renderStepContent()}</div>

            <div className="mt-8 flex justify-between">
              <Button
                variant="ghost"
                onClick={goToPrevStep}
                disabled={currentStep === 0}
                className="flex items-center"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <GradientButton onClick={goToNextStep} className="flex items-center">
                {currentStep === steps.length - 1 ? "Create Blueprint" : "Continue"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </GradientButton>
            </div>
          </CosmicCard>
        </div>
      </div>
    </MainLayout>
  );
};

export default Onboarding;
