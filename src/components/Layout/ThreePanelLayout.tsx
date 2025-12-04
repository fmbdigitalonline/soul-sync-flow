import React, { useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThreePanelLayoutProps {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  defaultToolsPanelWidth?: number;
  minToolsPanelWidth?: number;
  maxToolsPanelWidth?: number;
  className?: string;
  toolsPanelCollapsed: boolean;
  onToolsPanelToggle: () => void;
  showInlineToolsToggle?: boolean;
}

export const ThreePanelLayout: React.FC<ThreePanelLayoutProps> = ({
  leftPanel,
  centerPanel,
  rightPanel,
  defaultToolsPanelWidth = 350,
  minToolsPanelWidth = 300,
  maxToolsPanelWidth = 500,
  className,
  toolsPanelCollapsed,
  onToolsPanelToggle,
  showInlineToolsToggle = true
}) => {
  // Keyboard shortcut: Cmd/Ctrl + ]
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ']') {
        e.preventDefault();
        onToolsPanelToggle();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [onToolsPanelToggle]);

  return (
    <div className={cn("flex h-full w-full", className)}>
      <ResizablePanelGroup direction="horizontal" className="w-full">
        {/* Left Panel - Navigation (fixed) */}
        <ResizablePanel defaultSize={16} minSize={14} maxSize={20} className="min-w-[240px]">
          {leftPanel}
        </ResizablePanel>

        <ResizableHandle className="w-px bg-border hover:bg-primary/20 transition-colors" />

        {/* Center Panel - Main Content (flexible) */}
        <ResizablePanel defaultSize={toolsPanelCollapsed ? 84 : 58} minSize={40}>
          <div className="relative h-full w-full">
            {/* Toggle button for tools panel */}
            {showInlineToolsToggle && <Button
                variant="ghost"
                size="icon"
                onClick={onToolsPanelToggle}
                className="absolute top-4 right-4 z-10 h-8 w-8 rounded-lg bg-card/80 backdrop-blur-sm shadow-sm hover:bg-accent"
                title={toolsPanelCollapsed ? 'Show tools panel (⌘])' : 'Hide tools panel (⌘])'}
              >
                {toolsPanelCollapsed ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
              </Button>}

            {centerPanel}
          </div>
        </ResizablePanel>

        {/* Right Panel - Contextual Tools (collapsible) */}
        {!toolsPanelCollapsed && (
          <>
            <ResizableHandle className="w-px bg-border hover:bg-primary/20 transition-colors" />
            <ResizablePanel
              defaultSize={26}
              minSize={20}
              maxSize={35}
              className={cn(
                "transition-all duration-300",
                `min-w-[${minToolsPanelWidth}px] max-w-[${maxToolsPanelWidth}px]`
              )}
            >
              <div className="h-full overflow-y-auto bg-card/50 backdrop-blur-sm">
                {rightPanel}
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};
