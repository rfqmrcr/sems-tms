import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTrainer } from '@/contexts/TrainerContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AttendanceManager from '@/components/admin/AttendanceManager';

interface CourseRun {
  id: string;
  title: string;
  start_date: string;
  course: {
    title: string;
  };
}

interface Registration {
  id: string;
  course_run_id: string;
}

const TrainerAttendance: React.FC = () => {
  const { trainerId } = useTrainer();
  const navigate = useNavigate();
  const [courseRuns, setCourseRuns] = useState<CourseRun[]>([]);
  const [selectedCourseRunId, setSelectedCourseRunId] = useState<string>('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseRuns = async () => {
      if (!trainerId) return;

      try {
        const { data, error } = await supabase
          .from('course_runs')
          .select(`
            id,
            title,
            start_date,
            course:courses(title)
          `)
          .eq('trainer_id', trainerId)
          .order('start_date', { ascending: false });

        if (error) throw error;
        setCourseRuns(data || []);
        
        // Auto-select first course if available
        if (data && data.length > 0) {
          setSelectedCourseRunId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching course runs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseRuns();
  }, [trainerId]);

  // Fetch registrations when course run is selected
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!selectedCourseRunId) {
        setRegistrations([]);
        setSelectedRegistrationId('');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('id, course_run_id')
          .eq('course_run_id', selectedCourseRunId);

        if (error) throw error;
        setRegistrations(data || []);
        
        // Auto-select first registration if available
        if (data && data.length > 0) {
          setSelectedRegistrationId(data[0].id);
        } else {
          setSelectedRegistrationId('');
        }
      } catch (error) {
        console.error('Error fetching registrations:', error);
      }
    };

    fetchRegistrations();
  }, [selectedCourseRunId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/trainer/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Attendance Management</h1>
              <p className="text-muted-foreground mt-1">
                Mark and track trainee attendance
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Course</CardTitle>
          </CardHeader>
          <CardContent>
            {courseRuns.length === 0 ? (
              <p className="text-muted-foreground">
                No courses assigned to you yet.
              </p>
            ) : (
              <Select value={selectedCourseRunId} onValueChange={setSelectedCourseRunId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courseRuns.map((run) => (
                    <SelectItem key={run.id} value={run.id}>
                      {run.title || run.course.title} - {new Date(run.start_date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {selectedCourseRunId && registrations.length > 0 && (
          <>
            {registrations.length > 1 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Select Registration</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedRegistrationId} onValueChange={setSelectedRegistrationId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a registration" />
                    </SelectTrigger>
                    <SelectContent>
                      {registrations.map((reg) => (
                        <SelectItem key={reg.id} value={reg.id}>
                          Registration {reg.id.substring(0, 8)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {selectedRegistrationId && (
              <AttendanceManager registrationId={selectedRegistrationId} />
            )}
          </>
        )}

        {selectedCourseRunId && registrations.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No registrations found for this course run.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default TrainerAttendance;
