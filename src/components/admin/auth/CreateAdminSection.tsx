
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface CreateAdminSectionProps {
  email: string;
  password: string;
  isLoading: boolean;
  onCreateAdmin: () => void;
}

const CreateAdminSection: React.FC<CreateAdminSectionProps> = ({
  email,
  password,
  isLoading,
  onCreateAdmin
}) => {
  const handleCreateAdmin = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in both email and password to create an admin account",
        variant: "destructive",
      });
      return;
    }
    onCreateAdmin();
  };

  return (
    <div className="flex justify-center w-full pt-2">
      <Button variant="outline" size="sm" onClick={handleCreateAdmin} disabled={isLoading}>
        Create Admin Account
      </Button>
    </div>
  );
};

export default CreateAdminSection;
