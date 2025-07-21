import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'date';
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

interface GoldenStandardFormProps {
  title: string;
  description?: string;
  fields: FormField[];
  submitLabel?: string;
  onSubmit?: (data: Record<string, string>) => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
  variant?: 'default' | 'card';
}

/**
 * Golden Standard Form Template
 * 
 * A pre-configured form component that enforces the Golden Standard design system.
 * Use this as a starting point for new form components.
 * 
 * Features:
 * - Semantic color tokens for inputs and labels
 * - Proper typography hierarchy (font-body for labels and inputs)
 * - Semantic spacing tokens (space-*, component-*)
 * - Responsive design
 * - Accessibility-ready with proper labels and IDs
 * - Error state handling
 * - Loading state support
 * 
 * @example
 * <GoldenStandardForm
 *   title="Create Your Profile"
 *   description="Tell us about yourself to generate your cosmic blueprint"
 *   fields={[
 *     { id: 'name', label: 'Full Name', type: 'text', required: true },
 *     { id: 'email', label: 'Email', type: 'email', required: true },
 *     { id: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Tell us about yourself...' }
 *   ]}
 *   onSubmit={(data) => console.log(data)}
 *   variant="card"
 * />
 */
export const GoldenStandardForm: React.FC<GoldenStandardFormProps> = ({
  title,
  description,
  fields,
  submitLabel = "Submit",
  onSubmit,
  isLoading = false,
  errors = {},
  variant = 'default'
}) => {
  const [formData, setFormData] = React.useState<Record<string, string>>({});

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Call individual field onChange if provided
    const field = fields.find(f => f.id === fieldId);
    field?.onChange?.(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const renderField = (field: FormField) => {
    const value = field.value !== undefined ? field.value : formData[field.id] || '';
    const hasError = errors[field.id];

    return (
      <div key={field.id} className="space-y-component-sm">
        <Label 
          htmlFor={field.id}
          className={`
            font-body 
            text-text-base 
            ${hasError ? 'text-error' : 'text-main'}
          `}
        >
          {field.label}
          {field.required && (
            <span className="text-error ml-1">*</span>
          )}
        </Label>
        
        {field.type === 'textarea' ? (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            className={`
              border-border-default 
              focus:border-border-focus 
              bg-surface 
              text-main
              font-body
              ${hasError ? 'border-border-error' : ''}
            `}
          />
        ) : (
          <Input
            id={field.id}
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            className={`
              border-border-default 
              focus:border-border-focus 
              bg-surface 
              text-main
              font-body
              ${hasError ? 'border-border-error' : ''}
            `}
          />
        )}
        
        {hasError && (
          <p className="font-body text-text-sm text-error">
            {errors[field.id]}
          </p>
        )}
      </div>
    );
  };

  const formContent = (
    <>
      {/* Form Header */}
      <div className="space-y-space-sm mb-space-lg">
        <h2 className="font-display text-heading-xl text-main">
          {title}
        </h2>
        {description && (
          <p className="font-body text-text-base text-secondary">
            {description}
          </p>
        )}
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-space-md">
        <div className="space-y-space-lg">
          {fields.map(renderField)}
        </div>

        {/* Submit Button */}
        <Button 
          type="submit"
          disabled={isLoading}
          className="
            font-display 
            text-heading-sm
            w-full
            sm:w-auto
          "
        >
          {isLoading ? 'Processing...' : submitLabel}
        </Button>
      </form>
    </>
  );

  if (variant === 'card') {
    return (
      <Card className="bg-surface border-border-default shadow-card">
        <CardContent className="p-space-xl">
          {formContent}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-space-lg">
      {formContent}
    </div>
  );
};