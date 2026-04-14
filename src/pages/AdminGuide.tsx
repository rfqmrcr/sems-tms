import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Edit, Save, X, Plus, Trash2, Book, Users, Calendar, FileText, BarChart3, Mail, Building, UserCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import DashboardHeader from '@/components/admin/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface GuideSection {
  id: string;
  title: string;
  content: string;
  isEditing: boolean;
}

interface GuideTab {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  sections: GuideSection[];
}

const AdminGuide: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const defaultGuideTabs: GuideTab[] = [
    {
      id: 'overview',
      title: 'System Overview',
      icon: Book,
      sections: [
        {
          id: 'welcome',
          title: 'Welcome to the Admin Portal',
          content: `Welcome to the comprehensive training management system! This admin portal allows you to manage all aspects of your training programs.\n\nKey Features:\n• Course and course run management\n• Student registration tracking\n• Attendance monitoring\n• Invoice and quotation generation\n• Comprehensive reporting\n• Partner management\n\nThis guide will help you understand how to use each feature effectively.`,
          isEditing: false
        },
        {
          id: 'navigation',
          title: 'Navigation Overview',
          content: `The admin portal is organized into several main sections:\n\n• Dashboard - Overview of key metrics\n• Courses - Manage course content and schedules\n• Registrations - Track student enrollments\n• Trainees - Manage student information\n• Invoices & Quotations - Financial management\n• Attendance - Track student participation\n• Reports - Analytics and insights\n• Partners - Manage training partners\n• Email Logs - Track email communications`,
          isEditing: false
        }
      ]
    },
    {
      id: 'courses',
      title: 'Course Management',
      icon: Book,
      sections: [
        {
          id: 'course-creation',
          title: 'Creating Courses',
          content: `To create a new course:\n\n1. Navigate to the Courses section\n2. Click "Add Course" button\n3. Fill in the course details:\n   • Course title\n   • Course description\n   • Course agenda/content\n   • Course URL (for direct registration)\n   • Course category\n4. Save the course\n\nTip: Course URLs should be unique and descriptive for easy sharing.`,
          isEditing: false
        },
        {
          id: 'course-runs',
          title: 'Managing Course Runs',
          content: `Course runs are specific instances of courses with dates and trainers:\n\n1. Select a course from the list\n2. Click "Add Course Run"\n3. Set the schedule:\n   • Start and end dates\n   • Daily time slots\n   • Location\n4. Assign a trainer\n5. Set capacity and pricing\n6. Configure registration closing date\n\nBulk Import: Use the bulk import feature to add multiple course runs at once using the provided Excel template.`,
          isEditing: false
        },
        {
          id: 'course-editing',
          title: 'Editing and Managing Courses',
          content: `To edit existing courses:\n\n1. Find the course in the list\n2. Click the edit icon\n3. Modify the details as needed\n4. Save changes\n\nTo delete courses:\n• Click the delete icon\n• Confirm deletion (Note: This will also remove associated course runs)\n\nCourse Status: Courses can be active or inactive. Inactive courses won't appear in public listings.`,
          isEditing: false
        }
      ]
    },
    {
      id: 'registrations',
      title: 'Registration Management',
      icon: Users,
      sections: [
        {
          id: 'registration-overview',
          title: 'Understanding Registrations',
          content: `Registrations represent enrollments of participants in course runs:\n\nRegistration Types:\n• Individual - Single participant\n• Corporate - Multiple participants from one organization\n• HRDF - Training funded by Human Resources Development Fund\n\nRegistration Status:\n• Pending - Awaiting confirmation\n• Confirmed - Approved and active\n• Cancelled - Cancelled registration`,
          isEditing: false
        },
        {
          id: 'managing-registrations',
          title: 'Creating and Managing Registrations',
          content: `To create a new registration:\n\n1. Go to Registrations section\n2. Click "Add Registration"\n3. Fill in participant details:\n   • Contact information\n   • Company details (if corporate)\n   • Course selection\n   • Payment terms\n4. Generate quotation or invoice as needed\n\nTo edit registrations:\n• Click edit icon next to registration\n• Modify details and save\n• Update payment status if needed`,
          isEditing: false
        },
        {
          id: 'registration-urls',
          title: 'Registration URLs',
          content: `Each registration can have a unique URL for easy access:\n\n1. When creating/editing registration\n2. Set a custom registration URL\n3. Share this URL with participants\n4. Participants can use this URL to complete their registration\n\nBest Practices:\n• Use descriptive URLs\n• Include company or course reference\n• Keep URLs short and memorable`,
          isEditing: false
        }
      ]
    },
    {
      id: 'trainees',
      title: 'Trainee Management',
      icon: UserCheck,
      sections: [
        {
          id: 'trainee-overview',
          title: 'Managing Trainees',
          content: `Trainees are individual participants in courses:\n\nTrainee Information:\n• Personal details (name, email, phone)\n• Company information\n• Course enrollment history\n• Attendance records\n• Certificates earned\n\nTrainee records are automatically created when registrations are processed.`,
          isEditing: false
        },
        {
          id: 'trainee-operations',
          title: 'Trainee Operations',
          content: `Common trainee operations:\n\nViewing Trainee Details:\n• Click on trainee name to view full profile\n• See enrollment history and attendance\n\nEditing Trainee Information:\n• Click edit icon\n• Update personal or company details\n• Save changes\n\nDeleting Trainees:\n• Use delete function carefully\n• This will remove all associated records\n\nBulk Operations:\n• Export trainee list to Excel\n• Filter by course, company, or date range`,
          isEditing: false
        }
      ]
    },
    {
      id: 'attendance',
      title: 'Attendance Tracking',
      icon: Calendar,
      sections: [
        {
          id: 'attendance-overview',
          title: 'Attendance System',
          content: `The attendance system tracks participant presence:\n\nAttendance States:\n• Present - Participant attended\n• Absent - Participant did not attend\n• Late - Participant arrived late\n• Excused - Absent with valid reason\n\nAttendance can be marked manually or participants can sign in digitally.`,
          isEditing: false
        },
        {
          id: 'marking-attendance',
          title: 'Marking Attendance',
          content: `To mark attendance:\n\n1. Go to Attendance section\n2. Select the course run\n3. Choose the session date\n4. Mark each participant's status\n5. Add notes if needed\n6. Save attendance records\n\nDigital Signatures:\n• Participants can sign digitally\n• Signatures are stored with attendance records\n• Provides legal proof of attendance\n\nBulk Operations:\n• Mark all present/absent at once\n• Export attendance reports`,
          isEditing: false
        }
      ]
    },
    {
      id: 'financial',
      title: 'Financial Management',
      icon: FileText,
      sections: [
        {
          id: 'invoices-quotations',
          title: 'Invoices and Quotations',
          content: `Financial document management:\n\nQuotations:\n• Preliminary pricing documents\n• Can be converted to invoices\n• Include terms and conditions\n• Track approval status\n\nInvoices:\n• Final billing documents\n• Track payment status\n• Send to customers\n• Generate payment links\n\nBoth documents auto-calculate taxes and discounts.`,
          isEditing: false
        },
        {
          id: 'financial-operations',
          title: 'Financial Operations',
          content: `Creating Quotations:\n1. Go to Quotations section\n2. Click "Create Quotation"\n3. Select customer and course\n4. Set pricing and terms\n5. Generate and send\n\nConverting to Invoice:\n• Open approved quotation\n• Click "Convert to Invoice"\n• Adjust details if needed\n• Send to customer\n\nPayment Tracking:\n• Update payment status\n• Record payment dates\n• Generate payment reports`,
          isEditing: false
        }
      ]
    },
    {
      id: 'reports',
      title: 'Reports and Analytics',
      icon: BarChart3,
      sections: [
        {
          id: 'reporting-overview',
          title: 'Reporting System',
          content: `Comprehensive reporting features:\n\nReport Types:\n• Registration statistics\n• Revenue analysis\n• Course popularity\n• Attendance summaries\n• Financial reports\n• Custom reports\n\nAll reports can be filtered by date range, course, trainer, or other criteria.`,
          isEditing: false
        },
        {
          id: 'generating-reports',
          title: 'Generating Reports',
          content: `To generate reports:\n\n1. Navigate to Reports section\n2. Select report type\n3. Set date range and filters\n4. Click "Generate Report"\n5. View results in charts/tables\n6. Export to Excel or PDF\n\nScheduled Reports:\n• Set up automatic report generation\n• Email reports to stakeholders\n• Choose frequency (daily, weekly, monthly)\n\nCustom Reports:\n• Build reports with specific metrics\n• Save report templates\n• Share with team members`,
          isEditing: false
        }
      ]
    },
    {
      id: 'communications',
      title: 'Communications',
      icon: Mail,
      sections: [
        {
          id: 'email-system',
          title: 'Email Management',
          content: `Automated email communications:\n\nEmail Types:\n• Registration confirmations\n• Course reminders\n• Attendance certificates\n• Payment notifications\n• Custom announcements\n\nEmail Templates:\n• Pre-designed templates\n• Customizable content\n• Dynamic placeholders\n• Multi-language support`,
          isEditing: false
        },
        {
          id: 'email-operations',
          title: 'Email Operations',
          content: `Managing emails:\n\nSending Emails:\n• Automatic triggers based on events\n• Manual sending to selected recipients\n• Bulk email campaigns\n• Scheduled sending\n\nEmail Logs:\n• Track all sent emails\n• View delivery status\n• Check open and click rates\n• Troubleshoot delivery issues\n\nTemplate Management:\n• Edit email templates\n• Create new templates\n• Preview before sending\n• A/B testing capabilities`,
          isEditing: false
        }
      ]
    },
    {
      id: 'partners',
      title: 'Partner Management',
      icon: Building,
      sections: [
        {
          id: 'partner-overview',
          title: 'Training Partners',
          content: `Manage relationships with training partners:\n\nPartner Types:\n• Training providers\n• Venue partners\n• Technology partners\n• Marketing partners\n\nPartner Information:\n• Contact details\n• Service offerings\n• Contract terms\n• Performance metrics`,
          isEditing: false
        },
        {
          id: 'partner-operations',
          title: 'Partner Operations',
          content: `Managing partners:\n\nAdding Partners:\n1. Go to Partners section\n2. Click "Add Partner"\n3. Fill in partner details\n4. Set partnership terms\n5. Save partner record\n\nPartner Activities:\n• Track courses delivered\n• Monitor performance\n• Manage payments\n• Review feedback\n\nReporting:\n• Partner performance reports\n• Revenue sharing analysis\n• Course delivery statistics`,
          isEditing: false
        }
      ]
    }
  ];

  const [guideTabs, setGuideTabs] = useState<GuideTab[]>(() => {
    const saved = localStorage.getItem('adminGuideContent');
    return saved ? JSON.parse(saved) : defaultGuideTabs;
  });

  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [isAddingSection, setIsAddingSection] = useState(false);

  useEffect(() => {
    localStorage.setItem('adminGuideContent', JSON.stringify(guideTabs));
  }, [guideTabs]);

  const handleEditSection = (tabId: string, sectionId: string) => {
    setGuideTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? {
            ...tab,
            sections: tab.sections.map(section => 
              section.id === sectionId 
                ? { ...section, isEditing: true }
                : { ...section, isEditing: false }
            )
          }
        : tab
    ));
  };

  const handleSaveSection = (tabId: string, sectionId: string, newTitle: string, newContent: string) => {
    setGuideTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? {
            ...tab,
            sections: tab.sections.map(section => 
              section.id === sectionId 
                ? { ...section, title: newTitle, content: newContent, isEditing: false }
                : section
            )
          }
        : tab
    ));
    toast.success('Section updated successfully');
  };

  const handleCancelEdit = (tabId: string, sectionId: string) => {
    setGuideTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? {
            ...tab,
            sections: tab.sections.map(section => 
              section.id === sectionId 
                ? { ...section, isEditing: false }
                : section
            )
          }
        : tab
    ));
  };

  const handleAddSection = (tabId: string) => {
    if (!newSectionTitle.trim()) return;

    const newSection: GuideSection = {
      id: `section-${Date.now()}`,
      title: newSectionTitle,
      content: 'Click edit to add content for this section.',
      isEditing: false
    };

    setGuideTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, sections: [...tab.sections, newSection] }
        : tab
    ));

    setNewSectionTitle('');
    setIsAddingSection(false);
    toast.success('New section added');
  };

  const handleDeleteSection = (tabId: string, sectionId: string) => {
    setGuideTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, sections: tab.sections.filter(section => section.id !== sectionId) }
        : tab
    ));
    toast.success('Section deleted');
  };

  const resetToDefault = () => {
    setGuideTabs(defaultGuideTabs);
    localStorage.removeItem('adminGuideContent');
    toast.success('Guide reset to default content');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userEmail={user?.email} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Administrator's Guide</h1>
            <p className="text-gray-600 mt-2">Comprehensive guide for using the training management system</p>
          </div>
          <Button variant="outline" onClick={resetToDefault} className="text-sm">
            Reset to Default
          </Button>
        </div>

        <Alert className="mb-6">
          <Book className="h-4 w-4" />
          <AlertDescription>
            This guide is editable! Click the edit button on any section to customize the content. 
            You can add videos, images, or any additional information to help your team.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6 overflow-x-auto">
            <TabsList className="inline-flex h-auto p-1 bg-muted rounded-lg min-w-full justify-start">
              {guideTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id} 
                    className="flex items-center gap-2 px-4 py-2 whitespace-nowrap min-w-fit"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm">{tab.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {guideTabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <div className="space-y-6">
                {tab.sections.map((section) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    tabId={tab.id}
                    onEdit={handleEditSection}
                    onSave={handleSaveSection}
                    onCancel={handleCancelEdit}
                    onDelete={handleDeleteSection}
                  />
                ))}

                <Card>
                  <CardContent className="p-6">
                    {isAddingSection ? (
                      <div className="space-y-4">
                        <Input
                          placeholder="Section title"
                          value={newSectionTitle}
                          onChange={(e) => setNewSectionTitle(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button onClick={() => handleAddSection(tab.id)}>
                            Add Section
                          </Button>
                          <Button variant="outline" onClick={() => setIsAddingSection(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setIsAddingSection(true)}
                        className="w-full border-dashed"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Section
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

interface SectionCardProps {
  section: GuideSection;
  tabId: string;
  onEdit: (tabId: string, sectionId: string) => void;
  onSave: (tabId: string, sectionId: string, title: string, content: string) => void;
  onCancel: (tabId: string, sectionId: string) => void;
  onDelete: (tabId: string, sectionId: string) => void;
}

const SectionCard: React.FC<SectionCardProps> = ({
  section,
  tabId,
  onEdit,
  onSave,
  onCancel,
  onDelete
}) => {
  const [editTitle, setEditTitle] = useState(section.title);
  const [editContent, setEditContent] = useState(section.content);

  const handleSave = () => {
    onSave(tabId, section.id, editTitle, editContent);
  };

  const handleCancel = () => {
    setEditTitle(section.title);
    setEditContent(section.content);
    onCancel(tabId, section.id);
  };

  if (section.isEditing) {
    return (
      <Card>
        <CardHeader>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="text-lg font-semibold"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={10}
            placeholder="Enter section content..."
          />
          <div className="flex gap-2">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">{section.title}</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(tabId, section.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(tabId, section.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none text-left">
          {section.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-2 whitespace-pre-wrap text-left">
              {paragraph}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminGuide;