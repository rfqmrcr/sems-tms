import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/admin/DashboardHeader';
import ReportsOverview from '@/components/admin/reports/ReportsOverview';
import ReportFilters from '@/components/admin/reports/ReportFilters';
import CustomReportBuilder, { ReportConfig } from '@/components/admin/reports/CustomReportBuilder';
import ExportOptions from '@/components/admin/reports/ExportOptions';
import ReportTemplates from '@/components/admin/reports/ReportTemplates';
import ComparisonAnalysis from '@/components/admin/reports/ComparisonAnalysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useReportsData } from '@/hooks/useReportsData';
import { BarChart3, Settings, Download, Layers, TrendingUp } from 'lucide-react';

const AdminReports: React.FC = () => {
  const { user } = useAuth();
  const { 
    data, 
    loading, 
    dateRange, 
    setDateRange, 
    reportType, 
    setReportType,
    refreshData 
  } = useReportsData();

  const [customReportConfig, setCustomReportConfig] = useState<ReportConfig | null>(null);

  const handleCustomReportGenerated = (config: ReportConfig) => {
    setCustomReportConfig(config);
    // TODO: Generate report based on config
  };

  const handleTemplateSelect = (template: any) => {
    // TODO: Load template configuration
    console.log('Selected template:', template);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader userEmail={user?.email} />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
            <p className="text-muted-foreground">
              Generate comprehensive reports and analyze your training business data
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Custom Builder
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Comparison
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export & Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ReportFilters
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              reportType={reportType}
              onReportTypeChange={setReportType}
              onRefresh={refreshData}
            />
            <ReportsOverview 
              data={data} 
              loading={loading} 
              reportType={reportType}
            />
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <CustomReportBuilder onReportGenerated={handleCustomReportGenerated} />
            
            {customReportConfig && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Report: {customReportConfig.name}</CardTitle>
                  <CardDescription>
                    Custom report with {customReportConfig.fields.length} fields
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Report generation complete. Data visualization will appear here.
                  </p>
                  {/* TODO: Render actual custom report based on config */}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>
                  Use pre-built report templates or create your own custom templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportTemplates onTemplateSelect={handleTemplateSelect} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <ComparisonAnalysis data={data} />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <ExportOptions reportData={data} reportConfig={customReportConfig} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminReports;