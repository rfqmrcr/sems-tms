
import React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface CourseTitleFieldProps {
  control: any;
}

const CourseTitleField: React.FC<CourseTitleFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="course_title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Course Title *</FormLabel>
          <FormControl>
            <Input 
              placeholder="Enter course title" 
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

export default CourseTitleField;
