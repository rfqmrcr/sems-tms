import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as XLSX from 'xlsx';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { InputField } from '@/components/form/InputField';
import { SelectField } from '@/components/form/SelectField';
import { createRegistration, CourseRun } from '@/services/courseService';
import { fetchCourseRunsData } from '@/services/courseDataService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Upload, Download } from 'lucide-react';

interface RegistrationCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const schema = z.object({
  // Organization details
  organizationName: z.string().min(1, 'Organization name is required'),
  organizationAddress: z.string().optional(),
  organizationContactPerson: z.string().min(1, 'Contact person is required'),
  organizationContactEmail: z.string().email('Invalid email'),
  organizationContactNumber: z.string().optional(),
  
  // Course selection
  courseRunId: z.string().min(1, 'Course selection is required'),
  
  // Payment details
  paymentAmount: z.number().min(0, 'Payment amount must be positive').optional(),
});

type FormValues = z.infer<typeof schema>;

const RegistrationCreateDialog: React.FC<RegistrationCreateDialogProps> = ({
  open,
  onOpenChange,
  onSave,
}) => {
  const [courses, setCourses] = useState<CourseRun[]>([]);
  const [trainees, setTrainees] = useState<any[]>([]);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      organizationName: '',
      organizationAddress: '',
      organizationContactPerson: '',
      organizationContactEmail: '',
      organizationContactNumber: '',
      courseRunId: '',
      paymentAmount: 0,
    },
  });

  const { handleSubmit, formState: { isSubmitting }, watch, setValue, reset } = methods;
  const selectedCourseRunId = watch('courseRunId');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courseData = await fetchCourseRunsData();
        setCourses(courseData);
      } catch (error) {
        console.error('Failed to load courses:', error);
        toast({
          title: "Error",
          description: "Failed to load courses.",
          variant: "destructive"
        });
      }
    };

    if (open) {
      loadCourses();
    }
  }, [open]);

  // Calculate payment amount when course or trainees change
  useEffect(() => {
    if (selectedCourseRunId && trainees.length > 0) {
      const selectedCourse = courses.find(c => c.id === selectedCourseRunId);
      if (selectedCourse?.price) {
        setValue('paymentAmount', selectedCourse.price * trainees.length);
      }
    }
  }, [selectedCourseRunId, trainees.length, courses, setValue]);

  const downloadTemplate = () => {
    // Create Excel template
    const templateData = [
      {
        full_name: 'John Doe',
        nric: '123456-78-9012',
        dob: '1990-01-01',
        gender: 'male',
        contact_number: '+60123456789',
        email: 'john@example.com'
      },
      {
        full_name: 'Jane Smith',
        nric: '234567-89-0123',
        dob: '1992-05-15',
        gender: 'female',
        contact_number: '+60987654321',
        email: 'jane@example.com'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trainees');
    
    // Auto-size columns
    const colWidths = [
      { wch: 20 }, // full_name
      { wch: 15 }, // nric
      { wch: 12 }, // dob
      { wch: 10 }, // gender
      { wch: 15 }, // contact_number
      { wch: 25 }  // email
    ];
    worksheet['!cols'] = colWidths;
    
    XLSX.writeFile(workbook, 'trainees_template.xlsx');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setExcelFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map the data to match our trainee structure
        const parsedTrainees = jsonData.map((row: any, index: number) => {
          const isMedicalDoctor = (row.medical_doctor || row['Medical Doctor'] || '').toLowerCase() === 'yes';
          const apcNumber = row.apc_number || row['APC Number'] || '';
          
          // Validate APC number if medical doctor
          if (isMedicalDoctor && !apcNumber) {
            throw new Error(`Row ${index + 2}: APC Number is required for medical doctors`);
          }
          
          return {
            full_name: row.full_name || row['Full Name'] || '',
            nric: row.nric || row.NRIC || '',
            dob: row.dob || row.DOB || '',
            gender: row.gender || row.Gender || '',
            contact_number: row.contact_number || row['Contact Number'] || '',
            email: row.email || row.Email || '',
            medical_doctor: isMedicalDoctor,
            apc_number: apcNumber
          };
        });

        console.log('Parsed trainees from Excel:', parsedTrainees);
        setTrainees(parsedTrainees);
        toast({
          title: "File uploaded",
          description: `${parsedTrainees.length} trainee(s) loaded from file.`,
        });
      } catch (error) {
        console.error('Error parsing file:', error);
        toast({
          title: "Error",
          description: "Failed to parse the uploaded file. Please check the format.",
          variant: "destructive"
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const onSubmit = async (data: FormValues) => {
    if (trainees.length === 0) {
      toast({
        title: "Error",
        description: "Please upload a file with trainee details.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Creating registration with data:', data);
      console.log('Trainees to create:', trainees);

      const organization = {
        name: data.organizationName,
        address: data.organizationAddress || '',
        contact_person: data.organizationContactPerson,
        contact_email: data.organizationContactEmail || '',
        contact_number: data.organizationContactNumber || '',
      };

      // Find the selected course to get course_id
      const selectedCourse = courses.find(c => c.id === data.courseRunId);
      if (!selectedCourse) {
        throw new Error('Selected course not found');
      }

      const registration = {
        contact_person: data.organizationContactPerson,
        contact_email: data.organizationContactEmail,
        contact_number: data.organizationContactNumber || '',
        course_id: selectedCourse.course_id || '',
        course_run_id: data.courseRunId,
        hrdf_grant: false, // No longer applicable - removed from UI
        payment_amount: data.paymentAmount || 0,
      };

      console.log('Calling createRegistration with:', {
        registration,
        organization,
        trainees: trainees.length
      });

      const result = await createRegistration(registration, organization, trainees);
      console.log('Registration creation result:', result);

      if (result.success) {
        toast({
          title: "Success",
          description: "Registration created successfully!",
        });
        
        // Reset form and close dialog
        reset();
        setTrainees([]);
        setExcelFile(null);
        
        // Call onSave to refresh parent data
        await onSave();
        
        // Close the dialog
        onOpenChange(false);
      } else {
        console.error('Registration creation failed:', result.error);
        toast({
          title: "Error",
          description: result.error || "Failed to create registration.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating registration:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const courseOptions = courses.map(course => ({
    value: course.id,
    label: `${course.course?.title || course.title || 'Course'} - ${course.start_date ? new Date(course.start_date).toLocaleDateString() : 'TBA'}`,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Registration</DialogTitle>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Organization Details */}
            <div>
              <h3 className="font-medium mb-3">Organization & Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  name="organizationName"
                  label="Organization Name"
                  required
                />
                <InputField
                  name="organizationContactPerson"
                  label="Contact Person"
                  required
                />
                <div className="md:col-span-2">
                  <InputField
                    name="organizationAddress"
                    label="Address"
                  />
                </div>
                <InputField
                  name="organizationContactEmail"
                  label="Email"
                  type="email"
                  required
                />
                <InputField
                  name="organizationContactNumber"
                  label="Phone Number"
                />
              </div>
            </div>

            {/* Course Selection */}
            <div>
              <h3 className="font-medium mb-3">Course Selection</h3>
              <SelectField
                name="courseRunId"
                label="Course"
                options={courseOptions}
                placeholder="Select a course"
                required
              />
            </div>

            {/* Trainee Upload */}
            <div>
              <h3 className="font-medium mb-3">Trainee Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={downloadTemplate}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Template
                  </Button>
                  
                  <div className="flex-1">
                    <Label htmlFor="excel-upload">Upload Trainee File (Excel/CSV)</Label>
                    <Input
                      id="excel-upload"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                {trainees.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">
                      {trainees.length} trainee(s) loaded:
                    </p>
                    <div className="max-h-32 overflow-y-auto">
                      {trainees.slice(0, 5).map((trainee, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {trainee.full_name} {trainee.nric && `(${trainee.nric})`}
                        </div>
                      ))}
                      {trainees.length > 5 && (
                        <div className="text-sm text-gray-500">
                          ... and {trainees.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h3 className="font-medium mb-3">Payment Information</h3>
              <InputField
                name="paymentAmount"
                label="Payment Amount (AED)"
                type="number"
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || loading}>
                {isSubmitting || loading ? 'Creating...' : 'Create Registration'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationCreateDialog;
