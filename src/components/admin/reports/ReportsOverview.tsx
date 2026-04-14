import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RegistrationChart from './RegistrationChart';
import RevenueChart from './RevenueChart';
import CoursePopularityChart from './CoursePopularityChart';
import SummaryStats from './SummaryStats';
import { ReportData } from '@/hooks/useReportsData';

interface ReportsOverviewProps {
  data: ReportData;
  loading: boolean;
  reportType: string;
}

const ReportsOverview: React.FC<ReportsOverviewProps> = ({ data, loading, reportType }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SummaryStats data={data} />
      
      <Tabs defaultValue="registrations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="registrations">Registration Trends</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="courses">Course Popularity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="registrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registration Trends</CardTitle>
              <CardDescription>
                Registration patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegistrationChart data={data.registrationTrends} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
              <CardDescription>
                Revenue breakdown and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={data.revenueData} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Popularity</CardTitle>
              <CardDescription>
                Most popular courses by registration count
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CoursePopularityChart data={data.coursePopularity} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsOverview;