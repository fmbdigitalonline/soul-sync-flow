
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { programAwareCoachService } from '@/services/program-aware-coach-service';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SpiritualGrowth() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const initializeService = async () => {
      if (user && !isInitialized) {
        try {
          await programAwareCoachService.initializeForUser(user.id);
          setIsInitialized(true);
        } catch (error) {
          console.error('Error initializing program aware coach:', error);
        }
      }
    };

    initializeService();
  }, [user, isInitialized]);

  useEffect(() => {
    const loadUserProgram = async () => {
      if (user && isInitialized) {
        try {
          await programAwareCoachService.initializeForUser(user.id);
          const context = programAwareCoachService.getCurrentContext();
          if (context.currentModule) {
            setCurrentModule(context.currentModule);
          }
        } catch (error) {
          console.error('Error loading user program:', error);
        }
      }
    };

    loadUserProgram();
  }, [user, isInitialized]);

  const handleStartProgram = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    try {
      await programAwareCoachService.startGuidedProgramCreation();
      setShowChat(true);
    } catch (error) {
      console.error('Error starting program:', error);
      toast.error('Failed to start program creation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!user) return;
    
    try {
      const response = await programAwareCoachService.sendProgramAwareMessage(
        message, 
        sessionId || ''
      );
      // Handle the response as needed
      console.log('Response received:', response);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Spiritual Growth Program</h1>

      {!showChat ? (
        <Card>
          <CardHeader>
            <CardTitle>Embark on Your Spiritual Journey</CardTitle>
            <CardDescription>
              Start our guided program to explore and enhance your spiritual growth.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleStartProgram} disabled={isGenerating}>
              {isGenerating ? "Starting..." : "Start Guided Program"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          <h2>Chat</h2>
          <input
            type="text"
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                handleSendMessage(target.value);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
