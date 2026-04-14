
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CourseRun } from '@/services/courseService';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Calendar, Clock } from 'lucide-react';

interface CourseCardProps {
  course: CourseRun;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate();

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

  const handleRegister = () => {
    navigate('/registration', { state: { course } });
  };

  // Calculate remaining spots consistently
  const getRemainingSpots = () => {
    // If capacity is not set or is 0, return 0
    if (course.capacity === undefined || course.capacity === null || course.capacity === 0) {
      return 0;
    }
    
    // Use remainingCapacity if it's explicitly set, otherwise assume full capacity is available
    if (course.remainingCapacity !== undefined) {
      return course.remainingCapacity;
    }
    
    // Fallback to full capacity if remainingCapacity is not calculated
    return course.capacity;
  };

  // Determine capacity status for styling
  const getCapacityColor = () => {
    if (!course.capacity) return 'text-gray-600';
    
    const remainingSpots = getRemainingSpots();
    const capacityPercentage = (remainingSpots / course.capacity) * 100;
    
    if (capacityPercentage <= 0) return 'text-red-600';
    if (capacityPercentage <= 25) return 'text-orange-500';
    return 'text-green-600';
  };

  const getPriceDisplay = () => {
    if (course.priceDisplay) return course.priceDisplay;
    if (course.price) return `AED ${course.price.toFixed(2)}`;
    return 'Contact for pricing';
  };

  // Get the course title with proper fallback
  const getCourseTitle = () => {
    // Try different possible paths for the course title
    if (course.course?.title) return course.course.title;
    if (course.title) return course.title;
    return 'Course Title'; // Fallback
  };

  const remainingSpots = getRemainingSpots();
  const isCourseFull = course.capacity !== undefined && remainingSpots <= 0;

  return (
    <Card className="h-full flex flex-col border-2 border-gray-100 hover:border-primary transition-colors duration-300">
      <CardHeader>
        <CardTitle>{getCourseTitle()}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        {course.course?.description && (
          <p className="text-gray-600">{course.course.description}</p>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="font-medium mr-2">Dates:</span>
            <span>
              {formatDate(course.start_date)} - {formatDate(course.end_date)}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="font-medium mr-2">Time:</span>
            <span>
              {formatTime(course.start_time)} - {formatTime(course.end_time)}
            </span>
          </div>
          
          {course.location && (
            <div className="flex items-start text-sm">
              <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
              <span>{course.location}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <span className="font-medium mr-2">Price:</span>
            <span>{getPriceDisplay()}</span>
          </div>
          
          {course.capacity !== undefined && (
            <div className="flex items-center text-sm">
              <Users className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="font-medium mr-2">Capacity:</span>
              <span>
                <span className={getCapacityColor()}>
                  {remainingSpots}
                </span>
                /{course.capacity} spots available
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleRegister}
          className="w-full"
          disabled={isCourseFull}
        >
          {isCourseFull ? 'Course Full' : 'Register Now'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
