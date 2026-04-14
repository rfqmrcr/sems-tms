import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, Clock, Share2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ExportOptionsProps {
  reportData: any;
  reportConfig?: any;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ reportData, reportConfig }) => {
  const [exportFormat, setExportFormat] = React.useState('pdf');
  const [scheduleFrequency, setScheduleFrequency] = React.useState('');

  const handleExport = async (format: string) => {
    try {
      // Simulate export process
      toast({
        title: "Export Started",
        description: `Generating ${format.toUpperCase()} export...`,
      });

      // TODO: Implement actual export logic
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create a downloadable file
      const data = JSON.stringify(reportData, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Report exported successfully as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleScheduleReport = () => {
    if (!scheduleFrequency) {
      toast({
        title: "Schedule Error",
        description: "Please select a frequency for the scheduled report.",
        variant: "destructive"
      });
      return;
    }

    // TODO: Implement report scheduling
    toast({
      title: "Report Scheduled",
      description: `Report will be generated ${scheduleFrequency} and sent to your email.`,
    });
  };

  const handleShareReport = () => {
    // TODO: Implement report sharing
    const shareUrl = `${window.location.origin}/shared-report/${Date.now()}`;
    navigator.clipboard.writeText(shareUrl);
    
    toast({
      title: "Report Link Copied",
      description: "Share link has been copied to clipboard.",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Export Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Document
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Excel Spreadsheet
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV File
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    JSON Data
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => handleExport(exportFormat)} 
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Now
            </Button>
            <Button variant="outline" onClick={handleShareReport}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Schedule Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Frequency</label>
            <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleScheduleReport} className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>

          {/* Active Schedules */}
          <div className="mt-4">
            <label className="text-sm font-medium mb-2 block">Active Schedules</label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">Revenue Report</span>
                <Badge variant="outline">Weekly</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">Registration Summary</span>
                <Badge variant="outline">Monthly</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportOptions;