import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/admin/DashboardHeader';
import EmailLogsTable from '@/components/admin/EmailLogsTable';

const AdminEmailLogs: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader userEmail={user?.email} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Email Logs</h1>
        <p className="text-muted-foreground">Track all emails sent by the system</p>
      </div>
      <EmailLogsTable />
    </div>
  );
};

export default AdminEmailLogs;