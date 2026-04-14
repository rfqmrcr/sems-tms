import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, Copy, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: string[];
  filters: any[];
  chartType: string;
  isBuiltIn: boolean;
  createdAt: string;
  lastUsed?: string;
}

interface ReportTemplatesProps {
  onTemplateSelect: (template: ReportTemplate) => void;
}

const mockTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: 'Monthly Revenue Report',
    description: 'Comprehensive revenue analysis with payment status breakdown',
    category: 'Financial',
    fields: ['payment_amount', 'payment_status', 'registration_created', 'course_title'],
    filters: [],
    chartType: 'bar',
    isBuiltIn: true,
    createdAt: '2024-01-15',
    lastUsed: '2024-03-10'
  },
  {
    id: '2',
    name: 'Course Popularity Analysis',
    description: 'Track which courses are most popular by registration count',
    category: 'Analytics',
    fields: ['course_title', 'participant_count', 'registration_created'],
    filters: [],
    chartType: 'pie',
    isBuiltIn: true,
    createdAt: '2024-01-20',
    lastUsed: '2024-03-08'
  },
  {
    id: '3',
    name: 'Trainer Performance Report',
    description: 'Analyze trainer performance and course delivery metrics',
    category: 'Performance',
    fields: ['trainer_name', 'course_title', 'participant_count', 'course_start_date'],
    filters: [],
    chartType: 'line',
    isBuiltIn: true,
    createdAt: '2024-02-01'
  },
  {
    id: '4',
    name: 'Custom Registration Analysis',
    description: 'Custom report for registration patterns by organization',
    category: 'Custom',
    fields: ['organization_name', 'contact_person', 'participant_count'],
    filters: [],
    chartType: 'table',
    isBuiltIn: false,
    createdAt: '2024-03-01',
    lastUsed: '2024-03-05'
  }
];

const ReportTemplates: React.FC<ReportTemplatesProps> = ({ onTemplateSelect }) => {
  const categories = [...new Set(mockTemplates.map(t => t.category))];

  const handleTemplateAction = (action: string, template: ReportTemplate) => {
    switch (action) {
      case 'use':
        onTemplateSelect(template);
        toast({
          title: "Template Selected",
          description: `Using template: ${template.name}`,
        });
        break;
      case 'duplicate':
        toast({
          title: "Template Duplicated",
          description: `Created a copy of: ${template.name}`,
        });
        break;
      case 'edit':
        toast({
          title: "Edit Template",
          description: `Opening editor for: ${template.name}`,
        });
        break;
      case 'delete':
        if (!template.isBuiltIn) {
          toast({
            title: "Template Deleted",
            description: `Deleted template: ${template.name}`,
          });
        } else {
          toast({
            title: "Cannot Delete",
            description: "Built-in templates cannot be deleted.",
            variant: "destructive"
          });
        }
        break;
    }
  };

  return (
    <div className="space-y-6">
      {categories.map(category => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            {category} Reports
            <Badge variant="outline">{mockTemplates.filter(t => t.category === category).length}</Badge>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockTemplates
              .filter(template => template.category === category)
              .map(template => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <div className="flex gap-1">
                        {template.isBuiltIn && (
                          <Badge variant="secondary" className="text-xs">Built-in</Badge>
                        )}
                        <Badge variant="outline" className="text-xs capitalize">
                          {template.chartType}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">{template.description}</p>
                    
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Fields ({template.fields.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.slice(0, 3).map(field => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {template.fields.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.fields.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {template.lastUsed && (
                      <p className="text-xs text-gray-500">
                        Last used: {new Date(template.lastUsed).toLocaleDateString()}
                      </p>
                    )}

                    <div className="flex gap-1 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleTemplateAction('use', template)}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Use
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleTemplateAction('duplicate', template)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      
                      {!template.isBuiltIn && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleTemplateAction('edit', template)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleTemplateAction('delete', template)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportTemplates;