import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BlueprintRawDataViewerProps {
  rawData?: string | any;
  data?: any; // Add this property to match usage in Blueprint.tsx
  rawResponse?: any; // Add this property to match usage in Blueprint.tsx
  className?: string;
}

export function BlueprintRawDataViewer({ rawData, data, rawResponse, className }: BlueprintRawDataViewerProps) {
  const [showRawData, setShowRawData] = useState(false);
  const { toast } = useToast();
  
  // Process data for display - either use data, rawData, or rawResponse, in that order
  const processedData = React.useMemo(() => {
    // Determine which data source to use
    const dataToProcess = data || rawData || rawResponse;
    
    if (!dataToProcess) return null;
    
    try {
      // If it's already a string, check if it's JSON
      if (typeof dataToProcess === 'string') {
        try {
          return JSON.stringify(JSON.parse(dataToProcess), null, 2);
        } catch {
          return dataToProcess;
        }
      }
      
      // If it's an error object
      if (dataToProcess instanceof Error) {
        return dataToProcess.toString();
      }
      
      // If it has a .message property (common for errors)
      if (dataToProcess.message) {
        return typeof dataToProcess.message === 'string'
          ? dataToProcess.message
          : JSON.stringify(dataToProcess, null, 2);
      }
      
      // Handle OpenAI API responses specifically
      if (dataToProcess.choices && Array.isArray(dataToProcess.choices)) {
        // Extract the message content from the OpenAI API response
        const content = dataToProcess.choices[0]?.message?.content;
        if (content) {
          return JSON.stringify({
            model: dataToProcess.model,
            content: content,
            finish_reason: dataToProcess.choices[0]?.finish_reason,
            created: dataToProcess.created,
            total_tokens: dataToProcess.usage?.total_tokens
          }, null, 2);
        }
      }
      
      // Otherwise, stringify the object
      return JSON.stringify(dataToProcess, null, 2);
    } catch (error) {
      console.error("Error processing raw data:", error);
      return typeof dataToProcess === 'string' ? dataToProcess : 'Error: Could not parse raw data';
    }
  }, [rawData, data, rawResponse]);
  
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
  
  if (!processedData) {
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
