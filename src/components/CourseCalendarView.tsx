import React, { useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, startOfDay, differenceInDays, isBefore } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users, DollarSign, Clock, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CourseRun, fetchAlternativeCourseRuns } from '@/services/courseService';
import CourseDescriptionWithReadMore from '@/components/CourseDescriptionWithReadMore';
import DailyScheduleDisplay from '@/components/DailyScheduleDisplay';
import { PrivateSessionDialog } from '@/components/PrivateSessionDialog';

interface CourseCalendarViewProps {
  courses: CourseRun[];
  selectedCourse: CourseRun | null;
  onCourseSelect: (course: CourseRun) => void;
}

const CourseCalendarView: React.FC<CourseCalendarViewProps> = ({
  courses,
  selectedCourse,
  onCourseSelect
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showRescheduleOptions, setShowRescheduleOptions] = useState(false);
  const [alternativeCourseRuns, setAlternativeCourseRuns] = useState<CourseRun[]>([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPrivateSessionDialogOpen, setIsPrivateSessionDialogOpen] = useState(false);
  const [selectedPrivateSessionDate, setSelectedPrivateSessionDate] = useState<Date | null>(null);

  // Auto-scroll to top when a course is selected
  useEffect(() => {
    if (selectedCourse && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedCourse]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Create proper calendar grid with correct day-of-week positioning
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Start week on Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 }); // End week on Saturday
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getCoursesForDate = (date: Date) => {
    return courses.filter(course => {
      if (!course.start_date) return false;
      
      // Normalize all dates to start of day to ignore time components
      const normalizedDate = startOfDay(date);
      const courseStartDate = startOfDay(new Date(course.start_date));
      const courseEndDate = course.end_date ? startOfDay(new Date(course.end_date)) : courseStartDate;
      
      // Check if the date falls within the course duration (inclusive)
      return normalizedDate >= courseStartDate && normalizedDate <= courseEndDate;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(isSameDay(date, selectedDate || new Date('1900-01-01')) ? null : date);
  };

  const getFilteredCourses = () => {
    const today = startOfDay(new Date());
    let filteredCourses = courses;
    
    // Filter out courses with past dates only in list view
    if (activeTab === 'list') {
      filteredCourses = courses.filter(course => {
        if (!course.start_date) return false;
        
        // Use end_date if it exists, otherwise use start_date
        const courseEndDate = course.end_date 
          ? startOfDay(new Date(course.end_date))
          : startOfDay(new Date(course.start_date));
        
        // Exclude courses that have already ended
        return courseEndDate >= today;
      });
    }
    
    // Then filter by selected date if applicable (calendar view)
    if (selectedDate) {
      filteredCourses = filteredCourses.filter(course => {
        if (!course.start_date) return false;
        
        // Normalize all dates to start of day to ignore time components
        const normalizedSelectedDate = startOfDay(selectedDate);
        const courseStartDate = startOfDay(new Date(course.start_date));
        const courseEndDate = course.end_date ? startOfDay(new Date(course.end_date)) : courseStartDate;
        
        // Check if the selected date falls within the course duration (inclusive)
        return normalizedSelectedDate >= courseStartDate && normalizedSelectedDate <= courseEndDate;
      });
    }
    
    // Always sort by start_date ascending to ensure earliest dates appear first
    return filteredCourses.sort((a, b) => {
      if (!a.start_date && !b.start_date) return 0;
      if (!a.start_date) return 1;
      if (!b.start_date) return -1;
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    });
  };

  const formatCourseDate = (startDate: string | null, endDate: string | null) => {
    if (!startDate) return 'TBA';
    const start = format(new Date(startDate), 'MMM d');
    if (!endDate || startDate === endDate) return start;
    const end = format(new Date(endDate), 'MMM d');
    return `${start} - ${end}`;
  };

  const getTimeSlots = (course: CourseRun) => {
    if (course.start_time && course.end_time) {
      // Format the time from 24-hour format to 12-hour format
      const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const hour24 = parseInt(hours, 10);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const ampm = hour24 >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
      };
      
      const startTimeFormatted = formatTime(course.start_time);
      const endTimeFormatted = formatTime(course.end_time);
      
      return [`${startTimeFormatted} - ${endTimeFormatted}`];
    }
    // Fallback if no time data is available
    return ['Time TBA'];
  };

  const getPriceDisplay = (course: CourseRun) => {
    if (course.priceDisplay) return course.priceDisplay;
    if (course.price) return `AED ${course.price.toFixed(2)}`;
    return 'Contact for pricing';
  };

  const getRemainingCapacity = (course: CourseRun) => {
    return course.remainingCapacity ?? course.capacity ?? 0;
  };

  const getCourseStatus = (course: CourseRun) => {
    if (!course.start_date) return { status: 'tba', canRegister: false, badge: 'TBA', variant: 'secondary' as const };
    
    const today = startOfDay(new Date());
    const courseStartDate = startOfDay(new Date(course.start_date));
    const daysUntilStart = differenceInDays(courseStartDate, today);
    
    // Course has already passed
    if (isBefore(courseStartDate, today)) {
      return { status: 'past', canRegister: false, badge: 'Past', variant: 'secondary' as const };
    }
    
    // Course starts in 2 days or less (0, 1, or 2 days)
    if (daysUntilStart <= 2) {
      return { status: 'closed', canRegister: false, badge: 'Registration Closed', variant: 'destructive' as const };
    }
    
    // Course starts in 3+ days and has capacity
    if (getRemainingCapacity(course) > 0) {
      return { status: 'available', canRegister: true, badge: 'Available', variant: 'default' as const };
    }
    
    // Course is full
    return { status: 'full', canRegister: false, badge: 'Full', variant: 'destructive' as const };
  };

  const handleShowRescheduleOptions = async (course: CourseRun) => {
    if (!course.course_id) {
      console.error('Course ID is missing');
      return;
    }

    setLoadingAlternatives(true);
    try {
      const alternatives = await fetchAlternativeCourseRuns(course.course_id, course.id);
      setAlternativeCourseRuns(alternatives);
      setShowRescheduleOptions(!showRescheduleOptions);
    } catch (error) {
      console.error('Failed to fetch alternative course runs:', error);
    } finally {
      setLoadingAlternatives(false);
    }
  };

  const handleRescheduleSelect = (alternativeCourse: CourseRun) => {
    onCourseSelect(alternativeCourse);
    setShowRescheduleOptions(false);
    setAlternativeCourseRuns([]);
  };

  const filteredCourses = getFilteredCourses();

  return (
    <div ref={containerRef} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Selected Course - Condensed View */}
          {selectedCourse && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-green-700">Selected Course</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCourseSelect({ id: '', course_id: '', start_date: '', end_date: '', capacity: 0, price: 0 } as CourseRun)}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Change Course
                </Button>
              </div>

              <Card className="border-2 border-green-500 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h4 className="font-semibold text-lg mb-2">
                        {selectedCourse.course?.title || 'Course Title'}
                      </h4>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{formatCourseDate(selectedCourse.start_date, selectedCourse.end_date)}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{selectedCourse.location || 'Dubai Investment Park 1'}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{getRemainingCapacity(selectedCourse)}/{selectedCourse.capacity} available</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{getPriceDisplay(selectedCourse)}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {getTimeSlots(selectedCourse).map((timeSlot, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {timeSlot}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      Selected
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-2">
                  Ready to continue with this course, or change your selection above.
                </p>
              </div>
            </div>
          )}

          {/* Course List - Show only when no course is selected */}
          {!selectedCourse && (
            <>
              {/* Date Filter Display */}
              {selectedDate && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border">
                  <Filter className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Showing courses for {format(selectedDate, 'PPPP')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDate(null)}
                    className="ml-auto h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {selectedDate ? `Courses on ${format(selectedDate, 'MMM d, yyyy')}` : 'Available Courses'}
                  {filteredCourses.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''})
                    </span>
                  )}
                </h3>
                
                {filteredCourses.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-gray-500">
                      {selectedDate 
                        ? `No courses available on ${format(selectedDate, 'MMM d, yyyy')}`
                        : 'No courses available at the moment.'
                      }
                    </p>
                    {selectedDate && (
                      <Button
                        variant="outline"
                        onClick={() => setSelectedDate(null)}
                        className="mt-4"
                      >
                        View All Courses
                      </Button>
                    )}
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {filteredCourses.map((course) => {
                      const courseStatus = getCourseStatus(course);
                      return (
                        <Card 
                          key={course.id}
                          className={`transition-all ${
                            !courseStatus.canRegister 
                              ? 'opacity-75 cursor-not-allowed' 
                              : 'cursor-pointer hover:shadow-md'
                          } ${
                            selectedCourse?.id === course.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                          }`}
                          onClick={() => courseStatus.canRegister && onCourseSelect(course)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-grow">
                                <h4 className="font-semibold text-lg mb-2 text-center">
                                  {course.course?.title || 'Course Title'}
                                </h4>
                                {course.course?.description && (
                                  <CourseDescriptionWithReadMore 
                                    description={course.course.description}
                                    className="text-gray-600 text-sm mb-3 text-left"
                                  />
                                )}
                                <div className="flex flex-wrap gap-4 text-sm">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                                    <span>{formatCourseDate(course.start_date, course.end_date)}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                                    <span>{course.location || 'Dubai Investment Park 1'}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-1 text-gray-500" />
                                    <span>{getRemainingCapacity(course)}/{course.capacity} available</span>
                                  </div>
                                  <div className="flex items-center">
                                    <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                                    <span>{getPriceDisplay(course)}</span>
                                  </div>
                                </div>

                                {/* Daily Schedule or Time Slots */}
                                {course.schedules && course.schedules.length > 0 ? (
                                  <div className="mt-3 text-left">
                                    <div className="text-xs font-medium text-gray-600 mb-1 text-left">Schedule:</div>
                                    <DailyScheduleDisplay 
                                      schedules={course.schedules} 
                                      compact={true}
                                    />
                                  </div>
                                ) : (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {getTimeSlots(course).map((timeSlot, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {timeSlot}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* Reschedule Options */}
                                {selectedCourse?.id === course.id && showRescheduleOptions && (
                                  <div className="mt-4 p-3 border rounded-lg bg-gray-50">
                                    <h5 className="font-medium text-sm mb-2">Alternative Dates:</h5>
                                    {loadingAlternatives ? (
                                      <p className="text-sm text-gray-500">Loading alternatives...</p>
                                    ) : alternativeCourseRuns.length > 0 ? (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {alternativeCourseRuns.map((altCourse) => (
                                          <Button
                                            key={altCourse.id}
                                            variant="outline"
                                            size="sm"
                                            className="text-xs flex flex-col items-start p-2 h-auto"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRescheduleSelect(altCourse);
                                            }}
                                          >
                                            <div className="font-medium">
                                              {format(new Date(altCourse.start_date || ''), 'MMM d, yyyy')}
                                            </div>
                                            <div className="text-gray-500">
                                              {getRemainingCapacity(altCourse)}/{altCourse.capacity} slots
                                            </div>
                                          </Button>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-500">No alternative dates available</p>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4 flex flex-col items-end gap-2">
                                <div className={`w-4 h-4 rounded-full border-2 ${
                                  selectedCourse?.id === course.id
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'border-gray-300'
                                }`} />
                                <Badge variant={courseStatus.variant}>
                                  {courseStatus.badge}
                                </Badge>
                                {selectedCourse?.id === course.id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShowRescheduleOptions(course);
                                    }}
                                    disabled={loadingAlternatives}
                                  >
                                    {loadingAlternatives ? 'Loading...' : (showRescheduleOptions ? 'Hide Dates' : 'Other Dates')}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Calendar View</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium min-w-[120px] text-center">
                  {format(currentDate, 'MMMM yyyy')}
                </span>
                <Button variant="outline" size="sm" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {selectedDate && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">
                    Selected: {format(selectedDate, 'PPPP')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDate(null)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}

            <div className="border rounded-lg overflow-hidden">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 bg-gray-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day) => {
                  const coursesOnDate = getCoursesForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const hasFilter = selectedDate !== null;
                  const matchesFilter = !hasFilter || isSelected;
                  const dayOfWeek = day.getDay();
                  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
                  const hasNoCourses = coursesOnDate.length === 0;
                  const today = startOfDay(new Date());
                  const isFutureDate = startOfDay(day) >= today;
                  
                  return (
                    <div
                      key={day.toString()}
                      className={`min-h-[100px] p-2 border-r border-b last:border-r-0 cursor-pointer transition-colors ${
                        !isCurrentMonth 
                          ? 'bg-gray-50 text-gray-400' 
                          : isSelected 
                            ? 'bg-blue-100 border-blue-300' 
                            : 'bg-white hover:bg-gray-50'
                      } ${hasFilter && !matchesFilter ? 'opacity-50' : ''}`}
                      onClick={() => handleDateClick(day)}
                    >
                      <div className={`text-sm font-medium mb-1 ${isSelected ? 'text-blue-700' : ''}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {coursesOnDate.map((course) => {
                          const courseStatus = getCourseStatus(course);
                          return (
                            <div
                              key={course.id}
                              className={`text-xs p-1 rounded transition-colors ${
                                !courseStatus.canRegister 
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                  : selectedCourse?.id === course.id
                                    ? 'bg-blue-600 text-white cursor-pointer'
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (courseStatus.canRegister) {
                                  onCourseSelect(course);
                                }
                              }}
                              title={`${course.course?.title} - ${courseStatus.badge} - ${getRemainingCapacity(course)}/${course.capacity} available`}
                            >
                              <div className="font-medium truncate">
                                {course.course?.title}
                              </div>
                              <div className="text-xs flex justify-between items-center">
                                <span>{getRemainingCapacity(course)}/{course.capacity} slots</span>
                                <span className={`px-1 text-xs rounded ${
                                  courseStatus.status === 'past' ? 'bg-gray-500 text-white' :
                                  courseStatus.status === 'closed' ? 'bg-red-500 text-white' :
                                  courseStatus.status === 'full' ? 'bg-red-500 text-white' :
                                  'bg-green-500 text-white'
                                }`}>
                                  {courseStatus.status === 'past' ? 'Past' :
                                   courseStatus.status === 'closed' ? 'Closed' :
                                   courseStatus.status === 'full' ? 'Full' : 'Open'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {isWeekday && hasNoCourses && isCurrentMonth && isFutureDate && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs py-1.5 px-2 h-auto mt-1 whitespace-normal leading-tight"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPrivateSessionDate(day);
                              setIsPrivateSessionDialogOpen(true);
                            }}
                          >
                            Book Private Session
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calendar Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Available for Registration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Registration Closed / Full</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded"></div>
                <span>Past Course</span>
              </div>
            </div>
          </div>

          {/* Course Details Panel for Calendar View */}
          {selectedDate && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4">
                Courses on {format(selectedDate, 'PPPP')}
              </h4>
              {getCoursesForDate(selectedDate).length === 0 ? (
                <p className="text-gray-500">No courses scheduled on this date.</p>
              ) : (
                <div className="grid gap-4">
                  {getCoursesForDate(selectedDate).map((course) => {
                    const courseStatus = getCourseStatus(course);
                    return (
                      <Card 
                        key={course.id}
                        className={`${!courseStatus.canRegister ? 'opacity-75' : 'hover:shadow-md cursor-pointer'}`}
                        onClick={() => courseStatus.canRegister && onCourseSelect(course)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-semibold">{course.course?.title}</h5>
                              <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                                <span>Time: {getTimeSlots(course)[0]}</span>
                                <span>Capacity: {getRemainingCapacity(course)}/{course.capacity}</span>
                                <span>Price: {getPriceDisplay(course)}</span>
                              </div>
                            </div>
                            <Badge variant={courseStatus.variant}>
                              {courseStatus.badge}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <PrivateSessionDialog
        open={isPrivateSessionDialogOpen}
        onOpenChange={setIsPrivateSessionDialogOpen}
        selectedDate={selectedPrivateSessionDate}
      />
    </div>
  );
};

export default CourseCalendarView;