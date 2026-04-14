import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, DollarSign, FileText, Calendar } from 'lucide-react';
import { ReportData } from '@/hooks/useReportsData';

interface SummaryStatsProps {
  data: ReportData;
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ data }) => {
  const stats = [
    {
      title: 'Total Registrations',
      value: data.summary.totalRegistrations,
      icon: FileText,
      trend: data.summary.registrationsTrend,
      color: 'text-primary'
    },
    {
      title: 'Total Participants',
      value: data.summary.totalParticipants,
      icon: Users,
      trend: data.summary.participantsTrend,
      color: 'text-green-600'
    },
    {
      title: 'Total Revenue',
      value: `AED ${data.summary.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      trend: data.summary.revenueTrend,
      color: 'text-emerald-600'
    },
    {
      title: 'Active Courses',
      value: data.summary.activeCourses,
      icon: Calendar,
      trend: data.summary.coursesTrend,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              {stat.title}
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{stat.value}</span>
              <div className={`flex items-center text-sm ${
                stat.trend >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {Math.abs(stat.trend)}%
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SummaryStats;