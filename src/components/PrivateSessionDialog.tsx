import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

// Function to determine minimum participants based on course title
const getMinimumParticipants = (courseTitle: string): number => {
  const title = courseTitle.toLowerCase();
  
  // ACLS requires minimum 6 people
  if (title.includes('advanced cardiovascular life support') || title.includes('acls')) {
    return 6;
  }
  
  // BLS and all Heartsaver courses require minimum 12 people
  if (
    title.includes('basic life support') || 
    title.includes('bls') ||
    title.includes('heartsaver')
  ) {
    return 12;
  }
  
  // Default minimum for other courses
  return 1;
};

const createFormSchema = (minParticipants: number = 1) => z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(1, 'Mobile number is required'),
  courseChoice: z.string().min(1, 'Please select a course'),
  numberOfPeople: z.string()
    .min(1, 'Number of people is required')
    .refine((val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= minParticipants;
    }, `Minimum ${minParticipants} participants required for this course`),
  message: z.string().optional(),
  requestedSessionDate: z.string().optional(),
});

type FormData = z.infer<ReturnType<typeof createFormSchema>>;



interface PrivateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date | null;
}

interface Course {
  id: string;
  title: string;
}

export const PrivateSessionDialog: React.FC<PrivateSessionDialogProps> = ({
  open,
  onOpenChange,
  selectedDate,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const [minParticipants, setMinParticipants] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(createFormSchema(minParticipants)),
  });

  const courseChoice = watch('courseChoice');

  // Update minimum participants when course changes
  React.useEffect(() => {
    if (courseChoice && courses.length > 0) {
      const selectedCourse = courses.find(c => c.id === courseChoice);
      if (selectedCourse) {
        const min = getMinimumParticipants(selectedCourse.title);
        setMinParticipants(min);
      }
    }
  }, [courseChoice, courses]);

  // Load courses when dialog opens and set the requested date
  React.useEffect(() => {
    if (open && !coursesLoaded) {
      loadCourses();
    }
    if (open && selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('en-SG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      setValue('requestedSessionDate', formattedDate);
    }
  }, [open, coursesLoaded, selectedDate, setValue]);

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .order('title');

      if (error) throw error;
      setCourses(data || []);
      setCoursesLoaded(true);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load courses. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const selectedCourse = courses.find(c => c.id === data.courseChoice);
      
      const { error } = await supabase.functions.invoke('send-private-session-request', {
        body: {
          name: data.name,
          email: data.email,
          mobile: data.mobile,
          courseChoice: selectedCourse?.title || data.courseChoice,
          numberOfPeople: data.numberOfPeople,
          message: data.message || '',
          requestedSessionDate: data.requestedSessionDate || '',
        },
      });

      if (error) throw error;

      toast({
        title: 'Request Submitted',
        description: 'Your private session request has been received. We will reply back shortly.',
      });

      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book a Private Session</DialogTitle>
          <DialogDescription>
            Fill in the details below and we'll get back to you shortly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter your name"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter your email"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="mobile">
              Mobile <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mobile"
              {...register('mobile')}
              placeholder="Enter your mobile number"
              className={errors.mobile ? 'border-destructive' : ''}
            />
            {errors.mobile && (
              <p className="text-sm text-destructive mt-1">{errors.mobile.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="courseChoice">
              Course Choice <span className="text-destructive">*</span>
            </Label>
            <Select
              value={courseChoice}
              onValueChange={(value) => setValue('courseChoice', value)}
            >
              <SelectTrigger className={errors.courseChoice ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.courseChoice && (
              <p className="text-sm text-destructive mt-1">{errors.courseChoice.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="numberOfPeople">
              Number of People <span className="text-destructive">*</span>
            </Label>
            <Input
              id="numberOfPeople"
              type="number"
              min={minParticipants}
              {...register('numberOfPeople')}
              placeholder="Enter number of people"
              className={errors.numberOfPeople ? 'border-destructive' : ''}
            />
            {minParticipants > 1 && (
              <p className="text-sm text-muted-foreground mt-1">
                Minimum {minParticipants} participants required for this course
              </p>
            )}
            {errors.numberOfPeople && (
              <p className="text-sm text-destructive mt-1">{errors.numberOfPeople.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder="Enter any additional information"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
