
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/admin/DashboardHeader';
import StatsOverview from '@/components/admin/StatsOverview';
import RegistrationsTable from '@/components/admin/RegistrationsTable';
import { useDashboardData } from '@/hooks/useDashboardData';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { registrations, stats, loading, refreshRegistrations } = useDashboardData();
  
  useEffect(() => {
    console.log('AdminDashboard rendering with stats:', stats);
  }, [stats]);

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader userEmail={user?.email} />
      <StatsOverview stats={stats} />
      <RegistrationsTable 
        registrations={registrations} 
        loading={loading} 
        onRegistrationUpdated={refreshRegistrations}
      />
    </div>
  );
};

export default AdminDashboard;
