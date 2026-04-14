
import React from 'react';
import CourseCalendarView from '@/components/CourseCalendarView';
import { CourseRun } from '@/services/courseService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, Clock, Users, RefreshCw, MapPin } from 'lucide-react';
import DailyScheduleDisplay from '@/components/DailyScheduleDisplay';

interface CourseSelectionStepProps {
  courses: CourseRun[];
  selectedCourse: CourseRun | null;
  onCourseSelect: (course: CourseRun) => void;
  sponsorshipType?: 'corporate' | 'self' | null;
  onChangeCourse?: () => void;
}

const CourseSelectionStep: React.FC<CourseSelectionStepProps> = ({
  courses,
  selectedCourse,
  onCourseSelect,
  sponsorshipType,
  onChangeCourse
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBA';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getCourseTitle = (course: CourseRun) => {
    if (course.course?.title) return course.course.title;
    if (course.title) return course.title;
    return 'Course Title';
  };

  const getPriceDisplay = (course: CourseRun) => {
    if (course.priceDisplay) return course.priceDisplay;
    if (course.price) return `AED ${course.price.toFixed(2)}`;
    return 'Contact for pricing';
  };

  // If a course is selected and sponsorship type is chosen, show compressed view
  if (selectedCourse && sponsorshipType) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Selected Course</h2>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {sponsorshipType === 'corporate' ? 'Corporate Registration' : 'Individual Registration'}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onChangeCourse}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Change Course
            </Button>
          </div>
        </div>
        
        <Card className="border-2 border-primary bg-primary/5">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-left">{getCourseTitle(selectedCourse)}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-3">
                <div className="flex items-start text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-primary mt-0.5" />
                  <div className="flex-1 text-left">
                    <span className="font-medium text-left">Dates:</span>
                    <div className="mt-1 text-left">
                      {selectedCourse.schedules && selectedCourse.schedules.length > 0 ? (
                        <DailyScheduleDisplay 
                          schedules={selectedCourse.schedules} 
                          compact={false}
                        />
                      ) : (
                        <span>{formatDate(selectedCourse.start_date)} - {formatDate(selectedCourse.end_date)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {(!selectedCourse.schedules || selectedCourse.schedules.length === 0) && (
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-medium mr-2">Time:</span>
                    <span>
                      {formatTime(selectedCourse.start_time)} - {formatTime(selectedCourse.end_time)}
                    </span>
                  </div>
                )}

                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium mr-2">Location:</span>
                  <span>{selectedCourse.location || 'Dubai Investment Park 1'}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <span className="font-medium mr-2">Price:</span>
                  <span className="text-primary font-semibold">{getPriceDisplay(selectedCourse)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default view - show all courses
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Select a Course</h2>
      {sponsorshipType && (
        <div className="mb-4">
          <Badge variant="secondary" className="text-sm">
            {sponsorshipType === 'corporate' ? 'Corporate Registration' : 'Individual Registration'}
          </Badge>
        </div>
      )}
      {courses.length === 0 ? (
        <p className="text-center text-gray-500">No courses available at the moment.</p>
      ) : (
        <CourseCalendarView
          courses={courses}
          selectedCourse={selectedCourse}
          onCourseSelect={onCourseSelect}
        />
      )}
    </div>
  );
};

export default CourseSelectionStep;
