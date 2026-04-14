
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, Loader2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Trainee } from '@/hooks/useTraineesData';
import TraineeEditDialog from './TraineeEditDialog';
import TraineeDeleteDialog from './TraineeDeleteDialog';
import TraineeViewDialog from './TraineeViewDialog';

interface TraineesTableProps {
  trainees: Trainee[];
  loading: boolean;
  onTraineeUpdated: () => void;
}

const TraineesTable: React.FC<TraineesTableProps> = ({
  trainees,
  loading,
  onTraineeUpdated
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);

  const getGenderBadge = (gender: string | null) => {
    if (!gender) return <Badge variant="outline">Not Specified</Badge>;
    
    switch(gender.toLowerCase()) {
      case 'male':
        return <Badge className="bg-blue-500">Male</Badge>;
      case 'female':
        return <Badge className="bg-pink-500">Female</Badge>;
      default:
        return <Badge className="bg-purple-500">{gender}</Badge>;
    }
  };

  const handleViewClick = (trainee: Trainee) => {
    setSelectedTrainee(trainee);
    setViewDialogOpen(true);
  };

  const handleEditClick = (trainee: Trainee) => {
    setSelectedTrainee(trainee);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (trainee: Trainee) => {
    setSelectedTrainee(trainee);
    setDeleteDialogOpen(true);
  };

  const formatCourseDates = (trainee: Trainee) => {
    if (!trainee.registration?.course_runs?.start_date || !trainee.registration?.course_runs?.end_date) {
      return null;
    }
    
    const startDate = format(new Date(trainee.registration.course_runs.start_date), 'dd MMM yyyy');
    const endDate = format(new Date(trainee.registration.course_runs.end_date), 'dd MMM yyyy');
    
    return `${startDate} - ${endDate}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trainees</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : trainees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No trainees to display yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>ID/NRIC</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Course Dates</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainees.map((trainee) => (
                  <TableRow key={trainee.id}>
                    <TableCell>
                      <Link 
                        to={`/admin/registrations`}
                        state={{ searchQuery: trainee.registration?.custom_registration_id }}
                        className="hover:underline"
                      >
                        <code className="text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80 transition-colors">
                          {trainee.registration?.custom_registration_id || 'N/A'}
                        </code>
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">{trainee.full_name}</TableCell>
                    <TableCell>{trainee.nric || 'N/A'}</TableCell>
                    <TableCell>{getGenderBadge(trainee.gender)}</TableCell>
                    <TableCell>{trainee.contact_number || 'N/A'}</TableCell>
                    <TableCell>{trainee.email || 'N/A'}</TableCell>
                    <TableCell>
                      {trainee.registration?.organization?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {trainee.registration?.course_runs?.courses?.title ? (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          {trainee.registration.course_runs.courses.title}
                        </Badge>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {formatCourseDates(trainee) || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewClick(trainee)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Trainee Details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditClick(trainee)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Trainee</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteClick(trainee)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete Trainee</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {selectedTrainee && (
        <>
          <TraineeViewDialog
            trainee={selectedTrainee}
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
          />
          <TraineeEditDialog
            trainee={selectedTrainee}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSave={onTraineeUpdated}
          />
          <TraineeDeleteDialog
            traineeId={selectedTrainee.id}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onDelete={onTraineeUpdated}
          />
        </>
      )}
    </Card>
  );
};

export default TraineesTable;
