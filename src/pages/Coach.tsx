
import { useState, useRef, useEffect } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { useAICoach } from "@/hooks/use-ai-coach";
import { SoulOrb } from "@/components/ui/soul-orb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SpeechBubble } from "@/components/ui/speech-bubble";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { aiCoachService } from "@/services/ai-coach-service";

const Coach = () => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    messages,
    isLoading,
    sendMessage,
    resetConversation,
    debugMode,
    toggleDebugMode
  } = useAICoach();
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    try {
      await sendMessage(input);
      setInput("");
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message to Soul Coach",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6 pb-24">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold font-display mb-2">
            <span className="gradient-text">Soul Coach</span>
          </h1>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Chat with your personalized AI spiritual guide, powered by your Soul Blueprint
          </p>
          
          {/* Debug Toggle */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleDebugMode}
            className="mb-4"
          >
            {debugMode ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Raw Responses
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show Raw Responses
              </>
            )}
          </Button>
          
          {/* AI Coach Messages */}
          <div className="w-full max-w-3xl bg-black/10 backdrop-blur-sm rounded-lg p-6 mb-6">
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetConversation}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                New Conversation
              </Button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto" ref={messagesEndRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <SoulOrb size="md" stage="welcome" pulse={true} speaking={false} />
                  <p className="text-center text-muted-foreground mt-4">
                    Hi, I'm your Soul Coach. Ask me anything about your spiritual journey or personal growth.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="flex flex-col">
                    <SpeechBubble role={message.sender} time={format(message.timestamp, 'h:mm a')}>
                      {message.content}
                    </SpeechBubble>
                    
                    {/* Debug Raw Response */}
                    {debugMode && message.sender === "ai" && message.rawResponse && (
                      <div className="mt-2 p-2 bg-black/20 rounded text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-soul-purple">Raw OpenAI Response:</span>
                          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => navigator.clipboard.writeText(JSON.stringify(message.rawResponse, null, 2))}>
                            Copy
                          </Button>
                        </div>
                        <pre className="whitespace-pre-wrap text-green-400 overflow-auto max-h-[200px]">
                          {JSON.stringify(message.rawResponse, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex items-center space-x-2 animate-pulse">
                  <SoulOrb size="sm" stage="welcome" pulse={false} speaking={true} />
                  <span className="text-muted-foreground">Thinking...</span>
                </div>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
              <Input
                placeholder="Ask your Soul Coach..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading || !user}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim() || !user}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Coach;
