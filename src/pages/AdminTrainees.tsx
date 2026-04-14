
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/admin/DashboardHeader';
import TraineesTable from '@/components/admin/TraineesTable';
import { useTraineesData } from '@/hooks/useTraineesData';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { format } from 'date-fns';

const AdminTrainees: React.FC = () => {
  const { user } = useAuth();
  const { trainees, loading, refreshTrainees } = useTraineesData();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredTrainees = trainees.filter(trainee => {
    const searchLower = searchQuery.toLowerCase();
    
    // Format dates for search
    let startDateFormatted = '';
    let endDateFormatted = '';
    if (trainee.registration?.course_runs?.start_date) {
      try {
        const startDate = new Date(trainee.registration.course_runs.start_date);
        startDateFormatted = format(startDate, 'd MMM yyyy').toLowerCase(); // "28 Oct 2025"
      } catch (e) {
        // Invalid date, ignore
      }
    }
    if (trainee.registration?.course_runs?.end_date) {
      try {
        const endDate = new Date(trainee.registration.course_runs.end_date);
        endDateFormatted = format(endDate, 'd MMM yyyy').toLowerCase(); // "28 Oct 2025"
      } catch (e) {
        // Invalid date, ignore
      }
    }
    
    return (
      trainee.full_name.toLowerCase().includes(searchLower) ||
      (trainee.email && trainee.email.toLowerCase().includes(searchLower)) ||
      (trainee.nric && trainee.nric.toLowerCase().includes(searchLower)) ||
      (trainee.registration?.custom_registration_id && 
        trainee.registration.custom_registration_id.toLowerCase().includes(searchLower)) ||
      (trainee.registration?.organization?.name && 
        trainee.registration.organization.name.toLowerCase().includes(searchLower)) ||
      (trainee.registration?.course_runs?.courses?.title && 
        trainee.registration.course_runs.courses.title.toLowerCase().includes(searchLower)) ||
      (trainee.registration?.course_runs?.start_date && 
        trainee.registration.course_runs.start_date.toLowerCase().includes(searchLower)) ||
      (trainee.registration?.course_runs?.end_date && 
        trainee.registration.course_runs.end_date.toLowerCase().includes(searchLower)) ||
      startDateFormatted.includes(searchLower) ||
      endDateFormatted.includes(searchLower)
    );
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader userEmail={user?.email} />
      <div className="my-8">
        <h1 className="text-3xl font-bold mb-6">Trainees Management</h1>
        <p className="text-gray-600 mb-6">
          View and manage participant information for all registered courses.
        </p>
        
        <div className="flex items-center mb-6 relative">
          <Search className="absolute left-3 text-gray-400" size={18} />
          <Input
            placeholder="Search trainees by name, email, NRIC, registration ID, organization, course or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
        
        <TraineesTable 
          trainees={filteredTrainees} 
          loading={loading}
          onTraineeUpdated={refreshTrainees}
        />
      </div>
    </div>
  );
};

export default AdminTrainees;
