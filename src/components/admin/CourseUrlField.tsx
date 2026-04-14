import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateUniqueCourseUrl, updateCourseUrl } from '@/services/courseUrlService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CourseUrlFieldProps {
  registrationUrl?: string;
  courseId: string;
  courseTitle?: string;
}

const CourseUrlField: React.FC<CourseUrlFieldProps> = ({
  registrationUrl,
  courseId,
  courseTitle
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate URL mutation
  const generateUrlMutation = useMutation({
    mutationFn: async () => {
      if (!courseTitle) throw new Error('Course title is required');
      const registrationUrl = await generateUniqueCourseUrl(courseTitle);
      await updateCourseUrl(courseId, registrationUrl);
      return registrationUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: 'URL Generated',
        description: 'Course registration URL has been generated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to generate URL',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const fullUrl = registrationUrl 
    ? `${window.location.origin}/course/${registrationUrl}`
    : '';

  const handleGenerateUrl = () => {
    generateUrlMutation.mutate();
  };

  const handleCopyUrl = async () => {
    if (!fullUrl) return;
    
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: "URL Copied",
        description: "Course registration URL has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleOpenUrl = () => {
    if (!fullUrl) return;
    window.open(fullUrl, '_blank');
  };

  if (!registrationUrl) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          No URL generated
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGenerateUrl}
          disabled={generateUrlMutation.isPending}
          className="px-2"
        >
          <Link className="h-4 w-4 mr-1" />
          {generateUrlMutation.isPending ? 'Generating...' : 'Generate URL'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={fullUrl}
        readOnly
        className="flex-1 text-sm"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCopyUrl}
        className="px-2"
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleOpenUrl}
        className="px-2"
      >
        <ExternalLink className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CourseUrlField;