import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CourseRun } from '@/types/course';
import { fetchCourseRunByUrl } from '@/services/courseUrlService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import RegistrationContainer from '@/components/registration/RegistrationContainer';

const DirectRegistration: React.FC = () => {
  const { registrationUrl } = useParams<{ registrationUrl: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courseRun, setCourseRun] = useState<CourseRun | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseRun = async () => {
      if (!registrationUrl) {
        navigate('/not-found');
        return;
      }

      try {
        const data = await fetchCourseRunByUrl(registrationUrl);
        
        if (!data) {
          toast({
            title: "Course Not Found",
            description: "The course registration link you followed is invalid or has expired.",
            variant: "destructive",
          });
          navigate('/courses');
          return;
        }

        setCourseRun(data);
      } catch (error) {
        console.error('Error fetching course run:', error);
        toast({
          title: "Error",
          description: "Failed to load course information. Please try again.",
          variant: "destructive",
        });
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseRun();
  }, [registrationUrl, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course information...</p>
        </div>
      </div>
    );
  }

  if (!courseRun) {
    return null; // Navigation will handle redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Register for Course</h1>
        <div className="bg-card p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">
            {courseRun.title || courseRun.course?.title}
          </h2>
          {courseRun.course?.description && (
            <p className="text-muted-foreground mb-2">
              {courseRun.course.description}
            </p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {courseRun.start_date && (
              <span>
                <strong>Start Date:</strong> {new Date(courseRun.start_date).toLocaleDateString()}
              </span>
            )}
            {courseRun.end_date && (
              <span>
                <strong>End Date:</strong> {new Date(courseRun.end_date).toLocaleDateString()}
              </span>
            )}
            {courseRun.location && (
              <span>
                <strong>Location:</strong> {courseRun.location}
              </span>
            )}
            {courseRun.price && (
              <span>
                <strong>Price:</strong> AED {courseRun.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <RegistrationContainer preselectedCourseRun={courseRun} />
    </div>
  );
};

export default DirectRegistration;