import React from 'react';
import { format } from 'date-fns';
import { Clock, Calendar } from 'lucide-react';
import { CourseRunSchedule } from '@/types/course';

interface DailyScheduleDisplayProps {
  schedules: CourseRunSchedule[];
  compact?: boolean;
}

const DailyScheduleDisplay: React.FC<DailyScheduleDisplayProps> = ({ 
  schedules, 
  compact = false 
}) => {
  if (!schedules || schedules.length === 0) {
    return null;
  }

  // Sort schedules by date
  const sortedSchedules = [...schedules].sort((a, b) => 
    new Date(a.schedule_date).getTime() - new Date(b.schedule_date).getTime()
  );

  if (compact && sortedSchedules.length > 0) {
    // Show first and last date with date range
    const firstSchedule = sortedSchedules[0];
    const lastSchedule = sortedSchedules[sortedSchedules.length - 1];
    
    return (
      <div className="text-sm text-muted-foreground">
        <div className="flex items-center gap-1 mb-1">
          <Calendar className="h-3 w-3" />
          <span>
            {format(new Date(firstSchedule.schedule_date), 'MMM dd')}
            {sortedSchedules.length > 1 && ` - ${format(new Date(lastSchedule.schedule_date), 'MMM dd, yyyy')}`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>
            Various times (click to see details)
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedSchedules.map((schedule, index) => (
        <div 
          key={schedule.id || index} 
          className="flex items-center gap-3 p-2 rounded-md bg-muted/50"
        >
          <div className="flex items-center gap-1 text-sm font-medium min-w-[100px]">
            <Calendar className="h-4 w-4" />
            {format(new Date(schedule.schedule_date), 'MMM dd, yyyy')}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {schedule.start_time} - {schedule.end_time}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DailyScheduleDisplay;
