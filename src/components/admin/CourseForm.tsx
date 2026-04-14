
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
} from '@/components/ui/form';
import { CourseRun, CourseRunSchedule } from '@/types/course';
import CourseRunTitleField from './form-fields/CourseRunTitleField';
import CourseSelectionField from './form-fields/CourseSelectionField';
import LocationSelectionField from './form-fields/LocationSelectionField';
import DateRangeFields from './form-fields/DateRangeFields';
import PriceCapacityFields from './form-fields/PriceCapacityFields';
import TrainerSelectionField from './form-fields/TrainerSelectionField';
import DailyScheduleEditor from './DailyScheduleEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface CourseFormProps {
  initialData?: CourseRun;
  onSubmit: (data: any, schedules: Partial<CourseRunSchedule>[]) => void;
  onCancel: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [schedules, setSchedules] = useState<Partial<CourseRunSchedule>[]>(
    initialData?.schedules || []
  );

  const form = useForm<any>({
    defaultValues: {
      title: initialData?.title || '',
      course_id: initialData?.course_id || '',
      start_date: initialData?.start_date || '',
      end_date: initialData?.end_date || '',
      start_time: initialData?.start_time || '09:00',
      end_time: initialData?.end_time || '18:00',
      price: initialData?.price || null,
      capacity: initialData?.capacity || null,
      location: initialData?.location || '',
      trainer_ids: [],
      visibility: initialData?.visibility || 'public',
      registration_close_days: 7,
    },
  });

  // Watch for course selection and date changes
  const selectedCourseId = form.watch('course_id');
  const startDate = form.watch('start_date');
  const endDate = form.watch('end_date');
  
  useEffect(() => {
    // Reset trainer selection when course changes
    if (selectedCourseId) {
      const currentTrainers = form.getValues('trainer_ids');
      if (Array.isArray(currentTrainers) && currentTrainers.length > 0) {
        form.setValue('trainer_ids', []);
      }
    }
  }, [selectedCourseId, form]);
  
  useEffect(() => {
    // Update schedules when initialData changes
    if (initialData?.schedules) {
      setSchedules(initialData.schedules);
    }
  }, [initialData]);

  const handleSubmit = (data: any) => {
    console.log('CourseForm handleSubmit called with:', data);
    
    // Convert string values to appropriate types
    const formattedData = {
      ...data,
      price: data.price ? parseFloat(data.price) : null,
      capacity: data.capacity ? parseInt(data.capacity, 10) : null,
    };

    // If editing, include the id
    if (initialData?.id) {
      formattedData.id = initialData.id;
    }

    console.log('Formatted data being submitted:', formattedData);
    console.log('Schedules being submitted:', schedules);
    onSubmit(formattedData, schedules);
  };

  const handleCourseSelect = (courseId: string, price: number | null) => {
    // Auto-populate price from selected course
    if (price !== null && price !== undefined) {
      form.setValue('price', price);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <CourseRunTitleField control={form.control} />
        <CourseSelectionField control={form.control} onCourseSelect={handleCourseSelect} />
        <LocationSelectionField control={form.control} />
        <DateRangeFields control={form.control} />
        <PriceCapacityFields control={form.control} />
        <TrainerSelectionField control={form.control} courseId={selectedCourseId} />
        
        <DailyScheduleEditor
          schedules={schedules}
          onSchedulesChange={setSchedules}
          startDate={startDate}
          endDate={endDate}
        />
        
        <FormField
          control={form.control}
          name="registration_close_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration Close Days *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="30"
                  placeholder="Days before start date to close registration"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visibility *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="public">Public - Show on website calendar</SelectItem>
                  <SelectItem value="private">Private - Registration URL only</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update Course Run' : 'Add Course Run'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CourseForm;
