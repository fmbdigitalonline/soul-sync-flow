import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Heart, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { DreamMessageParser, ParsedDreamMessage, DreamChoice } from '@/services/dream-message-parser';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useLanguage } from '@/contexts/LanguageContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface DreamDiscoveryChatProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  conversationPhase?: 'blueprint_analysis' | 'suggestion_presentation' | 'exploration' | 'refinement' | 'ready_for_decomposition';
  intakeData?: {
    title: string;
    description: string;
    category: string;
    timeframe: string;
  };
  onReadyForDecomposition?: () => void;
}

export const DreamDiscoveryChat: React.FC<DreamDiscoveryChatProps> = ({
  messages,
  isLoading,
  onSendMessage,
  messagesEndRef,
  conversationPhase = 'blueprint_analysis',
  intakeData,
  onReadyForDecomposition
}) => {
  const [inputValue, setInputValue] = useState('');
  const { spacing, getTextSize, touchTargetSize, isFoldDevice } = useResponsiveLayout();
  const { t } = useLanguage();

  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleChoiceSelect = (choice: DreamChoice) => {
    onSendMessage(choice.text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show decomposition button when ready
  const showDecompositionButton = conversationPhase === 'ready_for_decomposition' && 
    Boolean(intakeData?.title) && Boolean(intakeData?.description);

  // Get phase-specific placeholder text
  const getPlaceholderText = () => {
    switch (conversationPhase) {
      case 'blueprint_analysis':
        return t('dreamDiscovery.placeholders.aspirations');
      case 'suggestion_presentation':
        return t('dreamDiscovery.placeholders.resonates');
      case 'exploration':
        return t('dreamDiscovery.placeholders.excites');
      case 'refinement':
        return t('dreamDiscovery.placeholders.details');
      default:
        return t('dreamDiscovery.placeholders.heart');
    }
  };

  // Get phase-specific status text
  const getPhaseStatusText = () => {
    switch (conversationPhase) {
      case 'blueprint_analysis':
        return t('dreamDiscovery.status.analyzing');
      case 'suggestion_presentation':
        return t('dreamDiscovery.status.presenting');
      case 'exploration':
        return t('dreamDiscovery.status.exploring');
      case 'refinement':
        return t('dreamDiscovery.status.refining');
      case 'ready_for_decomposition':
        return t('dreamDiscovery.status.ready');
      default:
        return t('dreamDiscovery.status.discovery');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Progress Indicator */}
      {conversationPhase !== 'blueprint_analysis' && (
        <div className={`bg-card/80 backdrop-blur-lg ${spacing.container} py-2`}>
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 text-xs ${getTextSize('text-xs')}`}>
                <CheckCircle className={`h-3 w-3 text-green-500`} />
                <span className="text-green-600">{t('dreamDiscovery.blueprintAnalyzed')}</span>
              </div>
              <div className={`flex items-center gap-1 text-xs ${getTextSize('text-xs')}`}>
                <ArrowRight className="h-3 w-3 text-soul-purple" />
                <span className="text-soul-purple">{getPhaseStatusText()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className={`flex-1 overflow-y-auto ${spacing.container} pb-4`}>
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <DreamMessageRenderer
              key={message.id}
              message={message}
              onChoiceSelect={handleChoiceSelect}
              conversationPhase={conversationPhase}
            />
          ))}
          
          {isLoading && (
            <div className="flex justify-center py-6">
              <div className="bg-card/80 backdrop-blur-lg rounded-2xl px-6 py-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-soul-purple animate-pulse" />
                  <span className={`text-gray-600 ${getTextSize('text-sm')}`}>
                    {conversationPhase === 'blueprint_analysis' ? t('dreamDiscovery.loading.blueprint') : 
                     conversationPhase === 'suggestion_presentation' ? t('dreamDiscovery.loading.suggestions') :
                     conversationPhase === 'exploration' ? t('dreamDiscovery.loading.deeper') :
                     conversationPhase === 'refinement' ? t('dreamDiscovery.loading.vision') :
                     t('dreamDiscovery.loading.journey')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Ready for Decomposition Button */}
          {showDecompositionButton && !isLoading && (
            <div className="flex justify-center py-6">
              <Button
                onClick={onReadyForDecomposition}
                className={`bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg text-white font-semibold rounded-2xl px-8 py-4 transition-all duration-300 ${getTextSize('text-sm')} ${touchTargetSize}`}
              >
                <Sparkles className={`mr-2 ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
                {t('dreamDiscovery.createJourney')}
              </Button>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className={`${spacing.container} bg-card/80 backdrop-blur-lg`}>
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={getPlaceholderText()}
                className={`border-soul-purple/20 focus:border-soul-purple focus:ring-soul-purple/20 rounded-2xl ${getTextSize('text-sm')} ${touchTargetSize}`}
                disabled={isLoading || showDecompositionButton}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || showDecompositionButton}
              className={`bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg transition-all duration-300 rounded-2xl ${touchTargetSize}`}
            >
              <Send className={`${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DreamMessageRendererProps {
  message: Message;
  onChoiceSelect: (choice: DreamChoice) => void;
  conversationPhase?: 'blueprint_analysis' | 'suggestion_presentation' | 'exploration' | 'refinement' | 'ready_for_decomposition';
}

const DreamMessageRenderer: React.FC<DreamMessageRendererProps> = ({
  message,
  onChoiceSelect,
  conversationPhase = 'blueprint_analysis'
}) => {
  const { getTextSize, touchTargetSize, isFoldDevice } = useResponsiveLayout();
  const { t } = useLanguage();
  const parsedMessage: ParsedDreamMessage = DreamMessageParser.parseMessage(message.content);

  if (message.sender === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-gradient-to-r from-soul-purple to-soul-teal text-white rounded-2xl px-4 py-3 max-w-xs shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <Heart className={`${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
            <span className={`font-medium ${getTextSize('text-xs')}`}>You</span>
          </div>
          <p className={`leading-relaxed ${getTextSize('text-sm')}`}>
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-md">
        <Card className="bg-card/90 backdrop-blur-lg shadow-lg rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={`bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center ${isFoldDevice ? 'w-5 h-5' : 'w-6 h-6'}`}>
              <Sparkles className={`text-white ${isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'}`} />
            </div>
            <span className={`font-medium text-gray-800 ${getTextSize('text-xs')}`}>
              {t('dreamDiscovery.dreamGuide')}
              {conversationPhase === 'suggestion_presentation' && (
                <span className="ml-2 text-soul-purple text-xs">{t('dreamDiscovery.presentingSuggestions')}</span>
              )}
              {conversationPhase === 'exploration' && (
                <span className="ml-2 text-soul-purple text-xs">{t('dreamDiscovery.exploringDreams')}</span>
              )}
              {conversationPhase === 'refinement' && (
                <span className="ml-2 text-soul-purple text-xs">{t('dreamDiscovery.refiningVision')}</span>
              )}
            </span>
          </div>
          
          <div className={`text-gray-700 leading-relaxed mb-4 ${getTextSize('text-sm')}`}>
            {parsedMessage.content}
          </div>

          {parsedMessage.type === 'choices' && parsedMessage.choices && (
            <div className="space-y-2">
              <p className={`text-gray-600 font-medium mb-3 ${getTextSize('text-xs')}`}>
                {t('dreamDiscovery.chooseResonates')}
              </p>
              <div className="grid gap-2">
                {parsedMessage.choices.map((choice) => (
                  <Button
                    key={choice.id}
                    onClick={() => onChoiceSelect(choice)}
                    variant="outline"
                    className={`justify-start text-left h-auto py-3 px-4 border-soul-purple/20 hover:bg-soul-purple/5 hover:border-soul-purple rounded-xl transition-all duration-200 ${getTextSize('text-sm')} ${touchTargetSize}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{choice.emoji}</span>
                      <span className="flex-1 leading-relaxed">{choice.text}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {parsedMessage.type === 'question' && parsedMessage.question && (
            <div className="bg-soul-purple/5 rounded-xl p-3 border-l-4 border-soul-purple">
              <p className={`text-soul-purple font-medium ${getTextSize('text-sm')}`}>
                {parsedMessage.question}
              </p>
            </div>
          )}

          {parsedMessage.type === 'reflection' && (
            <div className="bg-soul-teal/5 rounded-xl p-3 border-l-4 border-soul-teal">
              <p className={`text-soul-teal font-medium ${getTextSize('text-sm')}`}>
                {t('dreamDiscovery.reflect')}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
