
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Search, 
  Calendar, 
  TrendingUp, 
  Heart,
  MessageCircle,
  Target,
  Lightbulb
} from 'lucide-react';
import { memoryService, SessionMemory, UserLifeContext } from '@/services/memory-service';
import { format } from 'date-fns';

interface PersistentMemoryPanelProps {
  userName: string;
  onMemorySelected?: (memory: SessionMemory) => void;
}

export const PersistentMemoryPanel: React.FC<PersistentMemoryPanelProps> = ({
  userName,
  onMemorySelected
}) => {
  const [memories, setMemories] = useState<SessionMemory[]>([]);
  const [lifeContext, setLifeContext] = useState<UserLifeContext[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SessionMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    loadMemoriesAndContext();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadMemoriesAndContext = async () => {
    try {
      console.log('🧠 Loading persistent memories and life context...');
      
      const [memoriesData, contextData, welcome] = await Promise.all([
        memoryService.getRecentMemories(15),
        memoryService.getLifeContext(),
        memoryService.generateWelcomeMessage(userName)
      ]);
      
      setMemories(memoriesData);
      setLifeContext(contextData);
      setWelcomeMessage(welcome);
      
      console.log(`🧠 Loaded ${memoriesData.length} memories and ${contextData.length} life contexts`);
    } catch (error) {
      console.error('Error loading memories and context:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      console.log('🔍 Searching memories for:', searchQuery);
      const results = await memoryService.searchMemories(searchQuery, 10);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching memories:', error);
    }
  };

  const getMemoryIcon = (type: SessionMemory['memory_type']) => {
    switch (type) {
      case 'interaction': return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'mood': return <Heart className="h-4 w-4 text-pink-500" />;
      case 'belief_shift': return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'journal_entry': return <Calendar className="h-4 w-4 text-green-500" />;
      case 'micro_action': return <Target className="h-4 w-4 text-purple-500" />;
      default: return <Brain className="h-4 w-4 text-gray-500" />;
    }
  };

  const getImportanceColor = (score: number) => {
    if (score >= 8) return 'bg-red-100 text-red-800';
    if (score >= 6) return 'bg-orange-100 text-orange-800';
    if (score >= 4) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getContextIcon = (category: UserLifeContext['context_category']) => {
    switch (category) {
      case 'career': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'relationships': return <Heart className="h-4 w-4 text-pink-500" />;
      case 'health': return <Target className="h-4 w-4 text-green-500" />;
      case 'growth': return <Lightbulb className="h-4 w-4 text-purple-500" />;
      case 'creative': return <Brain className="h-4 w-4 text-orange-500" />;
      default: return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Persistent Memory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Session Memory & Context
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Welcome Message with Context */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 leading-relaxed">
            {welcomeMessage}
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search your memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="memories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="memories">Recent Memories</TabsTrigger>
            <TabsTrigger value="context">Life Context</TabsTrigger>
          </TabsList>

          <TabsContent value="memories" className="space-y-3 max-h-96 overflow-y-auto">
            {searchQuery ? (
              // Search Results
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Search Results ({searchResults.length})
                </h4>
                {searchResults.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">
                    No memories found for "{searchQuery}"
                  </p>
                ) : (
                  searchResults.map((memory) => (
                    <div
                      key={memory.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => onMemorySelected?.(memory)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getMemoryIcon(memory.memory_type)}
                          <span className="text-sm font-medium capitalize">
                            {memory.memory_type.replace('_', ' ')}
                          </span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getImportanceColor(memory.importance_score)}`}
                        >
                          {memory.importance_score}/10
                        </Badge>
                      </div>
                      {memory.context_summary && (
                        <p className="text-sm text-gray-700 mb-2">
                          {memory.context_summary}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {format(new Date(memory.created_at), 'MMM dd, yyyy h:mm a')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Recent Memories
              <div className="space-y-3">
                {memories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No memories yet</p>
                    <p className="text-sm">Memories will appear as we interact</p>
                  </div>
                ) : (
                  memories.map((memory) => (
                    <div
                      key={memory.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => onMemorySelected?.(memory)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getMemoryIcon(memory.memory_type)}
                          <span className="text-sm font-medium capitalize">
                            {memory.memory_type.replace('_', ' ')}
                          </span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getImportanceColor(memory.importance_score)}`}
                        >
                          {memory.importance_score}/10
                        </Badge>
                      </div>
                      {memory.context_summary && (
                        <p className="text-sm text-gray-700 mb-2">
                          {memory.context_summary}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {format(new Date(memory.created_at), 'MMM dd, yyyy h:mm a')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="context" className="space-y-3 max-h-96 overflow-y-auto">
            {lifeContext.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No life context yet</p>
                <p className="text-sm">Context builds as we work together</p>
              </div>
            ) : (
              lifeContext.map((context) => (
                <div key={context.id} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    {getContextIcon(context.context_category)}
                    <h4 className="font-medium capitalize">
                      {context.context_category.replace('_', ' ')}
                    </h4>
                  </div>
                  
                  {context.current_focus && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-600 mb-1">Current Focus:</p>
                      <p className="text-sm text-gray-700">{context.current_focus}</p>
                    </div>
                  )}
                  
                  {context.recent_progress.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-green-600 mb-1">Recent Progress:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {context.recent_progress.slice(0, 2).map((progress, index) => (
                          <li key={index} className="text-xs">• {progress}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {context.ongoing_challenges.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-orange-600 mb-1">Challenges:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {context.ongoing_challenges.slice(0, 2).map((challenge, index) => (
                          <li key={index} className="text-xs">• {challenge}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Updated: {format(new Date(context.last_updated), 'MMM dd, yyyy')}
                  </p>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>

        <Button 
          onClick={loadMemoriesAndContext}
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          <Brain className="h-4 w-4 mr-2" />
          Refresh Memory
        </Button>
      </CardContent>
    </Card>
  );
};

export default PersistentMemoryPanel;
