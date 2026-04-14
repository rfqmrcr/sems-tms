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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface TrainerSelectionFieldProps {
  control: any;
  courseId?: string;
}

const TrainerSelectionField: React.FC<TrainerSelectionFieldProps> = ({ control, courseId }) => {
  const { data: trainers, isLoading } = useQuery({
    queryKey: ['trainers-for-course', courseId],
    queryFn: async () => {
      if (!courseId) {
        // If no course selected, return all active trainers
        const { data, error } = await supabase
          .from('trainers')
          .select('id, full_name')
          .eq('is_active', true)
          .order('full_name');

        if (error) throw error;
        return data;
      }

      // Get trainers who can teach this specific course
      const { data, error } = await supabase
        .from('trainers')
        .select(`
          id, 
          full_name,
          trainer_courses!inner(course_id)
        `)
        .eq('is_active', true)
        .eq('trainer_courses.course_id', courseId)
        .order('full_name');

      if (error) throw error;
      return data;
    },
  });

  return (
    <FormField
      control={control}
      name="trainer_ids"
      render={({ field }) => {
        const selectedIds = field.value || [];
        const selectedTrainers = trainers?.filter(t => selectedIds.includes(t.id)) || [];

        const toggleTrainer = (trainerId: string) => {
          const currentIds = field.value || [];
          if (currentIds.includes(trainerId)) {
            field.onChange(currentIds.filter((id: string) => id !== trainerId));
          } else {
            field.onChange([...currentIds, trainerId]);
          }
        };

        return (
          <FormItem>
            <FormLabel>Trainers</FormLabel>
            
            {selectedTrainers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTrainers.map((trainer) => (
                  <Badge key={trainer.id} variant="secondary" className="gap-1">
                    {trainer.full_name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => toggleTrainer(trainer.id)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            <FormControl>
              <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading trainers...</p>
                ) : trainers && trainers.length > 0 ? (
                  trainers.map((trainer) => (
                    <div key={trainer.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`trainer-${trainer.id}`}
                        checked={selectedIds.includes(trainer.id)}
                        onCheckedChange={() => toggleTrainer(trainer.id)}
                      />
                      <label
                        htmlFor={`trainer-${trainer.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {trainer.full_name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No trainers available</p>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default TrainerSelectionField;