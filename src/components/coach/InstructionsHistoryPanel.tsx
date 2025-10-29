/**
 * Instructions History Panel
 * 
 * Allows users to access all their past working instructions
 * even after tasks are completed or abandoned.
 * 
 * Protocol Compliance:
 * - Principle #2: Real data from database, no mock/placeholder
 * - Principle #7: Loading states and transparent errors
 */

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  Clock, 
  Wrench, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { workingInstructionsPersistenceService, WorkingInstruction } from '@/services/working-instructions-persistence-service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TaskInstructions {
  taskId: string;
  instructions: WorkingInstruction[];
}

export const InstructionsHistoryPanel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskInstructionsMap, setTaskInstructionsMap] = useState<Map<string, WorkingInstruction[]>>(new Map());
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadAllInstructions();
  }, []);

  const loadAllInstructions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('📚 INSTRUCTIONS HISTORY: Loading all task instructions...');
      
      // Get list of all tasks with instructions
      const taskIds = await workingInstructionsPersistenceService.getTasksWithInstructions();
      
      if (taskIds.length === 0) {
        console.log('ℹ️ INSTRUCTIONS HISTORY: No tasks with instructions found');
        setIsLoading(false);
        return;
      }

      // Load instructions for each task
      const instructionsMap = new Map<string, WorkingInstruction[]>();
      for (const taskId of taskIds) {
        const instructions = await workingInstructionsPersistenceService.loadWorkingInstructions(taskId);
        if (instructions.length > 0) {
          instructionsMap.set(taskId, instructions);
        }
      }

      console.log(`✅ INSTRUCTIONS HISTORY: Loaded instructions for ${instructionsMap.size} tasks`);
      setTaskInstructionsMap(instructionsMap);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load instructions';
      console.error('❌ INSTRUCTIONS HISTORY: Load failed', err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTaskInstructions = (taskId: string) => {
    setSelectedTask(taskId);
    setIsDialogOpen(true);
  };

  const selectedInstructions = selectedTask ? taskInstructionsMap.get(selectedTask) : null;

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
        <p className="text-sm text-gray-600">Loading your instruction history...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-900 mb-1">Failed to load history</h4>
            <p className="text-sm text-red-700">{error}</p>
            <Button
              onClick={loadAllInstructions}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (taskInstructionsMap.size === 0) {
    return (
      <Card className="p-8 text-center">
        <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
        <h3 className="font-medium text-gray-800 mb-1">No instruction history yet</h3>
        <p className="text-sm text-gray-600">
          Your saved working instructions will appear here
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium text-gray-800">Instruction History</h3>
          <Badge variant="secondary" className="ml-auto">
            {taskInstructionsMap.size} {taskInstructionsMap.size === 1 ? 'task' : 'tasks'}
          </Badge>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-2">
            {Array.from(taskInstructionsMap.entries()).map(([taskId, instructions]) => (
              <Card
                key={taskId}
                className="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleViewTaskInstructions(taskId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-800 mb-1">
                      Task: {taskId}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {instructions.length} {instructions.length === 1 ? 'instruction' : 'instructions'}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Instructions Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Working Instructions</DialogTitle>
            <DialogDescription>
              Task: {selectedTask}
            </DialogDescription>
          </DialogHeader>

          {selectedInstructions && (
            <div className="space-y-3 mt-4">
              {selectedInstructions.map((instruction, index) => (
                <Card key={instruction.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-white">{index + 1}</span>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-800 mb-2">
                        {instruction.title}
                      </h4>
                      
                      <p className="text-xs text-gray-600 leading-relaxed mb-3">
                        {instruction.description}
                      </p>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        {instruction.timeEstimate && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {instruction.timeEstimate}
                          </Badge>
                        )}
                        
                        {instruction.toolsNeeded && instruction.toolsNeeded.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Wrench className="h-3 w-3 mr-1" />
                            {instruction.toolsNeeded.join(', ')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CheckCircle2 className="h-5 w-5 text-gray-300" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
