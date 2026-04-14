import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/admin/DashboardHeader';
import QuotationsTable from '@/components/admin/QuotationsTable';
import { useQuotationData } from '@/hooks/useQuotationData';
import { Button } from '@/components/ui/button';
import { Cog } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import TaxSettingsDialog from '@/components/admin/TaxSettingsDialog';

const AdminQuotations: React.FC = () => {
  const { user } = useAuth();
  const { quotations, loading, refreshQuotations } = useQuotationData();
  const [taxSettingsOpen, setTaxSettingsOpen] = useState(false);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader userEmail={user?.email} />
      <div className="my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Quotation Management</h1>
            <p className="text-gray-600">
              View, create, edit, and manage quotations for course registrations.
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTaxSettingsOpen(true)}
                >
                  <Cog className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tax Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <QuotationsTable 
          quotations={quotations} 
          loading={loading} 
          onQuotationUpdated={refreshQuotations}
        />
      </div>
      
      <TaxSettingsDialog
        open={taxSettingsOpen}
        onOpenChange={setTaxSettingsOpen}
      />
    </div>
  );
};

export default AdminQuotations;