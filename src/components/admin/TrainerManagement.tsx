import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, Key, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import TrainerForm from './TrainerForm';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface Trainer {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  expertise?: string;
  bio?: string;
  resume_url?: string;
  is_active: boolean;
  user_id?: string | null;
  created_at: string;
  updated_at: string;
}

const TrainerManagement = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  const queryClient = useQueryClient();

  const { data: trainers, isLoading } = useQuery({
    queryKey: ['trainers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Trainer[];
    },
  });

  const addTrainerMutation = useMutation({
    mutationFn: async ({ trainerData, courseIds }: { trainerData: Omit<Trainer, 'id' | 'created_at' | 'updated_at'>, courseIds: string[] }) => {
      const { data, error } = await supabase
        .from('trainers')
        .insert([trainerData])
        .select()
        .single();

      if (error) throw error;

      // Add trainer-course relationships
      if (courseIds.length > 0) {
        const trainerCourses = courseIds.map(courseId => ({
          trainer_id: data.id,
          course_id: courseId
        }));
        
        const { error: tcError } = await supabase
          .from('trainer_courses')
          .insert(trainerCourses);
        
        if (tcError) throw tcError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      setIsAddDialogOpen(false);
      toast.success('Trainer added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add trainer: ' + error.message);
    },
  });

  const updateTrainerMutation = useMutation({
    mutationFn: async ({ trainerData, courseIds }: { trainerData: Trainer, courseIds: string[] }) => {
      const { data, error } = await supabase
        .from('trainers')
        .update(trainerData)
        .eq('id', trainerData.id)
        .select()
        .single();

      if (error) throw error;

      // Update trainer-course relationships
      // First, delete existing relationships
      await supabase
        .from('trainer_courses')
        .delete()
        .eq('trainer_id', trainerData.id);

      // Then insert new ones
      if (courseIds.length > 0) {
        const trainerCourses = courseIds.map(courseId => ({
          trainer_id: trainerData.id,
          course_id: courseId
        }));
        
        const { error: tcError } = await supabase
          .from('trainer_courses')
          .insert(trainerCourses);
        
        if (tcError) throw tcError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      setIsEditDialogOpen(false);
      setSelectedTrainer(null);
      toast.success('Trainer updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update trainer: ' + error.message);
    },
  });

  const deleteTrainerMutation = useMutation({
    mutationFn: async (trainerId: string) => {
      const { error } = await supabase
        .from('trainers')
        .delete()
        .eq('id', trainerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      setIsDeleteDialogOpen(false);
      setSelectedTrainer(null);
      toast.success('Trainer deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete trainer: ' + error.message);
    },
  });

  const filteredTrainers = trainers?.filter(trainer =>
    trainer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.expertise?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateAccount = async (trainer: Trainer) => {
    if (!trainer.email) {
      toast.error('Trainer must have an email address to create an account');
      return;
    }

    if (trainer.user_id) {
      toast.error('This trainer already has a login account');
      return;
    }

    setIsCreatingAccount(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-trainer-account', {
        body: {
          trainerId: trainer.id,
          email: trainer.email,
          fullName: trainer.full_name,
        },
      });

      if (error) throw error;

      setCreatedPassword(data.temporaryPassword);
      setShowPasswordDialog(true);
      setPasswordCopied(false);
      
      // Refresh trainers list
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      
      toast.success('Trainer account created successfully!');
    } catch (error: any) {
      console.error('Error creating trainer account:', error);
      toast.error(error.message || 'Failed to create trainer account');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const copyPassword = () => {
    if (createdPassword) {
      navigator.clipboard.writeText(createdPassword);
      setPasswordCopied(true);
      toast.success('Password copied to clipboard');
      setTimeout(() => setPasswordCopied(false), 3000);
    }
  };

  if (isLoading) {
    return <div>Loading trainers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Trainer Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Trainer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Trainer</DialogTitle>
            </DialogHeader>
            <TrainerForm
              onSubmit={(data, courseIds) => addTrainerMutation.mutate({ trainerData: data, courseIds })}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trainers</CardTitle>
          <Input
            placeholder="Search trainers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrainers.map((trainer) => (
                <TableRow key={trainer.id}>
                  <TableCell className="font-medium">{trainer.full_name}</TableCell>
                  <TableCell>{trainer.email || '-'}</TableCell>
                  <TableCell>{trainer.phone || '-'}</TableCell>
                  <TableCell>{trainer.expertise || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={trainer.is_active ? 'default' : 'secondary'}>
                      {trainer.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {trainer.user_id ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        ✓ Has Account
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateAccount(trainer)}
                        disabled={isCreatingAccount || !trainer.email}
                        className="gap-2"
                      >
                        <Key className="w-3 h-3" />
                        Create Login
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(trainer)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(trainer)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Trainer</DialogTitle>
          </DialogHeader>
          {selectedTrainer && (
            <TrainerForm
              initialData={selectedTrainer}
              onSubmit={(data, courseIds) => updateTrainerMutation.mutate({ 
                trainerData: {
                  ...data, 
                  id: selectedTrainer.id,
                  created_at: selectedTrainer.created_at,
                  updated_at: selectedTrainer.updated_at
                },
                courseIds
              })}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedTrainer(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setSelectedTrainer(null);
        }}
        onConfirm={() => selectedTrainer && deleteTrainerMutation.mutate(selectedTrainer.id)}
        title="Delete Trainer"
        description={`Are you sure you want to delete ${selectedTrainer?.full_name}? This action cannot be undone.`}
      />

      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Trainer Account Created Successfully!</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                The trainer account has been created and a credentials email has been sent.
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">Temporary Password:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-background px-3 py-2 rounded border text-lg font-mono">
                    {createdPassword}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPassword}
                    className="shrink-0"
                  >
                    {passwordCopied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                ⚠️ Save this password now - it won't be shown again. The trainer will be required to change it on first login.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowPasswordDialog(false)}>
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TrainerManagement;