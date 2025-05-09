import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BlueprintRawDataViewerProps {
  rawData?: string | any;
  className?: string;
}

export function BlueprintRawDataViewer({ rawData, className }: BlueprintRawDataViewerProps) {
  const [showRawData, setShowRawData] = useState(false);
  const { toast } = useToast();
  
  // Handle data that might be a string or object
  const processedData = React.useMemo(() => {
    if (!rawData) return null;
    
    try {
      // If it's already a string, check if it's JSON
      if (typeof rawData === 'string') {
        try {
          return JSON.stringify(JSON.parse(rawData), null, 2);
        } catch {
          return rawData;
        }
      }
      // Otherwise, stringify the object
      return JSON.stringify(rawData, null, 2);
    } catch (error) {
      console.error("Error processing raw data:", error);
      return typeof rawData === 'string' ? rawData : 'Error: Could not parse raw data';
    }
  }, [rawData]);
  
  // Copy data to clipboard
  const copyToClipboard = () => {
    if (processedData) {
      navigator.clipboard.writeText(processedData);
      toast({
        title: "Copied to clipboard",
        description: "Raw data has been copied to your clipboard",
      });
    }
  };
  
  if (!rawData) {
    return null;
  }
  
  return (
    <div className={`mt-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowRawData(!showRawData)}
          className="flex items-center gap-2"
        >
          {showRawData ? (
            <>
              <EyeOff className="h-4 w-4" />
              Hide Raw Response
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              View Raw Response
            </>
          )}
        </Button>
        
        {showRawData && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={copyToClipboard}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        )}
      </div>
      
      {showRawData && processedData && (
        <div className="mt-2 p-3 bg-black/20 rounded-md text-xs overflow-auto max-h-[500px]">
          <pre className="text-green-400 whitespace-pre-wrap">{processedData}</pre>
        </div>
      )}
    </div>
  );
}
