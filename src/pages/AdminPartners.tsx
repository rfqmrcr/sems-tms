import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/admin/DashboardHeader';
import PartnerManagement from '@/components/admin/PartnerManagement';

const AdminPartners: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader userEmail={user?.email} />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Partner Management</h1>
          <p className="text-muted-foreground">
            Manage partner organizations and their tier levels
          </p>
        </div>

        <PartnerManagement />
      </div>
    </div>
  );
};

export default AdminPartners;