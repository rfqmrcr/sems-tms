
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import FormFieldWrapper from './FormFieldWrapper';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerFieldProps {
  name: string;
  label: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

// Generate array of years
const generateYearRange = (start: number, end: number) => {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

// Month names array
const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  name,
  label,
  required = false,
  minDate = new Date('1900-01-01'),
  maxDate = new Date(),
}) => {
  const { control, formState: { errors } } = useFormContext();
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
  
  // Current year for default value
  const currentYear = new Date().getFullYear();
  // Generate year range from minDate to maxDate 
  const yearRange = generateYearRange(
    minDate.getFullYear(), 
    maxDate.getFullYear()
  );

  // Access nested errors
  const hasError = (fieldName: string): boolean => {
    const path = fieldName.split('.');
    let error: any = errors;
    for (const key of path) {
      if (error && typeof error === 'object' && key in error) {
        error = error[key];
      } else {
        return false;
      }
    }
    return !!error;
  };

  // Handle year and month changes
  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year));
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(parseInt(month));
  };

  return (
    <FormFieldWrapper name={name} label={label} required={required}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          // When a date is selected, update the month/year selectors
          React.useEffect(() => {
            if (field.value) {
              setSelectedMonth(field.value.getMonth());
              setSelectedYear(field.value.getFullYear());
            }
          }, [field.value]);

          return (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !field.value && "text-muted-foreground",
                    hasError(name) && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(field.value, 'PPP') : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <Select 
                      value={selectedMonth.toString()} 
                      onValueChange={handleMonthChange}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={selectedYear.toString()} 
                      onValueChange={handleYearChange}
                    >
                      <SelectTrigger className="w-[100px] h-8">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {yearRange.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                    // Close the popover after selection
                    setCalendarOpen(false);
                  }}
                  disabled={(date) => date > maxDate || date < minDate}
                  initialFocus
                  month={new Date(selectedYear, selectedMonth)}
                  onMonthChange={(date) => {
                    setSelectedMonth(date.getMonth());
                    setSelectedYear(date.getFullYear());
                  }}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          );
        }}
      />
    </FormFieldWrapper>
  );
};

export default DatePickerField;
