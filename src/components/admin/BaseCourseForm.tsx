
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Course } from '@/components/admin/CourseManagement';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BaseCourseFormProps {
  initialData?: Course;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const BaseCourseForm: React.FC<BaseCourseFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [courseContentFile, setCourseContentFile] = useState<File | null>(null);

  const form = useForm({
    defaultValues: initialData || {
      title: '',
      description: '',
      price: null,
      hrdc_program_code: '',
      category: '',
      course_agenda: '',
      course_content_url: '',
      registration_url: '',
    },
  });

  const handleCourseContentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setCourseContentFile(file);
  };

  const uploadCourseContent = async (courseId: string): Promise<string | null> => {
    if (!courseContentFile) return null;

    setIsUploading(true);
    try {
      const fileExt = 'pdf';
      const fileName = `${courseId}_course_content.${fileExt}`;
      const filePath = `${courseId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course-content')
        .upload(filePath, courseContentFile, {
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      return filePath;
    } catch (error) {
      console.error('Error uploading course content:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload course content. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      // If editing, include the id
      if (initialData?.id) {
        data.id = initialData.id;
        data.created_at = initialData.created_at;

        // Upload course content if a new file was selected
        if (courseContentFile) {
          const contentUrl = await uploadCourseContent(initialData.id);
          if (contentUrl) {
            data.course_content_url = contentUrl;
          }
        }
      }

      onSubmit(data);
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: "Error",
        description: "Failed to submit course data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Title *</FormLabel>
              <FormControl>
                <Input placeholder="Enter course title" {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter course description" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (AED)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  placeholder="Enter course price" 
                  {...field} 
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hrdc_program_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>HRDC Program Code</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter HRDC program code" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="AHA">AHA</SelectItem>
                  <SelectItem value="DOSH/JKKP">DOSH/JKKP</SelectItem>
                  <SelectItem value="E-LEARNING">E-LEARNING</SelectItem>
                  <SelectItem value="ITLS">ITLS</SelectItem>
                  <SelectItem value="NAEMT">NAEMT</SelectItem>
                  <SelectItem value="NSC">NSC</SelectItem>
                  <SelectItem value="PHC">PHC</SelectItem>
                  <SelectItem value="STCN">STCN</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="course_agenda"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Agenda</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={`Enter the course agenda content. For example:

Day 1: Introduction
• Module 1: Basic Concepts (9:00 AM - 10:30 AM)
• Break (10:30 AM - 10:45 AM)
• Module 2: Practical Application (10:45 AM - 12:00 PM)
• Lunch Break (12:00 PM - 1:00 PM)
• Module 3: Advanced Techniques (1:00 PM - 3:00 PM)

Day 2: Practice & Assessment
• Module 4: Case Studies (9:00 AM - 10:30 AM)
• Module 5: Assessment & Certification (10:45 AM - 12:00 PM)

Note: This content will be used to generate PDF agendas with course name, dates, and trainer information.`}
                  {...field} 
                  value={field.value || ''}
                  rows={8}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="registration_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Registration URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter custom registration URL (optional)" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-muted-foreground">
                Leave empty to auto-generate a URL based on the course title.
              </p>
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Course Content (PDF)</FormLabel>
          {initialData?.course_content_url ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.267 14.68c-.184 0-.308.018-.372.036v1.178c.076.018.171.023.302.023.479 0 .774-.242.774-.651 0-.366-.254-.586-.704-.586zm3.487.012c-.2 0-.33.018-.407.036v2.61c.077.018.201.018.313.018.817.006 1.349-.444 1.349-1.396.006-.83-.479-1.268-1.255-1.268z"/>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                    <path d="M14 2v6h6"/>
                  </svg>
                  <span className="text-sm font-medium">
                    {initialData.course_content_url.split('/').pop()?.split('?')[0] || 'Course Content PDF'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(initialData.course_content_url, '_blank')}
                  >
                    View
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Clear the existing file reference
                      form.setValue('course_content_url', null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleCourseContentUpload}
                  className="file:mr-2 file:py-1 file:px-2 file:rounded-sm file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <span className="text-sm text-muted-foreground">Replace with new file</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept=".pdf"
                onChange={handleCourseContentUpload}
                className="file:mr-2 file:py-1 file:px-2 file:rounded-sm file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Upload a PDF file containing the course content (max 10MB). This will be available for email attachments.
          </p>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isUploading}>
            {isUploading ? 'Uploading...' : (initialData ? 'Update Course' : 'Add Course')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BaseCourseForm;
