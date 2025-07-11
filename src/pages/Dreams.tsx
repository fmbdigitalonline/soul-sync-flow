import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, Target, Calendar, ArrowRight, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProgramAwareCoach } from "@/hooks/use-program-aware-coach";
import { DreamDiscoveryChat } from "@/components/dream/DreamDiscoveryChat";
import { LifeDomain } from "@/types/growth-program";
import { FloatingHACSOrb } from "@/components/hacs/FloatingHACSOrb";

const Dreams = () => {
  const [conversationStarted, setConversationStarted] = useState(false);
  const [intakeData, setIntakeData] = useState({
    title: "",
    description: "",
    category: "",
    timeframe: "",
  });
  const [conversationPhase, setConversationPhase] = useState<
    "blueprint_analysis" | "suggestion_presentation" | "exploration" | "refinement" | "ready_for_decomposition"
  >("blueprint_analysis");
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    sendMessage,
    resetConversation,
    getProgramContext,
    initializeConversation,
    initializeBeliefDrilling,
    recoverConversation,
    currentSessionId,
    hasError,
    errorCount,
    streamingContent,
    isStreaming,
  } = useProgramAwareCoach("dreams");

  const [selectedCategory, setSelectedCategory] = useState<LifeDomain | null>(null);

  useEffect(() => {
    initializeConversation();
  }, [initializeConversation]);

  const handleCategorySelect = (category: LifeDomain) => {
    setSelectedCategory(category);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setIntakeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartDreamDiscovery = () => {
    if (!intakeData.title || !intakeData.description || !selectedCategory) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields and select a category.",
      });
      return;
    }

    setConversationStarted(true);
    setConversationPhase("blueprint_analysis");
  };

  const handleReadyForDecomposition = () => {
    setConversationPhase("ready_for_decomposition");
    toast({
      title: "Dream Ready",
      description: "Your dream is ready for decomposition and planning!",
    });
  };

  // Custom messages for dreams page
  const dreamsMessages = [
    "I sense you're exploring something meaningful here...",
    "Your dreams are uniquely yours - let's explore them together.",
    "Sometimes the most powerful dreams start with a single step.",
    "I'm here to help you transform dreams into reality.",
    "Your blueprint suggests you have natural intuition - trust it."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-purple/10 via-white to-soul-teal/10">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <motion.h1
            className="text-2xl font-semibold text-gray-800 flex items-center gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="text-soul-purple" />
            Dream Discovery
          </motion.h1>
          <p className="text-gray-600 mt-2">
            Explore your dreams and aspirations with personalized guidance.
          </p>
        </div>
      </header>

      {conversationStarted ? (
        <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
          <DreamDiscoveryChat
            messages={messages}
            isLoading={isLoading}
            onSendMessage={sendMessage}
            messagesEndRef={messagesEndRef}
            conversationPhase={conversationPhase}
            intakeData={intakeData}
            onReadyForDecomposition={handleReadyForDecomposition}
          />
        </div>
      ) : (
        <>
          <section className="container mx-auto px-4 py-8">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="p-4 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <Heart className="text-red-500 w-8 h-8 mb-2" />
                <h3 className="text-lg font-semibold text-gray-700 mb-1">
                  Relationships &amp; Love
                </h3>
                <p className="text-gray-500">
                  Explore your dreams related to love, family, and friendships.
                </p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => handleCategorySelect("relationships")}
                >
                  Explore
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Card>

              <Card className="p-4 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <Lightbulb className="text-yellow-500 w-8 h-8 mb-2" />
                <h3 className="text-lg font-semibold text-gray-700 mb-1">
                  Personal Growth
                </h3>
                <p className="text-gray-500">
                  Uncover your dreams for self-improvement and spiritual
                  development.
                </p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => handleCategorySelect("spirituality")}
                >
                  Explore
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Card>

              <Card className="p-4 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <Target className="text-green-500 w-8 h-8 mb-2" />
                <h3 className="text-lg font-semibold text-gray-700 mb-1">Career &amp; Productivity</h3>
                <p className="text-gray-500">
                  Visualize your dreams for career success and productivity
                  enhancement.
                </p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => handleCategorySelect("productivity")}
                >
                  Explore
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Card>
            </motion.div>
          </section>

          <section className="container mx-auto px-4 py-8">
            <motion.div
              className="max-w-2xl mx-auto bg-white/80 backdrop-blur-lg rounded-lg shadow-md p-6 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Share Your Dream
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Dream Title</Label>
                  <Input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="A brief title for your dream"
                    className="mt-1"
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Dream Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your dream in detail"
                    className="mt-1"
                    rows={4}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  {selectedCategory ? (
                    <Badge variant="secondary">
                      {selectedCategory}
                    </Badge>
                  ) : (
                    <p className="text-gray-500">Select a category above.</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Input
                    type="text"
                    id="timeframe"
                    name="timeframe"
                    placeholder="Desired timeframe to achieve this dream"
                    className="mt-1"
                    onChange={handleInputChange}
                  />
                </div>
                <Button
                  className="bg-gradient-to-r from-soul-purple to-soul-teal text-white hover:shadow-md"
                  onClick={handleStartDreamDiscovery}
                  disabled={isLoading}
                >
                  Start Dream Discovery
                  <Sparkles className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </section>
        </>
      )}

      {/* Floating HACS Orb */}
      <FloatingHACSOrb
        position="bottom-right"
        staticMessages={dreamsMessages}
        showInterval={20000} // Show message every 20 seconds
      />
    </div>
  );
};

export default Dreams;
