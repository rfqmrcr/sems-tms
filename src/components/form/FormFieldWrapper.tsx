
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldWrapperProps {
  name: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
  name,
  label,
  required = false,
  children,
}) => {
  const { formState: { errors } } = useFormContext();
  
  // Get the error for a specific field
  const getFieldError = (fieldName: string): string | undefined => {
    // Access nested field errors with lodash-like path syntax
    const path = fieldName.split('.');
    let error: any = errors;
    for (const key of path) {
      if (error && typeof error === 'object' && key in error) {
        error = error[key];
      } else {
        error = undefined;
        break;
      }
    }
    
    // Safely convert error to string if it has a message property
    return error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : undefined;
  };

  const errorMessage = getFieldError(name);

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {errorMessage && (
        <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

export default FormFieldWrapper;
