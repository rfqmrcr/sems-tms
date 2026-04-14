import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { CourseRunSchedule } from '@/types/course';

interface DailyScheduleEditorProps {
  schedules: Partial<CourseRunSchedule>[];
  onSchedulesChange: (schedules: Partial<CourseRunSchedule>[]) => void;
  startDate?: string;
  endDate?: string;
}

const DailyScheduleEditor: React.FC<DailyScheduleEditorProps> = ({
  schedules,
  onSchedulesChange,
  startDate,
  endDate,
}) => {
  const addSchedule = () => {
    const newSchedule: Partial<CourseRunSchedule> = {
      schedule_date: startDate || '',
      start_time: '09:00',
      end_time: '18:00',
    };
    onSchedulesChange([...schedules, newSchedule]);
  };

  const removeSchedule = (index: number) => {
    onSchedulesChange(schedules.filter((_, i) => i !== index));
  };

  const updateSchedule = (index: number, field: keyof CourseRunSchedule, value: string) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value };
    onSchedulesChange(updated);
  };

  const generateDefaultSchedules = () => {
    if (!startDate || !endDate) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const defaultSchedules: Partial<CourseRunSchedule>[] = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      defaultSchedules.push({
        schedule_date: new Date(d).toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '18:00',
      });
    }
    
    onSchedulesChange(defaultSchedules);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Daily Schedule</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateDefaultSchedules}
            disabled={!startDate || !endDate}
          >
            Auto-Generate from Date Range
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSchedule}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Day
          </Button>
        </div>
      </div>

      {schedules.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No daily schedules added. Click "Auto-Generate" to create schedules for all days, or "Add Day" to add individual days.
        </p>
      )}

      <div className="space-y-3">
        {schedules.map((schedule, index) => (
          <div key={index} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end p-3 border rounded-lg">
            <div>
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                value={schedule.schedule_date || ''}
                onChange={(e) => updateSchedule(index, 'schedule_date', e.target.value)}
                min={startDate}
                max={endDate}
              />
            </div>
            <div>
              <Label className="text-xs">Start Time</Label>
              <Input
                type="time"
                value={schedule.start_time || '09:00'}
                onChange={(e) => updateSchedule(index, 'start_time', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">End Time</Label>
              <Input
                type="time"
                value={schedule.end_time || '18:00'}
                onChange={(e) => updateSchedule(index, 'end_time', e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeSchedule(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyScheduleEditor;
