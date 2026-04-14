
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/admin/DashboardHeader';
import StatsOverview from '@/components/admin/StatsOverview';
import RegistrationsTable from '@/components/admin/RegistrationsTable';
import { useDashboardData } from '@/hooks/useDashboardData';
import { seedDatabase } from '@/lib/seedDatabase';
import { toast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { registrations, stats, loading, refreshRegistrations } = useDashboardData();
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    console.log('AdminDashboard rendering with stats:', stats);
  }, [stats]);

  const handleSeedDatabase = async () => {
    setSeeding(true);
    const result = await seedDatabase();
    toast({
      title: result.success ? 'Database Seeded!' : 'Seed Info',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
    if (result.success) {
      refreshRegistrations();
    }
    setSeeding(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader userEmail={user?.email} />

      {/* One-time seed button - use only on first run */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleSeedDatabase}
          disabled={seeding}
          className="text-sm px-4 py-2 rounded-md border border-dashed border-gray-400 text-gray-500 hover:text-gray-800 hover:border-gray-600 transition disabled:opacity-50"
        >
          {seeding ? 'Seeding...' : '🌱 Seed Initial Data (First Run Only)'}
        </button>
      </div>

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
