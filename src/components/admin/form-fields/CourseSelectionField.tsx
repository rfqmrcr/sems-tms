
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CourseSelectionFieldProps {
  control: any;
  onCourseSelect?: (courseId: string, price: number | null) => void;
}

const CourseSelectionField: React.FC<CourseSelectionFieldProps> = ({ control, onCourseSelect }) => {
  // Fetch available courses with price
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, price')
        .order('title', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <FormField
      control={control}
      name="course_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Course *</FormLabel>
          <FormControl>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                const selectedCourse = courses.find(c => c.id === value);
                if (selectedCourse && onCourseSelect) {
                  onCourseSelect(value, selectedCourse.price);
                }
              }}
              value={field.value || ''}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading courses..." : "Select a course"} />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CourseSelectionField;
