import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus, Settings2, Save, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Field {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  table: string;
}

interface CustomReportBuilderProps {
  onReportGenerated: (config: ReportConfig) => void;
}

export interface ReportConfig {
  name: string;
  fields: Field[];
  filters: ReportFilter[];
  groupBy: string[];
  sortBy: { field: string; direction: 'asc' | 'desc' }[];
  chartType: 'line' | 'bar' | 'pie' | 'table';
}

interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: any;
}

const availableFields: Field[] = [
  { id: 'registration_created', name: 'Registration Date', type: 'date', table: 'registrations' },
  { id: 'contact_person', name: 'Contact Person', type: 'text', table: 'registrations' },
  { id: 'payment_amount', name: 'Payment Amount', type: 'number', table: 'registrations' },
  { id: 'payment_status', name: 'Payment Status', type: 'text', table: 'registrations' },
  { id: 'course_title', name: 'Course Title', type: 'text', table: 'courses' },
  { id: 'course_category', name: 'Course Category', type: 'text', table: 'courses' },
  { id: 'participant_count', name: 'Participant Count', type: 'number', table: 'trainees' },
  { id: 'organization_name', name: 'Organization', type: 'text', table: 'organizations' },
  { id: 'trainer_name', name: 'Trainer', type: 'text', table: 'trainers' },
  { id: 'course_start_date', name: 'Course Start Date', type: 'date', table: 'course_runs' },
];

const CustomReportBuilder: React.FC<CustomReportBuilderProps> = ({ onReportGenerated }) => {
  const [reportName, setReportName] = useState('');
  const [selectedFields, setSelectedFields] = useState<Field[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie' | 'table'>('table');

  const handleFieldToggle = (field: Field, checked: boolean) => {
    if (checked) {
      setSelectedFields([...selectedFields, field]);
    } else {
      setSelectedFields(selectedFields.filter(f => f.id !== field.id));
    }
  };

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: 'equals', value: '' }]);
  };

  const updateFilter = (index: number, updates: Partial<ReportFilter>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    setFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const generateReport = () => {
    if (!reportName || selectedFields.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please provide a report name and select at least one field.",
        variant: "destructive"
      });
      return;
    }

    const config: ReportConfig = {
      name: reportName,
      fields: selectedFields,
      filters,
      groupBy,
      sortBy: [],
      chartType
    };

    onReportGenerated(config);
    toast({
      title: "Report Generated",
      description: `Custom report "${reportName}" has been generated successfully.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Custom Report Builder
        </CardTitle>
        <CardDescription>
          Build custom reports by selecting fields, filters, and visualization options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Name */}
        <div>
          <Label htmlFor="reportName">Report Name</Label>
          <input
            id="reportName"
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="w-full mt-1 p-2 border rounded-md"
            placeholder="Enter report name..."
          />
        </div>

        <Separator />

        {/* Field Selection */}
        <div>
          <Label className="text-base font-semibold">Select Fields</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
            {availableFields.map((field) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Checkbox
                  id={field.id}
                  checked={selectedFields.some(f => f.id === field.id)}
                  onCheckedChange={(checked) => handleFieldToggle(field, checked as boolean)}
                />
                <Label htmlFor={field.id} className="text-sm">
                  {field.name}
                  <Badge variant="outline" className="ml-1 text-xs">
                    {field.type}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Filters */}
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Filters</Label>
            <Button variant="outline" size="sm" onClick={addFilter}>
              <Plus className="h-4 w-4 mr-2" />
              Add Filter
            </Button>
          </div>
          
          {filters.map((filter, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 mt-3">
              <Select value={filter.field} onValueChange={(value) => updateFilter(index, { field: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filter.operator} onValueChange={(value) => updateFilter(index, { operator: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="greater_than">Greater Than</SelectItem>
                  <SelectItem value="less_than">Less Than</SelectItem>
                  <SelectItem value="between">Between</SelectItem>
                </SelectContent>
              </Select>
              
              <input
                type="text"
                value={filter.value}
                onChange={(e) => updateFilter(index, { value: e.target.value })}
                className="p-2 border rounded-md"
                placeholder="Value"
              />
              
              <Button variant="outline" size="sm" onClick={() => removeFilter(index)}>
                Remove
              </Button>
            </div>
          ))}
        </div>

        <Separator />

        {/* Chart Type */}
        <div>
          <Label className="text-base font-semibold">Visualization Type</Label>
          <Select value={chartType} onValueChange={(value) => setChartType(value as any)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="table">Data Table</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={generateReport} className="flex-1">
            <Play className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomReportBuilder;