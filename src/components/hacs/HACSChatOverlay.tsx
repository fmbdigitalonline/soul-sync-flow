import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { IntelligentSoulOrb } from '@/components/ui/intelligent-soul-orb';
import { InteractiveHACSChat } from './InteractiveHACSChat';
import { type HACSMessage } from '@/hooks/use-hacs-autonomy';
import { type ConversationMessage } from '@/hooks/use-hacs-conversation';
import { useLanguage } from '@/contexts/LanguageContext';

interface HACSChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentMessage: HACSMessage | null;
  intelligenceLevel: number;
}

export const HACSChatOverlay: React.FC<HACSChatOverlayProps> = ({
  isOpen,
  onClose,
  currentMessage,
  intelligenceLevel
}) => {
  const [showInteractiveChat, setShowInteractiveChat] = useState(false);
  const { t } = useLanguage();

  // Convert HACSMessage to ConversationMessage if needed
  const initialMessage: ConversationMessage | null = currentMessage ? {
    id: currentMessage.id,
    role: 'hacs' as const,
    content: currentMessage.text,
    timestamp: currentMessage.timestamp.toISOString(),
    module: currentMessage.hacsModule,
    messageType: currentMessage.messageType
  } : null;

  if (showInteractiveChat) {
    return (
      <InteractiveHACSChat
        isOpen={isOpen}
        onClose={() => {
          setShowInteractiveChat(false);
          onClose();
        }}
        initialMessage={initialMessage}
      />
    );
  }
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Chat Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-8 z-50 flex items-center justify-center pointer-events-none"
          >
            <CosmicCard className="w-full max-w-2xl max-h-[80vh] overflow-hidden pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center space-x-3">
                  <IntelligentSoulOrb
                    layoutId="hacs-steward-soul"
                    size="sm"
                    layoutId="hacs-steward-soul"
                    intelligenceLevel={intelligenceLevel}
                    showProgressRing={false}
                    pulse={false}
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{t('system.soulCompanion')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('system.holisticSoulSystem')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="rounded-full w-8 h-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Chat Content */}
              <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                {currentMessage ? (
                  <div className="space-y-4">
                    {/* HACS Module Badge */}
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {currentMessage.hacsModule} Module
                    </div>

                    {/* Message */}
                    <div className="bg-muted/50 rounded-2xl p-4">
                      <p className="text-foreground leading-relaxed">
                        {currentMessage.text}
                      </p>
                      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                        <span>Intervention: {currentMessage.interventionType}</span>
                        <span>{currentMessage.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {/* Intelligence Level Display */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t('system.soulIntelligence')} Level
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                            style={{ width: `${intelligenceLevel}%` }}
                          />
                        </div>
                        <span className="text-primary font-medium">
                          {intelligenceLevel}%
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        className="flex-1"
                      >
                        Got it
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setShowInteractiveChat(true)}
                        className="flex-1"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Continue Conversation
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="text-muted-foreground">
                      {t('system.soulCompanionReady')}
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                          style={{ width: `${intelligenceLevel}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-primary font-medium">
                      Intelligence Level: {intelligenceLevel}%
                    </div>
                  </div>
                )}
              </div>
            </CosmicCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};