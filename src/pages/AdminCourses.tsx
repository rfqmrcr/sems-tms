
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardHeader from '@/components/admin/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import CourseManagement from '@/components/admin/CourseManagement';
import CourseRunManagement from '@/components/admin/CourseRunManagement';
import EmailTemplateManagement from '@/components/admin/EmailTemplateManagement';
import TrainerManagement from '@/components/admin/TrainerManagement';
import { Course, CourseRun } from '@/types/course';

// Extended CourseRun type with admin-specific fields
export interface AdminCourseRun extends CourseRun {
  trainer?: {
    id: string;
    full_name: string;
  };
  trainers?: Array<{
    id: string;
    full_name: string;
  }>;
  trainer_ids?: string[];
  registration_close_days?: number | null;
}

const AdminCourses = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader userEmail={user?.email} />
      
      <h1 className="text-2xl font-bold mb-6">Course Management</h1>
      
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="course-runs">Course Runs</TabsTrigger>
          <TabsTrigger value="trainers">Trainers</TabsTrigger>
          <TabsTrigger value="email-templates">Email Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="courses" className="mt-6">
          <CourseManagement />
        </TabsContent>
        
        <TabsContent value="course-runs" className="mt-6">
          <CourseRunManagement />
        </TabsContent>
        
        <TabsContent value="trainers" className="mt-6">
          <TrainerManagement />
        </TabsContent>
        
        <TabsContent value="email-templates" className="mt-6">
          <EmailTemplateManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCourses;
