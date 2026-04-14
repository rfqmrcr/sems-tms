import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Download, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { generateUniqueUrl, updateCourseRunUrl } from '@/services/courseUrlService';
import * as XLSX from 'xlsx';

interface BulkImportData {
  title: string;
  course_title: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  price: number;
  visibility: string;
  trainer_name: string;
  registration_close_days: number;
}

interface ProcessedCourseRun {
  title: string;
  course_id: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  price: number;
  visibility: string;
  trainer_id: string | null;
  registration_close_days: number;
}

const BulkCourseRunImport = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<BulkImportData[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch courses for mapping
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .order('title');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch trainers for mapping
  const { data: trainers = [] } = useQuery({
    queryKey: ['trainers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainers')
        .select('id, full_name')
        .eq('is_active', true)
        .order('full_name');
      
      if (error) throw error;
      return data;
    }
  });

  // Bulk create mutation
  const bulkCreateMutation = useMutation({
    mutationFn: async (courseRuns: ProcessedCourseRun[]) => {
      const createdCourseRuns = [];
      
      for (const courseRunData of courseRuns) {
        // Create the course run
        const { data: courseRun, error: courseRunError } = await supabase
          .from('course_runs')
          .insert(courseRunData)
          .select('*')
          .single();
        
        if (courseRunError) throw courseRunError;

        // Get course title for URL generation
        const course = courses.find(c => c.id === courseRunData.course_id);
        if (!course) throw new Error('Course not found');

        // Generate unique URL for the course run
        const registrationUrl = await generateUniqueUrl(course.title, courseRunData.start_date);
        
        // Update the course run with the URL
        await updateCourseRunUrl(courseRun.id, registrationUrl);
        
        createdCourseRuns.push({ ...courseRun, registration_url: registrationUrl });
      }
      
      return createdCourseRuns;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['course-runs'] });
      toast({
        title: 'Course runs imported',
        description: `Successfully imported ${data.length} course runs with URLs generated.`,
      });
      setPreviewData([]);
      setValidationErrors([]);
    },
    onError: (error: any) => {
      toast({
        title: 'Import failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Convert Excel date serial number to YYYY-MM-DD format
  const convertExcelDate = (value: any): string => {
    console.log('Converting date value:', value, 'Type:', typeof value);
    
    if (!value) return '';
    
    // If it's already a string in proper format, return it
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.log('Already in YYYY-MM-DD format:', value);
      return value;
    }
    
    // If it's a number (Excel serial date)
    if (typeof value === 'number') {
      console.log('Processing Excel serial date:', value);
      // Excel serial date starts from 1900-01-01, but JavaScript Date starts from 1970-01-01
      // Excel serial date 1 = 1900-01-01, but Excel treats 1900 as a leap year (it's not)
      // So we need to subtract 1 day from the calculation
      const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
      const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
      const result = date.toISOString().split('T')[0];
      console.log('Excel date result:', result);
      return result;
    }
    
    // Try to parse as date if it's another format
    try {
      console.log('Trying to parse as regular date:', value);
      
      // Handle common date formats more explicitly
      let dateStr = String(value).trim();
      
      // If it's in M/D format (like "3/11"), assume current year and add it
      if (dateStr.match(/^\d{1,2}\/\d{1,2}$/)) {
        const currentYear = new Date().getFullYear();
        dateStr = `${dateStr}/${currentYear}`;
        console.log('Added current year to date:', dateStr);
      }
      
      // Parse the date string and create date in local timezone
      const parsedDate = new Date(dateStr);
      
      if (!isNaN(parsedDate.getTime())) {
        console.log('Parsed date object:', parsedDate);
        
        // Use UTC methods to avoid timezone conversion issues
        // This ensures we get the exact date that was intended
        const year = parsedDate.getUTCFullYear();
        const month = String(parsedDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getUTCDate()).padStart(2, '0');
        
        // But for MM/DD/YYYY format, we want to use local date components
        if (dateStr.includes('/')) {
          const localYear = parsedDate.getFullYear();
          const localMonth = String(parsedDate.getMonth() + 1).padStart(2, '0');
          const localDay = String(parsedDate.getDate()).padStart(2, '0');
          const result = `${localYear}-${localMonth}-${localDay}`;
          console.log('Final date result (local):', result);
          return result;
        }
        
        const result = `${year}-${month}-${day}`;
        console.log('Final date result (UTC):', result);
        return result;
      }
    } catch (e) {
      console.log('Date parsing error:', e);
      // Fall through to return empty string
    }
    
    console.log('Could not parse date, returning empty string');
    return '';
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Course Run Title': 'CPR Course - January 2025',
        'Course Title': 'CPR + AED Course - English [T]',
        'Start Date': '2025-01-15',
        'End Date': '2025-01-16',
        'Start Time': '09:00',
        'End Time': '18:00',
        'Location': 'Training Center A, Level 2',
        'Capacity': 20,
        'Price': 250.00,
        'Visibility': 'public',
        'Trainer Name': 'Dr. John Smith',
        'Registration Close Days': 7
      },
      {
        'Course Run Title': 'BCLS Course - February 2025 (Half Day)',
        'Course Title': 'BCLS',
        'Start Date': '2025-02-10',
        'End Date': '2025-02-10',
        'Start Time': '09:00',
        'End Time': '13:00',
        'Location': 'Training Center B, Room 301',
        'Capacity': 15,
        'Price': 150.00,
        'Visibility': 'private',
        'Trainer Name': 'Dr. Sarah Johnson',
        'Registration Close Days': 5
      }
    ];

    // Create instructions sheet
    const instructionsData = [
      { 'Field': 'Course Run Title', 'Required': 'YES', 'Format': 'Text', 'Example': 'CPR Course - January 2025' },
      { 'Field': 'Course Title', 'Required': 'YES', 'Format': 'Text (must match existing course)', 'Example': 'CPR + AED Course - English [T]' },
      { 'Field': 'Start Date', 'Required': 'YES', 'Format': 'YYYY-MM-DD', 'Example': '2025-01-15' },
      { 'Field': 'End Date', 'Required': 'YES', 'Format': 'YYYY-MM-DD', 'Example': '2025-01-16' },
      { 'Field': 'Start Time', 'Required': 'YES', 'Format': 'HH:MM (24-hour)', 'Example': '09:00' },
      { 'Field': 'End Time', 'Required': 'YES', 'Format': 'HH:MM (24-hour)', 'Example': '18:00' },
      { 'Field': 'Location', 'Required': 'YES', 'Format': 'Text', 'Example': 'Training Center A, Level 2' },
      { 'Field': 'Capacity', 'Required': 'YES', 'Format': 'Number (positive)', 'Example': '20' },
      { 'Field': 'Price', 'Required': 'YES', 'Format': 'Number (decimal allowed)', 'Example': '250.00' },
      { 'Field': 'Visibility', 'Required': 'YES', 'Format': 'public or private', 'Example': 'public' },
      { 'Field': 'Trainer Name', 'Required': 'NO', 'Format': 'Text (must match existing trainer)', 'Example': 'Dr. John Smith' },
      { 'Field': 'Registration Close Days', 'Required': 'YES', 'Format': 'Number (0-30)', 'Example': '7' },
      { 'Field': '', 'Required': '', 'Format': '', 'Example': '' },
      { 'Field': 'IMPORTANT NOTES:', 'Required': '', 'Format': '', 'Example': '' },
      { 'Field': '• Course Title must match existing course', 'Required': '', 'Format': '', 'Example': '' },
      { 'Field': '• Trainer Name must match existing active trainer', 'Required': '', 'Format': '', 'Example': '' },
      { 'Field': '• Start Date must be before End Date', 'Required': '', 'Format': '', 'Example': '' },
      { 'Field': '• Capacity and Price must be positive numbers', 'Required': '', 'Format': '', 'Example': '' },
      { 'Field': '• Registration Close Days: days before start when registration closes', 'Required': '', 'Format': '', 'Example': '' },
      { 'Field': '• Registration URLs are auto-generated', 'Required': '', 'Format': '', 'Example': '' },
      { 'Field': '• Maximum 50 course runs per import', 'Required': '', 'Format': '', 'Example': '' }
    ];

    const workbook = XLSX.utils.book_new();
    
    // Add template sheet
    const templateSheet = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, templateSheet, 'Course Run Template');
    
    // Add instructions sheet
    const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
    
    // Set column widths for template sheet
    const templateColWidths = [
      { wch: 30 }, // Course Run Title
      { wch: 30 }, // Course Title
      { wch: 12 }, // Start Date
      { wch: 12 }, // End Date
      { wch: 10 }, // Start Time
      { wch: 10 }, // End Time
      { wch: 25 }, // Location
      { wch: 10 }, // Capacity
      { wch: 12 }, // Price
      { wch: 12 }, // Visibility
      { wch: 20 }, // Trainer Name
      { wch: 15 }  // Registration Close Days
    ];
    templateSheet['!cols'] = templateColWidths;
    
    // Set column widths for instructions sheet
    const instructionsColWidths = [
      { wch: 20 }, // Field
      { wch: 10 }, // Required
      { wch: 30 }, // Format
      { wch: 30 }  // Example
    ];
    instructionsSheet['!cols'] = instructionsColWidths;

    XLSX.writeFile(workbook, 'course_runs_template.xlsx');
    
    toast({
      title: 'Template downloaded',
      description: 'Excel template has been downloaded successfully.',
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const processedData: BulkImportData[] = jsonData.map((row: any) => ({
          title: row['Course Run Title'] || '',
          course_title: row['Course Title'] || '',
          start_date: convertExcelDate(row['Start Date']) || '',
          end_date: convertExcelDate(row['End Date']) || '',
          start_time: row['Start Time'] || '09:00',
          end_time: row['End Time'] || '18:00',
          location: row['Location'] || '',
          capacity: parseInt(row['Capacity']) || 0,
          price: parseFloat(row['Price']) || 0,
          visibility: row['Visibility'] || 'public',
          trainer_name: row['Trainer Name'] || '',
          registration_close_days: parseInt(row['Registration Close Days']) || 7
        }));

        setPreviewData(processedData);
        validateData(processedData);
      } catch (error) {
        toast({
          title: 'File parsing error',
          description: 'Unable to parse the Excel file. Please check the format.',
          variant: 'destructive',
        });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const validateData = (data: BulkImportData[]) => {
    const errors: string[] = [];

    // Check import limit
    if (data.length > 50) {
      errors.push(`Too many course runs: ${data.length}. Maximum 50 course runs per import.`);
      setValidationErrors(errors);
      return;
    }

    data.forEach((row, index) => {
      const rowNum = index + 1;
      
      if (!row.title) errors.push(`Row ${rowNum}: Course Run Title is required`);
      if (!row.course_title) errors.push(`Row ${rowNum}: Course Title is required`);
      if (!row.start_date) errors.push(`Row ${rowNum}: Start Date is required`);
      if (!row.end_date) errors.push(`Row ${rowNum}: End Date is required`);
      if (!row.location) errors.push(`Row ${rowNum}: Location is required`);
      if (!row.capacity || row.capacity <= 0) errors.push(`Row ${rowNum}: Valid capacity is required`);
      if (!row.price || row.price <= 0) errors.push(`Row ${rowNum}: Valid price is required`);
      if (row.registration_close_days < 0 || row.registration_close_days > 30) {
        errors.push(`Row ${rowNum}: Registration Close Days must be between 0 and 30`);
      }
      if (!row.visibility || !['public', 'private'].includes(row.visibility.toLowerCase())) {
        errors.push(`Row ${rowNum}: Visibility must be 'public' or 'private'`);
      }
      
      // Validate date format
      if (row.start_date && isNaN(Date.parse(row.start_date))) {
        errors.push(`Row ${rowNum}: Start Date format is invalid (use YYYY-MM-DD)`);
      }
      if (row.end_date && isNaN(Date.parse(row.end_date))) {
        errors.push(`Row ${rowNum}: End Date format is invalid (use YYYY-MM-DD)`);
      }

      // Validate date logic
      if (row.start_date && row.end_date && new Date(row.start_date) > new Date(row.end_date)) {
        errors.push(`Row ${rowNum}: Start Date must be before or equal to End Date`);
      }

      // Check if course exists
      if (row.course_title && !courses.find(c => c.title === row.course_title)) {
        errors.push(`Row ${rowNum}: Course "${row.course_title}" not found`);
      }

      // Check if trainer exists (if provided)
      if (row.trainer_name && !trainers.find(t => t.full_name === row.trainer_name)) {
        errors.push(`Row ${rowNum}: Trainer "${row.trainer_name}" not found or inactive`);
      }
    });

    setValidationErrors(errors);
  };

  const handleImport = () => {
    if (validationErrors.length > 0) {
      toast({
        title: 'Validation errors',
        description: 'Please fix all validation errors before importing.',
        variant: 'destructive',
      });
      return;
    }

    const processedCourseRuns: ProcessedCourseRun[] = previewData.map(row => {
      const course = courses.find(c => c.title === row.course_title);
      const trainer = row.trainer_name ? trainers.find(t => t.full_name === row.trainer_name) : null;
      
      return {
        title: row.title,
        course_id: course!.id,
        start_date: row.start_date,
        end_date: row.end_date,
        start_time: row.start_time,
        end_time: row.end_time,
        location: row.location,
        capacity: row.capacity,
        price: row.price,
        visibility: row.visibility.toLowerCase(),
        trainer_id: trainer?.id || null,
        registration_close_days: row.registration_close_days
      };
    });

    bulkCreateMutation.mutate(processedCourseRuns);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Import Course Runs
          </CardTitle>
          <CardDescription>
            Upload an Excel file to create multiple course runs at once. Download the template first to see the required format. Registration URLs will be automatically generated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Upload File'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Validation Errors:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.slice(0, 5).map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                    {validationErrors.length > 5 && (
                      <li className="text-sm">... and {validationErrors.length - 5} more errors</li>
                    )}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {previewData.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preview ({previewData.length} rows)</h3>
              <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Title</th>
                        <th className="p-2 text-left">Course</th>
                        <th className="p-2 text-left">Start Date</th>
                        <th className="p-2 text-left">End Date</th>
                        <th className="p-2 text-left">Time</th>
                        <th className="p-2 text-left">Location</th>
                        <th className="p-2 text-left">Capacity</th>
                        <th className="p-2 text-left">Price</th>
                        <th className="p-2 text-left">Visibility</th>
                        <th className="p-2 text-left">Trainer</th>
                        <th className="p-2 text-left">Close Days</th>
                      </tr>
                    </thead>
                  <tbody>
                      {previewData.slice(0, 10).map((row, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{row.title}</td>
                          <td className="p-2">{row.course_title}</td>
                          <td className="p-2">{row.start_date}</td>
                          <td className="p-2">{row.end_date}</td>
                          <td className="p-2">{row.start_time} - {row.end_time}</td>
                          <td className="p-2">{row.location}</td>
                          <td className="p-2">{row.capacity}</td>
                          <td className="p-2">AED {row.price.toFixed(2)}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              row.visibility === 'public' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {row.visibility}
                            </span>
                          </td>
                          <td className="p-2">{row.trainer_name || '—'}</td>
                          <td className="p-2">{row.registration_close_days}</td>
                        </tr>
                    ))}
                    {previewData.length > 10 && (
                      <tr>
                        <td colSpan={11} className="p-2 text-center text-muted-foreground">
                          ... and {previewData.length - 10} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleImport}
                  disabled={validationErrors.length > 0 || bulkCreateMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
          {bulkCreateMutation.isPending ? 'Importing...' : `Import ${previewData.length} Course Runs`}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkCourseRunImport;