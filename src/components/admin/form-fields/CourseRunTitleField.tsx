
import React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface CourseRunTitleFieldProps {
  control: any;
}

const CourseRunTitleField: React.FC<CourseRunTitleFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Course Run Title *</FormLabel>
          <FormControl>
            <Input 
              placeholder="Enter course run title" 
              {...field} 
              value={field.value || ''} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CourseRunTitleField;
