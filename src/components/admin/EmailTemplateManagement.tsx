import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  course_id: string | null;
  registration_type: string | null;
  trigger_point: string;
  is_active: boolean;
  include_quotation: boolean;
  include_course_agenda: boolean;
  include_trainer_profile: boolean;
  include_course_content: boolean;
  attachment_urls: string[] | null;
  cc_emails: string[] | null;
  created_at: string;
  updated_at: string;
  course?: {
    title: string;
  };
}

interface Course {
  id: string;
  title: string;
}

export default function EmailTemplateManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch email templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select(`
          *,
          course:courses(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  // Fetch courses for dropdown
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .order('title');

      if (error) throw error;
      return data as Course[];
    },
  });

  // Create/Update template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (template: any) => {
      if (editingTemplate) {
        const { data, error } = await supabase
          .from('email_templates')
          .update(template)
          .eq('id', editingTemplate.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('email_templates')
          .insert(template)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setIsDialogOpen(false);
      setEditingTemplate(null);
      toast({
        title: 'Success',
        description: `Template ${editingTemplate ? 'updated' : 'created'} successfully`,
      });
    },
    onError: (error) => {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const template = {
      name: formData.get('name') as string,
      subject: formData.get('subject') as string,
      html_content: formData.get('html_content') as string,
      course_id: formData.get('course_id') === 'all' ? null : formData.get('course_id') as string,
      registration_type: formData.get('registration_type') === 'all' ? null : formData.get('registration_type') as string,
      trigger_point: formData.get('trigger_point') as string,
      is_active: formData.get('is_active') === 'on',
      include_quotation: formData.get('include_quotation') === 'on',
      include_course_agenda: formData.get('include_course_agenda') === 'on',
      include_trainer_profile: formData.get('include_trainer_profile') === 'on',
      include_course_content: formData.get('include_course_content') === 'on',
      attachment_urls: formData.get('attachment_urls') 
        ? (formData.get('attachment_urls') as string).split(',').map(url => url.trim()).filter(Boolean)
        : null,
      cc_emails: formData.get('cc_emails') 
        ? (formData.get('cc_emails') as string).split(',').map(email => email.trim()).filter(Boolean)
        : null,
    };

    saveTemplateMutation.mutate(template);
  };

  const openEditDialog = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingTemplate(null);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Templates</h2>
          <p className="text-muted-foreground">
            Manage email templates for different courses and registration types
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Create Email Template'}
              </DialogTitle>
              <DialogDescription>
                Create templates with dynamic content using variables like {'{'}contactName{'}'}, {'{'}courseName{'}'}, {'{'}companyName{'}'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingTemplate?.name}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="trigger_point">Trigger Point</Label>
                  <Select name="trigger_point" defaultValue={editingTemplate?.trigger_point || 'registration'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="registration">Upon Registration</SelectItem>
                      <SelectItem value="payment_confirmation">Payment Confirmation</SelectItem>
                      <SelectItem value="course_reminder">Course Reminder</SelectItem>
                      <SelectItem value="training_completion">Training Completion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  defaultValue={editingTemplate?.subject}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="course_id">Course (Optional)</Label>
                  <Select name="course_id" defaultValue={editingTemplate?.course_id || 'all'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="registration_type">Registration Type (Optional)</Label>
                  <Select name="registration_type" defaultValue={editingTemplate?.registration_type || 'all'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="hrdf">HRDC Grant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="html_content">Email Content (HTML)</Label>
                <Textarea
                  id="html_content"
                  name="html_content"
                  defaultValue={editingTemplate?.html_content}
                  rows={10}
                  placeholder="Use variables like {contactName}, {courseName}, {companyName}, {courseStartDate}, {totalAmount}, {websiteUrl}, {registrationUrl}, etc."
                  required
                />
              </div>

              <div>
                <Label htmlFor="cc_emails">CC Email Addresses (comma-separated)</Label>
                <Input
                  id="cc_emails"
                  name="cc_emails"
                  defaultValue={editingTemplate?.cc_emails?.join(', ')}
                  placeholder="admin@company.com, manager@company.com"
                />
              </div>

              <div>
                <Label htmlFor="attachment_urls">Attachment URLs (comma-separated)</Label>
                <Input
                  id="attachment_urls"
                  name="attachment_urls"
                  defaultValue={editingTemplate?.attachment_urls?.join(', ')}
                  placeholder="https://example.com/file1.pdf, https://example.com/file2.pdf"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    name="is_active"
                    defaultChecked={editingTemplate?.is_active ?? true}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include_quotation"
                    name="include_quotation"
                    defaultChecked={editingTemplate?.include_quotation ?? false}
                  />
                  <Label htmlFor="include_quotation">Attach Quotation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include_course_agenda"
                    name="include_course_agenda"
                    defaultChecked={editingTemplate?.include_course_agenda ?? false}
                  />
                  <Label htmlFor="include_course_agenda">Attach Course Agenda</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include_trainer_profile"
                    name="include_trainer_profile"
                    defaultChecked={editingTemplate?.include_trainer_profile ?? false}
                  />
                  <Label htmlFor="include_trainer_profile">Attach Trainer Profile</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include_course_content"
                    name="include_course_content"
                    defaultChecked={editingTemplate?.include_course_content ?? false}
                  />
                  <Label htmlFor="include_course_content">Attach Course Content</Label>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-semibold mb-3">Available Email Template Variables</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-medium mb-2">Contact Information</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li><code>{'{'}contactName{'}'}</code> - The name of the person registering</li>
                      <li><code>{'{'}contactEmail{'}'}</code> - The email address of the contact person</li>
                      <li><code>{'{'}companyName{'}'}</code> - The name of the organization/company</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Course Details</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li><code>{'{'}courseName{'}'}</code> - The name/title of the course</li>
                      <li><code>{'{'}courseStartDate{'}'}</code> - The start date of the course</li>
                      <li><code>{'{'}courseEndDate{'}'}</code> - The end date of the course</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Registration Information</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li><code>{'{'}participantCount{'}'}</code> - Number of participants registered (as a number)</li>
                      <li><code>{'{'}hrdfGrant{'}'}</code> - Whether HRDF grant is applied ("Yes" or "No")</li>
                      <li><code>{'{'}registrationId{'}'}</code> - Unique registration identifier</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Financial Information</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li><code>{'{'}coursePrice{'}'}</code> - Price per participant (formatted as "AED XX.XX")</li>
                      <li><code>{'{'}totalAmount{'}'}</code> - Total amount for all participants (formatted as "AED XX.XX")</li>
                      <li><code>{'{'}quotationNumber{'}'}</code> - Quotation number (if available, otherwise empty)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveTemplateMutation.isPending}>
                  {saveTemplateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    {template.name}
                    {!template.is_active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{template.subject}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteTemplateMutation.mutate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline">
                  Trigger: {template.trigger_point.replace('_', ' ')}
                </Badge>
                {template.course && (
                  <Badge variant="outline">
                    Course: {template.course.title}
                  </Badge>
                )}
                {template.registration_type && (
                  <Badge variant="outline">
                    Type: {template.registration_type}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                <div dangerouslySetInnerHTML={{ 
                  __html: template.html_content.substring(0, 200) + '...' 
                }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}