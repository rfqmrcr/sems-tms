
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/admin/DashboardHeader';
import AttendanceManager from '@/components/admin/AttendanceManager';
import { useSearchParams } from 'react-router-dom';

const AdminAttendance: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const registrationId = searchParams.get('registration');

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader userEmail={user?.email} />
      <div className="my-8">
        <h1 className="text-3xl font-bold mb-6">Attendance Management</h1>
        <p className="text-gray-600 mb-6">
          Track course attendance and collect trainee signatures for each class session.
        </p>
        
        {registrationId ? (
          <AttendanceManager registrationId={registrationId} />
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200">
            <h2 className="text-xl font-medium mb-4">Select a Registration</h2>
            <p>Please select a registration from the Registrations page to manage attendance.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendance;
