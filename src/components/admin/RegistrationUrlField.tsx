import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RegistrationUrlFieldProps {
  registrationUrl?: string;
  courseRunId: string;
}

const RegistrationUrlField: React.FC<RegistrationUrlFieldProps> = ({
  registrationUrl,
  courseRunId
}) => {
  const { toast } = useToast();

  const fullUrl = registrationUrl 
    ? `${window.location.origin}/register/${registrationUrl}`
    : '';

  const handleCopyUrl = async () => {
    if (!fullUrl) return;
    
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: "URL Copied",
        description: "Registration URL has been copied to clipboard",
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
      <div className="text-sm text-muted-foreground">
        No registration URL generated
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

export default RegistrationUrlField;