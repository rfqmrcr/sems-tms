
import React from 'react';
import StatCard from './StatCard';
import { Users, Calendar, FileText, DollarSign, AlertTriangle } from 'lucide-react';

interface StatsProps {
  stats: {
    totalRegistrations: number;
    totalParticipants: number;
    upcomingSessions: number;
    totalRevenue: number;
    totalPaymentDue: number;
  };
}

const StatsOverview: React.FC<StatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <StatCard 
        title="Total Registrations" 
        value={stats.totalRegistrations} 
        Icon={<FileText className="h-8 w-8 text-indigo-600 mr-3" />}
        description="Across all courses"
      />
      <StatCard 
        title="Participants" 
        value={stats.totalParticipants} 
        Icon={<Users className="h-8 w-8 text-primary mr-3" />}
        description="Enrolled in programs"
      />
      <StatCard 
        title="Upcoming Sessions" 
        value={stats.upcomingSessions} 
        Icon={<Calendar className="h-8 w-8 text-emerald-600 mr-3" />}
        description="Scheduled courses"
      />
      <StatCard 
        title="Total Revenue" 
        value={stats.totalRevenue}
        Icon={<DollarSign className="h-8 w-8 text-green-600 mr-3" />}
        description="From all registrations"
        isMonetary
      />
      <StatCard 
        title="Payment Due" 
        value={stats.totalPaymentDue}
        Icon={<AlertTriangle className="h-8 w-8 text-red-600 mr-3" />}
        description="Unpaid registrations"
        isMonetary
      />
    </div>
  );
};

export default StatsOverview;
