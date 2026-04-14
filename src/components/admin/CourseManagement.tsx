import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, Link, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import BaseCourseForm from '@/components/admin/BaseCourseForm';
import CourseUrlField from '@/components/admin/CourseUrlField';
import BulkCourseImport from '@/components/admin/BulkCourseImport';
import { generateUniqueCourseUrl, updateCourseUrl } from '@/services/courseUrlService';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  registration_url: string | null;
  hrdc_program_code: string | null;
  category: string | null;
  course_agenda: string | null;
  course_content_url: string | null;
  created_at: string;
}

const CourseManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Fetch courses
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: 'Error fetching courses',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      return data as Course[];
    }
  });

  // Add course mutation
  const addCourseMutation = useMutation({
    mutationFn: async (newCourse: Omit<Course, 'id' | 'created_at' | 'registration_url'>) => {
      // First create the course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert(newCourse)
        .select('*')
        .single();
      
      if (courseError) throw courseError;

      // Generate unique URL for the course
      const registrationUrl = await generateUniqueCourseUrl(newCourse.title);
      
      // Update the course with the URL
      await updateCourseUrl(courseData.id, registrationUrl);
      
      // Return the updated course data
      return { ...courseData, registration_url: registrationUrl };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setIsAddDialogOpen(false);
      toast({
        title: 'Course added',
        description: 'The course has been added successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to add course',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async (course: Course) => {
      const { id, created_at, ...courseData } = course;
      const { data, error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setIsEditDialogOpen(false);
      setSelectedCourse(null);
      toast({
        title: 'Course updated',
        description: 'The course has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update course',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('DeleteCourseMutation invoking edge function', { id });
      const { data, error } = await supabase.functions.invoke('admin-delete-course', {
        body: { course_id: id },
      });

      if (error) throw error;
      if (data && (data as any).error) {
        throw new Error((data as any).error);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setIsDeleteDialogOpen(false);
      setSelectedCourse(null);
      toast({
        title: 'Course deleted',
        description: 'The course has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete course',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Generate URL mutation
  const generateUrlMutation = useMutation({
    mutationFn: async (course: Course) => {
      const registrationUrl = await generateUniqueCourseUrl(course.title);
      await updateCourseUrl(course.id, registrationUrl);
      return { ...course, registration_url: registrationUrl };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: 'URL Generated',
        description: 'Course registration URL has been generated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to generate URL',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleAddCourse = (courseData: Omit<Course, 'id' | 'created_at' | 'registration_url'>) => {
    addCourseMutation.mutate(courseData);
  };

  const handleUpdateCourse = (courseData: Course) => {
    updateCourseMutation.mutate(courseData);
  };

  const handleDeleteCourse = () => {
    if (selectedCourse) {
      console.log('HandleDeleteCourse clicked', { selectedCourseId: selectedCourse.id });
      deleteCourseMutation.mutate(selectedCourse.id);
    }
  };

  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Courses</h2>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => setShowBulkImport(!showBulkImport)}
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {showBulkImport ? 'Hide Bulk Import' : 'Bulk Import'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Import multiple courses from Excel/CSV</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Course
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create New Course</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Bulk Import Section */}
      {showBulkImport && (
        <div className="mb-6">
          <BulkCourseImport />
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h3 className="text-lg font-medium mb-2">No courses found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first course.</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Course
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create New Course</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>HRDC Program Code</TableHead>
                <TableHead>Course URL</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.description || '—'}</TableCell>
                  <TableCell>
                    {course.price ? `AED ${course.price.toFixed(2)}` : '—'}
                  </TableCell>
                  <TableCell>{course.category || '—'}</TableCell>
                  <TableCell>{course.hrdc_program_code || '—'}</TableCell>
                  <TableCell className="max-w-md">
                    <CourseUrlField 
                      registrationUrl={course.registration_url || undefined}
                      courseId={course.id}
                      courseTitle={course.title}
                    />
                  </TableCell>
                  <TableCell>{formatDate(course.created_at)}</TableCell>
                   <TableCell className="text-right">
                     <TooltipProvider>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => openEditDialog(course)}
                           >
                             <Pencil className="h-4 w-4" />
                           </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                           <p>Edit Course</p>
                         </TooltipContent>
                       </Tooltip>
                     </TooltipProvider>
                     
                     <TooltipProvider>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => openDeleteDialog(course)}
                             className="text-red-500 hover:text-red-700"
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                           <p>Delete Course</p>
                         </TooltipContent>
                       </Tooltip>
                     </TooltipProvider>
                   </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Course Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new course.
            </DialogDescription>
          </DialogHeader>
          <BaseCourseForm onSubmit={handleAddCourse} onCancel={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the course details.
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <BaseCourseForm 
              initialData={selectedCourse} 
              onSubmit={handleUpdateCourse} 
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        title="Delete Course"
        description={`Are you sure you want to delete "${selectedCourse?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteCourse}
      />
    </div>
  );
};

export default CourseManagement;
