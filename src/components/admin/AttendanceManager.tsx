
import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import AttendanceTable from './AttendanceTable';

interface AttendanceManagerProps {
  registrationId: string;
}

interface CourseRun {
  id: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  courses: {
    id: string;
    title: string;
  };
}

const AttendanceManager: React.FC<AttendanceManagerProps> = ({ registrationId }) => {
  const [loading, setLoading] = useState(true);
  const [trainees, setTrainees] = useState<any[]>([]);
  const [courseRunInfo, setCourseRunInfo] = useState<CourseRun | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [courseDates, setCourseDates] = useState<Date[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Fetch registration and course run details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get registration with course run info
        const { data: registration, error: regError } = await supabase
          .from('registrations')
          .select(`
            *,
            course_runs!registrations_course_run_id_fkey (
              id,
              start_date,
              end_date,
              location,
              courses (
                id,
                title
              )
            )
          `)
          .eq('id', registrationId)
          .single();
          
        if (regError) throw regError;
        
        if (registration?.course_runs) {
          const courseRun = {
            id: registration.course_runs.id,
            start_date: registration.course_runs.start_date,
            end_date: registration.course_runs.end_date,
            location: registration.course_runs.location,
            courses: registration.course_runs.courses
          } as CourseRun;
          
          setCourseRunInfo(courseRun);
          
          // Generate dates between start and end date for the course run
          if (courseRun.start_date && courseRun.end_date) {
            const courseStartDate = new Date(courseRun.start_date);
            const courseEndDate = new Date(courseRun.end_date);
            setStartDate(courseStartDate);
            setEndDate(courseEndDate);
            
            const dates = [];
            let currentDate = courseStartDate;
            
            while (currentDate <= courseEndDate) {
              dates.push(new Date(currentDate));
              currentDate = addDays(currentDate, 1);
            }
            
            setCourseDates(dates);
            // Set selected date to course start date by default
            setSelectedDate(courseStartDate);
          }
        }
        
        // Get trainees for this registration
        const { data: traineeData, error: traineesError } = await supabase
          .from('trainees')
          .select('*')
          .eq('registration_id', registrationId);
          
        if (traineesError) throw traineesError;
        
        setTrainees(traineeData || []);
      } catch (error) {
        console.error('Error loading attendance data:', error);
        toast.error('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [registrationId]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setCalendarOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {courseRunInfo?.courses?.title || 'Course'} Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div className="mb-4 sm:mb-0">
              <p className="text-sm text-gray-500">Course Dates</p>
              <p className="font-medium">
                {courseRunInfo?.start_date ? (
                  <>
                    {format(new Date(courseRunInfo.start_date), 'PPP')} 
                    {courseRunInfo.end_date && ` - ${format(new Date(courseRunInfo.end_date), 'PPP')}`}
                  </>
                ) : (
                  'No dates specified'
                )}
              </p>
              {courseRunInfo?.location && (
                <p className="text-sm text-gray-500 mt-1">
                  Location: {courseRunInfo.location}
                </p>
              )}
            </div>
          </div>

          {trainees.length > 0 ? (
            <AttendanceTable 
              trainees={trainees} 
              registrationId={registrationId}
              startDate={startDate}
              endDate={endDate}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No trainees found for this registration.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceManager;
