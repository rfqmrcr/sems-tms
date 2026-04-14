
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import FormFieldWrapper from './FormFieldWrapper';
import { cn } from '@/lib/utils';

interface InputFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  step?: string;
  min?: string;
  max?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
  step,
  min,
  max,
}) => {
  const { control, formState: { errors } } = useFormContext();
  
  // Access nested errors
  const hasError = (fieldName: string): boolean => {
    const path = fieldName.split('.');
    let error: any = errors;
    for (const key of path) {
      if (error && typeof error === 'object' && key in error) {
        error = error[key];
      } else {
        return false;
      }
    }
    return !!error;
  };

  return (
    <FormFieldWrapper name={name} label={label} required={required}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            step={step}
            min={min}
            max={max}
            {...field}
            className={cn(hasError(name) && "border-red-500")}
          />
        )}
      />
    </FormFieldWrapper>
  );
};

export default InputField;
