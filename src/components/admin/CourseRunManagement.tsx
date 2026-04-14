import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, FileSpreadsheet, Copy } from 'lucide-react';
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
import CourseForm from '@/components/admin/CourseForm';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import BulkCourseRunImport from '@/components/admin/BulkCourseRunImport';
import RegistrationUrlField from '@/components/admin/RegistrationUrlField';
import CourseRunFilters from '@/components/admin/CourseRunFilters';
import { generateUniqueUrl, updateCourseRunUrl } from '@/services/courseUrlService';
import { CourseRun, CourseRunSchedule } from '@/types/course';
import { AdminCourseRun } from '@/pages/AdminCourses';

const CourseRunManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [selectedCourseRun, setSelectedCourseRun] = useState<AdminCourseRun | null>(null);
  const [filteredCourseRuns, setFilteredCourseRuns] = useState<AdminCourseRun[]>([]);

  console.log('CourseRunManagement render - isAddDialogOpen:', isAddDialogOpen);
  console.log('CourseRunManagement render - Dialog should be:', isAddDialogOpen ? 'OPEN' : 'CLOSED');

  // Fetch course runs with course details and trainers
  const { data: courseRuns = [], isLoading } = useQuery({
    queryKey: ['course-runs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_runs')
        .select(`
          *,
          course:courses!course_runs_course_id_fkey (
            id,
            title,
            description,
            hrdc_program_code,
            category,
            created_at
          ),
          course_run_trainers (
            trainer:trainers (
              id,
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: 'Error fetching course runs',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      // Transform data to include trainers array
      const transformedData = data.map(run => ({
        ...run,
        trainers: run.course_run_trainers?.map((crt: any) => crt.trainer) || []
      }));

      // Fetch schedules for all course runs
      const courseRunIds = transformedData.map(cr => cr.id);
      const { data: schedules } = await supabase
        .from('course_run_schedules')
        .select('*')
        .in('course_run_id', courseRunIds)
        .order('schedule_date', { ascending: true });

      // Map schedules to course runs
      const dataWithSchedules = transformedData.map(courseRun => ({
        ...courseRun,
        schedules: schedules?.filter(s => s.course_run_id === courseRun.id) || []
      }));
      
      return dataWithSchedules as AdminCourseRun[];
    }
  });

  // Initialize filtered course runs when data loads
  React.useEffect(() => {
    if (courseRuns.length > 0 && filteredCourseRuns.length === 0) {
      setFilteredCourseRuns(courseRuns);
    }
  }, [courseRuns]);

  // Add course run mutation
  const addCourseRunMutation = useMutation({
    mutationFn: async (params: { courseRun: any, schedules: Partial<CourseRunSchedule>[] }) => {
      const { courseRun: newCourseRun, schedules } = params;
      const { trainer_ids, trainer, trainer_id, ...courseRunData } = newCourseRun;
      
      // First, create the course run
      const { data, error } = await supabase
        .from('course_runs')
        .insert(courseRunData)
        .select(`
          *,
          course:courses!course_runs_course_id_fkey (
            id,
            title,
            description,
            hrdc_program_code,
            category,
            created_at
          )
        `)
        .single();
      
      if (error) throw error;

      // Add trainer associations if any trainers were selected
      if (trainer_ids && trainer_ids.length > 0) {
        const trainerAssociations = trainer_ids.map((trainerId: string) => ({
          course_run_id: data.id,
          trainer_id: trainerId
        }));

        const { error: trainerError } = await supabase
          .from('course_run_trainers')
          .insert(trainerAssociations);

        if (trainerError) {
          console.error('Failed to add trainer associations:', trainerError);
          // Continue anyway since the course run was created
        }
      }

      // Save schedules if provided
      if (schedules && schedules.length > 0) {
        const schedulesToInsert = schedules.map(schedule => ({
          course_run_id: data.id,
          schedule_date: schedule.schedule_date,
          start_time: schedule.start_time,
          end_time: schedule.end_time
        }));

        const { error: scheduleError } = await supabase
          .from('course_run_schedules')
          .insert(schedulesToInsert);

        if (scheduleError) {
          console.error('Failed to add schedules:', scheduleError);
        }
      }

      // Generate and update the registration URL
      try {
        const courseTitle = newCourseRun.title || data.course?.title || 'course-run';
        const startDate = newCourseRun.start_date || new Date().toISOString();
        
        const registrationUrl = await generateUniqueUrl(courseTitle, startDate);
        await updateCourseRunUrl(data.id, registrationUrl);
        
        // Return the updated data with registration URL
        return {
          ...data,
          registration_url: registrationUrl
        };
      } catch (urlError) {
        console.error('Failed to generate registration URL:', urlError);
        // Return the course run without URL if generation fails
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-runs'] });
      setIsAddDialogOpen(false);
      toast({
        title: 'Course run added',
        description: 'The course run has been added successfully with registration URL.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to add course run',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update course run mutation
  const updateCourseRunMutation = useMutation({
    mutationFn: async (params: { courseRun: any, schedules: Partial<CourseRunSchedule>[] }) => {
      const { courseRun, schedules } = params;
      const { id, course, trainers, trainer_ids, trainer, course_run_trainers, ...courseRunData } = courseRun;
      
      // Update course run
      const { error } = await supabase
        .from('course_runs')
        .update(courseRunData)
        .eq('id', id);
      
      if (error) throw error;

      // Update trainer associations
      // First, delete existing associations
      await supabase
        .from('course_run_trainers')
        .delete()
        .eq('course_run_id', id);

      // Then add new associations if any trainers were selected
      if (trainer_ids && trainer_ids.length > 0) {
        const trainerAssociations = trainer_ids.map((trainerId: string) => ({
          course_run_id: id,
          trainer_id: trainerId
        }));

        const { error: trainerError } = await supabase
          .from('course_run_trainers')
          .insert(trainerAssociations);

        if (trainerError) {
          console.error('Failed to update trainer associations:', trainerError);
        }
      }

      // Update schedules
      // First, delete existing schedules
      await supabase
        .from('course_run_schedules')
        .delete()
        .eq('course_run_id', id);

      // Then add new schedules if provided
      if (schedules && schedules.length > 0) {
        const schedulesToInsert = schedules.map(schedule => ({
          course_run_id: id,
          schedule_date: schedule.schedule_date,
          start_time: schedule.start_time,
          end_time: schedule.end_time
        }));

        const { error: scheduleError } = await supabase
          .from('course_run_schedules')
          .insert(schedulesToInsert);

        if (scheduleError) {
          console.error('Failed to update schedules:', scheduleError);
        }
      }
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-runs'] });
      setIsEditDialogOpen(false);
      setSelectedCourseRun(null);
      toast({
        title: 'Course run updated',
        description: 'The course run has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update course run',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete course run mutation
  const deleteCourseRunMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('course_runs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-runs'] });
      setIsDeleteDialogOpen(false);
      setSelectedCourseRun(null);
      toast({
        title: 'Course run deleted',
        description: 'The course run has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete course run',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Duplicate course run mutation
  const duplicateCourseRunMutation = useMutation({
    mutationFn: async (courseRun: AdminCourseRun) => {
      // Explicitly pick only the fields that should be duplicated
      const courseRunData = {
        course_id: courseRun.course_id,
        title: courseRun.title,
        start_date: courseRun.start_date,
        end_date: courseRun.end_date,
        start_time: courseRun.start_time,
        end_time: courseRun.end_time,
        location: courseRun.location,
        capacity: courseRun.capacity,
        price: courseRun.price,
        visibility: courseRun.visibility,
        registration_close_days: courseRun.registration_close_days,
      };
      
      // Create the duplicate course run
      const { data, error } = await supabase
        .from('course_runs')
        .insert(courseRunData)
        .select(`
          *,
          course:courses!course_runs_course_id_fkey (
            id,
            title,
            description,
            hrdc_program_code,
            category,
            created_at
          )
        `)
        .single();
      
      if (error) throw error;

      // Copy trainer associations if any
      if (courseRun.trainers && courseRun.trainers.length > 0) {
        const trainerAssociations = courseRun.trainers.map((trainer) => ({
          course_run_id: data.id,
          trainer_id: trainer.id
        }));

        const { error: trainerError } = await supabase
          .from('course_run_trainers')
          .insert(trainerAssociations);

        if (trainerError) {
          console.error('Failed to copy trainer associations:', trainerError);
        }
      }

      // Generate and update the registration URL
      try {
        const courseTitle = data.title || data.course?.title || 'course-run';
        const startDate = data.start_date || new Date().toISOString();
        
        const registrationUrl = await generateUniqueUrl(courseTitle, startDate);
        await updateCourseRunUrl(data.id, registrationUrl);
        
        return {
          ...data,
          registration_url: registrationUrl
        };
      } catch (urlError) {
        console.error('Failed to generate registration URL:', urlError);
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-runs'] });
      toast({
        title: 'Course run duplicated',
        description: 'The course run has been duplicated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to duplicate course run',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleAddCourseRun = (courseRunData: any, schedules: Partial<CourseRunSchedule>[]) => {
    console.log('Adding course run:', courseRunData);
    console.log('With schedules:', schedules);
    addCourseRunMutation.mutate({ courseRun: courseRunData, schedules });
  };

  const handleUpdateCourseRun = (courseRunData: any, schedules: Partial<CourseRunSchedule>[]) => {
    console.log('Updating course run:', courseRunData);
    console.log('With schedules:', schedules);
    updateCourseRunMutation.mutate({ courseRun: courseRunData, schedules });
  };

  const handleDeleteCourseRun = () => {
    if (selectedCourseRun) {
      deleteCourseRunMutation.mutate(selectedCourseRun.id);
    }
  };

  const openEditDialog = (courseRun: AdminCourseRun) => {
    // Transform trainers array to trainer_ids for the form
    const courseRunWithIds = {
      ...courseRun,
      trainer_ids: courseRun.trainers?.map(t => t.id) || []
    };
    setSelectedCourseRun(courseRunWithIds);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (courseRun: AdminCourseRun) => {
    setSelectedCourseRun(courseRun);
    setIsDeleteDialogOpen(true);
  };

  const handleDuplicateCourseRun = (courseRun: AdminCourseRun) => {
    duplicateCourseRunMutation.mutate(courseRun);
  };

  const handleAddClick = () => {
    console.log('Add Course Run button clicked - before state change, isAddDialogOpen:', isAddDialogOpen);
    setIsAddDialogOpen(true);
    console.log('Add Course Run button clicked - after state change called');
    setTimeout(() => {
      console.log('After timeout - isAddDialogOpen should be true');
    }, 100);
  };

  const handleCloseAddDialog = () => {
    console.log('Closing add dialog');
    setIsAddDialogOpen(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return '—';
    return `AED ${price.toFixed(2)}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Course Runs</h2>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => setShowBulkImport(!showBulkImport)}
                  variant={showBulkImport ? "default" : "outline"}
                  type="button"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" /> 
                  {showBulkImport ? 'Hide Import' : 'Bulk Import'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Import multiple course runs from Excel</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleAddClick}
                  className="bg-primary hover:bg-primary/90"
                  type="button"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Course Run
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create New Course Run</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {showBulkImport && (
        <div className="mb-6">
          <BulkCourseRunImport />
        </div>
      )}
      
      {!isLoading && courseRuns.length > 0 && (
        <CourseRunFilters 
          courseRuns={courseRuns} 
          onFilterChange={setFilteredCourseRuns} 
        />
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredCourseRuns.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h3 className="text-lg font-medium mb-2">No course runs found</h3>
          <p className="text-gray-500 mb-4">
            {courseRuns.length === 0 
              ? "Get started by adding your first course run."
              : "No course runs match your filters. Try adjusting your search criteria."}
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Course Run
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create New Course Run</p>
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
                <TableHead>Course</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Trainers</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Registration URL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourseRuns.map((courseRun) => (
                <TableRow key={courseRun.id}>
                  <TableCell className="font-medium">{courseRun.title || '—'}</TableCell>
                  <TableCell>{courseRun.course?.title || '—'}</TableCell>
                  <TableCell>{courseRun.location || '—'}</TableCell>
                  <TableCell>{formatDate(courseRun.start_date)}</TableCell>
                  <TableCell>{formatDate(courseRun.end_date)}</TableCell>
                  <TableCell>{formatPrice(courseRun.price)}</TableCell>
                  <TableCell>{courseRun.capacity || '—'}</TableCell>
                  <TableCell>
                    {courseRun.trainers && courseRun.trainers.length > 0
                      ? courseRun.trainers.map((trainer, idx) => (
                          <div key={trainer.id}>
                            {trainer.full_name}
                            {idx < courseRun.trainers!.length - 1 && ', '}
                          </div>
                        ))
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      courseRun.visibility === 'public' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {courseRun.visibility || 'public'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <RegistrationUrlField 
                      registrationUrl={courseRun.registration_url}
                      courseRunId={courseRun.id}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(courseRun)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Course Run</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDuplicateCourseRun(courseRun)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Duplicate Course Run</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(courseRun)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Course Run</p>
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

      {/* Add Course Run Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Course Run</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new course run.
            </DialogDescription>
          </DialogHeader>
          <CourseForm 
            onSubmit={handleAddCourseRun} 
            onCancel={handleCloseAddDialog} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit Course Run Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course Run</DialogTitle>
            <DialogDescription>
              Update the course run details.
            </DialogDescription>
          </DialogHeader>
          {selectedCourseRun && (
            <CourseForm 
              initialData={selectedCourseRun} 
              onSubmit={handleUpdateCourseRun} 
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        title="Delete Course Run"
        description={`Are you sure you want to delete this course run? This action cannot be undone.`}
        onConfirm={handleDeleteCourseRun}
      />
    </div>
  );
};

export default CourseRunManagement;
