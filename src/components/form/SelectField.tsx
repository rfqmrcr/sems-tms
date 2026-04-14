
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormFieldWrapper from './FormFieldWrapper';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps {
  name: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  renderValue?: (value: string, options: SelectOption[]) => React.ReactNode;
  onChange?: (e: any) => void; // Added onChange prop
}

export const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  options,
  placeholder = "Select an option",
  required = false,
  renderValue,
  onChange, // Added onChange prop
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
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              if (onChange) {
                onChange({ target: { value } }); // Pass event-like object to onChange
              }
            }}
            defaultValue={field.value}
          >
            <SelectTrigger id={name} className={cn(hasError(name) && "border-red-500")}>
              <SelectValue placeholder={placeholder}>
                {field.value && renderValue ? renderValue(field.value, options) : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FormFieldWrapper>
  );
};

export default SelectField;
