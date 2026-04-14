import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Download, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { generateUniqueCourseUrl, updateCourseUrl } from '@/services/courseUrlService';
import * as XLSX from 'xlsx';

interface BulkCourseImportData {
  title: string;
  description: string;
  price: number;
  hrdc_program_code: string;
  category: string;
}

interface ProcessedCourse {
  title: string;
  description: string | null;
  price: number | null;
  hrdc_program_code: string | null;
  category: string | null;
}

const BulkCourseImport = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<BulkCourseImportData[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Bulk create mutation
  const bulkCreateMutation = useMutation({
    mutationFn: async (courses: ProcessedCourse[]) => {
      const createdCourses = [];
      
      for (const courseData of courses) {
        // Create the course
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .insert(courseData)
          .select('*')
          .single();
        
        if (courseError) throw courseError;

        // Generate unique URL for the course
        const registrationUrl = await generateUniqueCourseUrl(course.title);
        
        // Update the course with the URL
        await updateCourseUrl(course.id, registrationUrl);
        
        createdCourses.push({ ...course, registration_url: registrationUrl });
      }
      
      return createdCourses;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: 'Courses imported',
        description: `Successfully imported ${data.length} courses with URLs generated.`,
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

  const downloadTemplate = () => {
    const templateData = [
      {
        'Course Title': 'CPR + AED Course - English [T]',
        'Description': 'Learn life-saving CPR and AED techniques in English. Suitable for healthcare professionals and general public.',
        'Price': 250.00,
        'HRDC Program Code': 'HRDC001',
        'Category': 'Emergency Medicine'
      },
      {
        'Course Title': 'Basic Life Support (BLS)',
        'Description': 'Comprehensive basic life support training following international guidelines.',
        'Price': 300.00,
        'HRDC Program Code': 'HRDC002',
        'Category': 'Life Support'
      },
      {
        'Course Title': 'First Aid Certification',
        'Description': 'Complete first aid training course with certification upon completion.',
        'Price': 180.00,
        'HRDC Program Code': 'HRDC003',
        'Category': 'First Aid'
      },
      {
        'Course Title': 'Advanced Cardiac Life Support',
        'Description': 'Advanced training for medical professionals in cardiac emergency response.',
        'Price': 450.00,
        'HRDC Program Code': 'HRDC004',
        'Category': 'Advanced Life Support'
      },
      {
        'Course Title': 'Workplace Safety Training',
        'Description': 'Essential workplace safety protocols and emergency procedures.',
        'Price': 120.00,
        'HRDC Program Code': 'HRDC005',
        'Category': 'Safety Training'
      }
    ];

    // Create instructions sheet
    const instructionsData = [
      { 'Field': 'Course Title', 'Required': 'YES', 'Format': 'Text (max 255 characters)', 'Example': 'CPR + AED Course - English [T]' },
      { 'Field': 'Description', 'Required': 'NO', 'Format': 'Text (any length)', 'Example': 'Learn life-saving CPR and AED techniques...' },
      { 'Field': 'Price', 'Required': 'NO', 'Format': 'Number (decimal allowed)', 'Example': '250.00' },
      { 'Field': 'HRDC Program Code', 'Required': 'NO', 'Format': 'Text (alphanumeric)', 'Example': 'HRDC001' },
      { 'Field': 'Category', 'Required': 'NO', 'Format': 'Text', 'Example': 'Emergency Medicine' },
      { 'Field': '', 'Required': '', 'Format': '', 'Example': '' },
      { 'Field': 'IMPORTANT NOTES:', 'Required': '', 'Format': '', 'Example': '' },
      { 'Field': '• Course titles must be unique', 'Required': '', 'Format': '', 'Example': '' },
      { 'Field': '• Price cannot be negative', 'Required': '', 'Format': '', 'Example': '' },
      { 'Field': '• Registration URLs are auto-generated', 'Required': '', 'Format': '', 'Example': '' },
      { 'Field': '• Empty fields will be saved as null', 'Required': '', 'Format': '', 'Example': '' },
      { 'Field': '• Maximum 100 courses per import', 'Required': '', 'Format': '', 'Example': '' }
    ];

    const workbook = XLSX.utils.book_new();
    
    // Add template sheet
    const templateSheet = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, templateSheet, 'Course Template');
    
    // Add instructions sheet
    const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
    
    // Set column widths for template sheet
    const templateColWidths = [
      { wch: 40 }, // Course Title
      { wch: 60 }, // Description
      { wch: 12 }, // Price
      { wch: 15 }, // HRDC Program Code
      { wch: 20 }  // Category
    ];
    templateSheet['!cols'] = templateColWidths;
    
    // Set column widths for instructions sheet
    const instructionsColWidths = [
      { wch: 30 }, // Field
      { wch: 10 }, // Required
      { wch: 30 }, // Format
      { wch: 40 }  // Example
    ];
    instructionsSheet['!cols'] = instructionsColWidths;

    XLSX.writeFile(workbook, 'courses_template.xlsx');
    
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

        const processedData: BulkCourseImportData[] = jsonData.map((row: any) => ({
          title: row['Course Title'] || '',
          description: row['Description'] || '',
          price: parseFloat(row['Price']) || 0,
          hrdc_program_code: row['HRDC Program Code'] || '',
          category: row['Category'] || ''
        }));

        setPreviewData(processedData);
        validateData(processedData);
      } catch (error) {
        toast({
          title: 'File parsing error',
          description: 'Unable to parse the file. Please check the format and try again.',
          variant: 'destructive',
        });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const validateData = async (data: BulkCourseImportData[]) => {
    const errors: string[] = [];

    // Check import limit
    if (data.length > 100) {
      errors.push(`Too many courses: ${data.length}. Maximum 100 courses per import.`);
      setValidationErrors(errors);
      return;
    }

    // Get existing course titles to check for duplicates
    const { data: existingCourses } = await supabase
      .from('courses')
      .select('title');

    const existingTitles = new Set(existingCourses?.map(c => c.title.toLowerCase()) || []);
    const importTitles = new Set<string>();

    data.forEach((row, index) => {
      const rowNum = index + 1;
      
      if (!row.title.trim()) {
        errors.push(`Row ${rowNum}: Course Title is required`);
      } else {
        // Check for duplicates with existing courses
        if (existingTitles.has(row.title.toLowerCase())) {
          errors.push(`Row ${rowNum}: Course "${row.title}" already exists`);
        }
        
        // Check for duplicates within the import file
        if (importTitles.has(row.title.toLowerCase())) {
          errors.push(`Row ${rowNum}: Duplicate course title "${row.title}" in import file`);
        } else {
          importTitles.add(row.title.toLowerCase());
        }
      }
      
      if (row.price && row.price < 0) {
        errors.push(`Row ${rowNum}: Price cannot be negative`);
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

    const processedCourses: ProcessedCourse[] = previewData.map(row => ({
      title: row.title.trim(),
      description: row.description.trim() || null,
      price: row.price || null,
      hrdc_program_code: row.hrdc_program_code.trim() || null,
      category: row.category.trim() || null
    }));

    bulkCreateMutation.mutate(processedCourses);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Import Courses
          </CardTitle>
          <CardDescription>
            Upload an Excel/CSV file to create multiple courses at once. Registration URLs will be automatically generated.
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
              accept=".xlsx,.xls,.csv"
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
              <h3 className="text-lg font-medium">Preview ({previewData.length} courses)</h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3 text-left">Course Title</th>
                      <th className="p-3 text-left">Description</th>
                      <th className="p-3 text-left">Price</th>
                      <th className="p-3 text-left">HRDC Code</th>
                      <th className="p-3 text-left">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3 font-medium">{row.title}</td>
                        <td className="p-3 max-w-md truncate">{row.description || '—'}</td>
                        <td className="p-3">
                          {row.price ? `AED ${row.price.toFixed(2)}` : '—'}
                        </td>
                        <td className="p-3">{row.hrdc_program_code || '—'}</td>
                        <td className="p-3">{row.category || '—'}</td>
                      </tr>
                    ))}
                    {previewData.length > 10 && (
                      <tr>
                        <td colSpan={5} className="p-3 text-center text-muted-foreground">
                          ... and {previewData.length - 10} more courses
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
                  {bulkCreateMutation.isPending ? 'Importing...' : `Import ${previewData.length} Courses`}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkCourseImport;