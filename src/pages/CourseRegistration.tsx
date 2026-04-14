import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchCourseByUrl } from '@/services/courseUrlService';
import { getRegistrationCounts } from '@/services/registrationCountService';
import { enrichCourseRunsWithCapacity } from '@/services/courseRunProcessor';
import CourseCalendarView from '@/components/CourseCalendarView';
import RegistrationContainer from '@/components/registration/RegistrationContainer';
import { CourseRun } from '@/types/course';

const CourseRegistration: React.FC = () => {
  const { courseUrl } = useParams<{ courseUrl: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<any>(null);
  const [courseRuns, setCourseRuns] = useState<CourseRun[]>([]);
  const [selectedCourseRun, setSelectedCourseRun] = useState<CourseRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseUrl) {
        toast({
          title: "Invalid URL",
          description: "Course URL is missing",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      try {
        const courseData = await fetchCourseByUrl(courseUrl);
        
        if (!courseData) {
          toast({
            title: "Course Not Found",
            description: "The requested course could not be found",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        setCourse(courseData);

        // Enrich course runs with capacity data and filter to only public ones
        if (courseData.course_runs && courseData.course_runs.length > 0) {
          // Filter to only show public course runs
          const publicCourseRuns = courseData.course_runs.filter((run: any) => run.visibility === 'public');
          const courseRunIds = publicCourseRuns.map((run: any) => run.id);
          const registrationCounts = await getRegistrationCounts(courseRunIds);
          const enrichedRuns = enrichCourseRunsWithCapacity(
            publicCourseRuns.map((run: any) => ({
              ...run,
              course: courseData,
              course_id: courseData.id
            })),
            registrationCounts
          );
          setCourseRuns(enrichedRuns);
        }
      } catch (error) {
        console.error('Error loading course:', error);
        toast({
          title: "Error",
          description: "Failed to load course information",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseUrl, navigate, toast]);

  const handleCourseSelect = (courseRun: CourseRun) => {
    setSelectedCourseRun(courseRun);
    setShowRegistration(true);
  };

  const handleBackToCourseList = () => {
    setShowRegistration(false);
    setSelectedCourseRun(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  if (showRegistration && selectedCourseRun) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={handleBackToCourseList}
            className="mb-6 text-primary hover:text-primary/80 transition-colors"
          >
            ← Back to Course Schedules
          </button>
          <RegistrationContainer preselectedCourseRun={selectedCourseRun} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {course.title}
          </h1>
          {course.description && (
            <p className="text-muted-foreground text-lg mb-6">
              {course.description}
            </p>
          )}
        </div>

        {/* Course Schedules */}
        {courseRuns.length > 0 ? (
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Available Schedules
            </h2>
            <CourseCalendarView
              courses={courseRuns}
              selectedCourse={selectedCourseRun}
              onCourseSelect={handleCourseSelect}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              No Classes Currently Scheduled
            </h2>
            <p className="text-muted-foreground">
              This course is not currently scheduled. Please check back later or contact us for more information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseRegistration;