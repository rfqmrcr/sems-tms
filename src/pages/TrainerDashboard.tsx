import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTrainer } from '@/contexts/TrainerContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface CourseRun {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  course: {
    title: string;
    description: string;
  };
  registration_count?: number;
}

const TrainerDashboard: React.FC = () => {
  const { trainerId, trainerData } = useTrainer();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courseRuns, setCourseRuns] = useState<CourseRun[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user needs to change password
  useEffect(() => {
    if (user?.user_metadata?.requires_password_change) {
      navigate('/change-password');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchCourseRuns = async () => {
      if (!trainerId) return;

      try {
        const { data, error } = await supabase
          .from('course_runs')
          .select(`
            *,
            course:courses(title, description)
          `)
          .eq('trainer_id', trainerId)
          .order('start_date', { ascending: true });

        if (error) throw error;

        // Fetch registration counts
        const runsWithCounts = await Promise.all(
          (data || []).map(async (run) => {
            const { count } = await supabase
              .from('registrations')
              .select('*', { count: 'exact', head: true })
              .eq('course_run_id', run.id);
            
            return { ...run, registration_count: count || 0 };
          })
        );

        setCourseRuns(runsWithCounts);
      } catch (error) {
        console.error('Error fetching course runs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseRuns();
  }, [trainerId]);

  const upcomingCourses = courseRuns.filter(
    run => new Date(run.start_date) >= new Date()
  );

  const pastCourses = courseRuns.filter(
    run => new Date(run.start_date) < new Date()
  );

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Trainer Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {trainerData?.full_name}!
              </p>
            </div>
            <Button onClick={() => navigate('/trainer/attendance')}>
              Manage Attendance
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseRuns.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingCourses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trainees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courseRuns.reduce((sum, run) => sum + (run.registration_count || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Courses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Upcoming Courses</h2>
          {upcomingCourses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No upcoming courses assigned
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingCourses.map((run) => (
                <Card key={run.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {run.title || run.course.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {run.course.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(run.start_date), 'MMM dd, yyyy')} -{' '}
                          {format(new Date(run.end_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {run.start_time} - {run.end_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {run.registration_count} / {run.capacity} registered
                        </span>
                      </div>
                      {run.location && (
                        <div className="text-muted-foreground">
                          📍 {run.location}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past Courses */}
        {pastCourses.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Past Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastCourses.map((run) => (
                <Card key={run.id} className="opacity-75">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {run.title || run.course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(run.start_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{run.registration_count} trainees</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TrainerDashboard;
