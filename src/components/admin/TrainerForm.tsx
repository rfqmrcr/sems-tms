import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Upload, X } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Trainer } from './TrainerManagement';

interface TrainerFormProps {
  initialData?: Trainer;
  onSubmit: (data: Omit<Trainer, 'id' | 'created_at' | 'updated_at'>, courseIds: string[]) => void;
  onCancel: () => void;
}

const TrainerForm: React.FC<TrainerFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { toast } = useToast();
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [currentResumeUrl, setCurrentResumeUrl] = useState(initialData?.resume_url || '');
  const [selectedUserId, setSelectedUserId] = useState<string>(initialData?.user_id || '');

  useEffect(() => {
    if (initialData?.user_id) {
      setSelectedUserId(initialData.user_id);
    }
  }, [initialData]);
  
  const form = useForm<{
    full_name: string;
    email: string;
    phone: string;
    expertise: string;
    bio: string;
    is_active: boolean;
    resume_url: string;
    course_ids: string[];
  }>({
    defaultValues: {
      full_name: initialData?.full_name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      expertise: initialData?.expertise || '',
      bio: initialData?.bio || '',
      is_active: initialData?.is_active ?? true,
      resume_url: initialData?.resume_url || '',
      course_ids: [] as string[],
    },
  });

  // Fetch all courses
  const { data: courses } = useQuery({
    queryKey: ['courses-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .order('title');
      if (error) throw error;
      return data;
    },
  });

  // Fetch trainer's current courses if editing
  const { data: trainerCourses } = useQuery({
    queryKey: ['trainer-courses', initialData?.id],
    queryFn: async () => {
      if (!initialData?.id) return [];
      const { data, error } = await supabase
        .from('trainer_courses')
        .select('course_id')
        .eq('trainer_id', initialData.id);
      if (error) throw error;
      return data.map(tc => tc.course_id);
    },
    enabled: !!initialData?.id,
  });

  React.useEffect(() => {
    if (trainerCourses) {
      form.setValue('course_ids', trainerCourses);
    }
  }, [trainerCourses, form]);

  const handleResumeUpload = async (file: File) => {
    if (!file) return null;
    
    setUploadingResume(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('trainer-resumes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('trainer-resumes')
        .getPublicUrl(filePath);

      return filePath; // Return the file path, not the public URL for private storage
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload resume',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (data: any) => {
    const { course_ids, ...trainerData } = data;
    
    // Upload resume if a new file was selected
    if (resumeFile) {
      const resumePath = await handleResumeUpload(resumeFile);
      if (resumePath) {
        trainerData.resume_url = resumePath;
      }
    }
    
    // Add user_id to trainer data
    trainerData.user_id = selectedUserId || null;
    
    onSubmit(trainerData, course_ids || []);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      form.setValue('resume_url', file.name);
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please select a PDF file',
        variant: 'destructive',
      });
    }
  };

  const removeResume = () => {
    setResumeFile(null);
    setCurrentResumeUrl('');
    form.setValue('resume_url', '');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter trainer's full name" 
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email"
                  placeholder="Enter trainer's email" 
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
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter trainer's phone number" 
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
          name="expertise"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expertise</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter trainer's area of expertise" 
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
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter trainer's biography" 
                  {...field} 
                  value={field.value || ''} 
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="resume">Resume (PDF)</Label>
          {currentResumeUrl && !resumeFile ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.267 14.68c-.184 0-.308.018-.372.036v1.178c.076.018.171.023.302.023.479 0 .774-.242.774-.651 0-.366-.254-.586-.704-.586zm3.487.012c-.2 0-.33.018-.407.036v2.61c.077.018.201.018.313.018.817.006 1.349-.444 1.349-1.396.006-.83-.479-1.268-1.255-1.268z"/>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                    <path d="M14 2v6h6"/>
                  </svg>
                  <span className="text-sm font-medium">
                    {currentResumeUrl.split('/').pop()?.split('?')[0] || 'Trainer Resume PDF'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(currentResumeUrl, '_blank')}
                  >
                    View
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeResume}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="file:mr-2 file:py-1 file:px-2 file:rounded-sm file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <span className="text-sm text-muted-foreground">Replace with new file</span>
              </div>
            </div>
          ) : resumeFile ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.267 14.68c-.184 0-.308.018-.372.036v1.178c.076.018.171.023.302.023.479 0 .774-.242.774-.651 0-.366-.254-.586-.704-.586zm3.487.012c-.2 0-.33.018-.407.036v2.61c.077.018.201.018.313.018.817.006 1.349-.444 1.349-1.396.006-.83-.479-1.268-1.255-1.268z"/>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                    <path d="M14 2v6h6"/>
                  </svg>
                  <span className="text-sm font-medium">{resumeFile.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeResume}
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Input
                id="resume"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="file:mr-2 file:py-1 file:px-2 file:rounded-sm file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Upload a PDF resume that can be attached to emails (max 10MB).
          </p>
        </div>

        <div className="space-y-2">
          <Label>Link to Auth User (Optional)</Label>
          <div className="flex items-center gap-2">
            {selectedUserId ? (
              <>
                <Input 
                  value={selectedUserId} 
                  readOnly 
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUserId('')}
                >
                  Clear
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic py-2">
                No user account linked - Use "Create Login" button after saving the trainer
              </p>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            After creating the trainer profile, use the "Create Login" button in the trainer table to automatically create and link an auth account with credentials sent via email.
          </p>
        </div>

        <FormField
          control={form.control}
          name="course_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Courses This Trainer Can Teach</FormLabel>
              <div className="grid grid-cols-1 gap-2 border rounded-lg p-4 max-h-48 overflow-y-auto">
                {courses?.map((course) => (
                  <div key={course.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={course.id}
                      checked={Array.isArray(field.value) && field.value.includes(course.id)}
                      onCheckedChange={(checked) => {
                        const currentValues = Array.isArray(field.value) ? field.value : [];
                        if (checked) {
                          field.onChange([...currentValues, course.id]);
                        } else {
                          field.onChange(currentValues.filter((id: string) => id !== course.id));
                        }
                      }}
                    />
                    <label htmlFor={course.id} className="text-sm font-medium leading-none">
                      {course.title}
                    </label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Enable this trainer for course assignments
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={uploadingResume}>
            {uploadingResume ? 'Uploading...' : (initialData ? 'Update Trainer' : 'Add Trainer')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TrainerForm;