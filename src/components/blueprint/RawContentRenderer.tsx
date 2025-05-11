
import React from "react";
import BlueprintSection from "@/components/blueprint/BlueprintSection";

interface RawContentRendererProps {
  content: string;
  className?: string;
}

/**
 * Component to render raw JSON or text content from the API in a structured way
 */
export const RawContentRenderer: React.FC<RawContentRendererProps> = ({
  content,
  className,
}) => {
  // Try to extract JSON if content appears to be in JSON format
  const processedContent = React.useMemo(() => {
    if (!content) return null;
    
    try {
      // Check if content is already in a code block and extract it
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        try {
          // Try to parse the extracted content as JSON
          const jsonContent = JSON.parse(codeBlockMatch[1]);
          return jsonContent;
        } catch {
          // If parsing fails, return the extracted text
          return codeBlockMatch[1];
        }
      }
      
      // Try to parse the entire content as JSON
      try {
        const jsonContent = JSON.parse(content);
        return jsonContent;
      } catch {
        // If all parsing attempts fail, return the raw content
        return content;
      }
    } catch {
      return content;
    }
  }, [content]);
  
  // Helper to render a JSON object section
  const renderJsonSection = (sectionName: string, data: any) => {
    if (!data) return null;
    
    return (
      <BlueprintSection 
        id={`section-${sectionName}`}
        title={formatSectionName(sectionName)} 
        className="mt-6"
        showExpandIcon={true}
        defaultExpanded={true}
      >
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) => {
            // Don't recursively render nested objects, just convert them to string
            const displayValue = typeof value === 'object' && value !== null
              ? JSON.stringify(value)
              : String(value);
              
            return (
              <div key={key} className="grid grid-cols-3 gap-2">
                <div className="font-medium">{formatKey(key)}:</div>
                <div className="col-span-2">{displayValue}</div>
              </div>
            );
          })}
        </div>
      </BlueprintSection>
    );
  };

  // Format section name for display
  const formatSectionName = (name: string) => {
    return name
      .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Uppercase first letter
      .trim();
  };
  
  // Format property key for display
  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Uppercase first letter
      .trim();
  };
  
  // If content is a string (not parsed as JSON)
  if (typeof processedContent === 'string') {
    return (
      <div className={className}>
        <BlueprintSection 
          id="raw-content"
          title="Generated Blueprint Content"
          showExpandIcon={true}
          defaultExpanded={true}
        >
          <div className="whitespace-pre-wrap text-sm">{processedContent}</div>
        </BlueprintSection>
      </div>
    );
  }
  
  // If content is a parsed JSON object
  if (processedContent && typeof processedContent === 'object') {
    return (
      <div className={className}>
        {Object.entries(processedContent).map(([sectionName, sectionData]) => (
          <React.Fragment key={sectionName}>
            {renderJsonSection(sectionName, sectionData)}
          </React.Fragment>
        ))}
      </div>
    );
  }
  
  // Fallback if no content could be processed
  return (
    <div className={className}>
      <BlueprintSection 
        id="no-content"
        title="Blueprint Content"
        showExpandIcon={true}
        defaultExpanded={true}
      >
        <div className="text-muted-foreground">
          No readable content was found in the response.
        </div>
      </BlueprintSection>
    </div>
  );
};

export default RawContentRenderer;
