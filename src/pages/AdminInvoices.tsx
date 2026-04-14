
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/admin/DashboardHeader';
import InvoicesTable from '@/components/admin/InvoicesTable';
import { useInvoiceData } from '@/hooks/useInvoiceData';
import { Button } from '@/components/ui/button';
import { Cog } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import TaxSettingsDialog from '@/components/admin/TaxSettingsDialog';

const AdminInvoices: React.FC = () => {
  const { user } = useAuth();
  const { invoices, loading, refreshInvoices } = useInvoiceData();
  const [taxSettingsOpen, setTaxSettingsOpen] = useState(false);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader userEmail={user?.email} />
      <div className="my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Invoice Management</h1>
            <p className="text-gray-600">
              View, create, edit, and manage invoices for course registrations.
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  onClick={() => setTaxSettingsOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Cog className="h-4 w-4" />
                  <span>Tax Settings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configure Tax Rates & Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <InvoicesTable 
          invoices={invoices} 
          loading={loading} 
          onInvoiceUpdated={refreshInvoices}
        />
      </div>
      
      <TaxSettingsDialog
        open={taxSettingsOpen}
        onOpenChange={setTaxSettingsOpen}
      />
    </div>
  );
};

export default AdminInvoices;
