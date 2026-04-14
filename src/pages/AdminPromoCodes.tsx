import React from 'react';
import DashboardHeader from '@/components/admin/DashboardHeader';
import PromoCodeManagement from '@/components/admin/PromoCodeManagement';

const AdminPromoCodes: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <PromoCodeManagement />
      </main>
    </div>
  );
};

export default AdminPromoCodes;