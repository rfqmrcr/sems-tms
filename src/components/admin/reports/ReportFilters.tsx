import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateRangeFields from '@/components/admin/form-fields/DateRangeFields';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Form } from '@/components/ui/form';
import { RefreshCw, Download } from 'lucide-react';

export interface DateRange {
  start_date: string;
  end_date: string;
}

interface ReportFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  reportType: string;
  onReportTypeChange: (type: string) => void;
  onRefresh: () => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  reportType,
  onReportTypeChange,
  onRefresh
}) => {
  const form = useForm({
    defaultValues: dateRange
  });

  // Update form when dateRange prop changes
  useEffect(() => {
    form.reset(dateRange);
  }, [dateRange, form]);

  const handleDateRangeSubmit = (data: DateRange) => {
    onDateRangeChange(data);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting report...');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Report Type</label>
            <Select value={reportType} onValueChange={onReportTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="detailed">Detailed Analysis</SelectItem>
                <SelectItem value="financial">Financial Summary</SelectItem>
                <SelectItem value="course-specific">Course Specific</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleDateRangeSubmit)} className="contents">
              <DateRangeFields control={form.control} />
              <div className="flex items-end space-x-2">
                <Button type="submit" variant="default">
                  Apply Filters
                </Button>
                <Button type="button" variant="outline" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button type="button" variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportFilters;