
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import DashboardHeader from '@/components/admin/DashboardHeader';
import RegistrationsTable from '@/components/admin/RegistrationsTable';
import RegistrationCreateDialog from '@/components/admin/RegistrationCreateDialog';
import { useRegistrationsData } from '@/hooks/useRegistrationsData';
import { toast } from '@/hooks/use-toast';
import { createInvoiceForRegistration } from '@/services/invoiceService';
import { createQuotationForRegistration } from '@/services/quotationService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminRegistrations: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { registrations, loading, refreshRegistrations } = useRegistrationsData();
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [isGeneratingQuotation, setIsGeneratingQuotation] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Set search query from navigation state if provided
  useEffect(() => {
    if (location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery);
    }
  }, [location.state]);
  
  const handleSendConfirmationEmail = async (registrationId: string) => {
    try {
      setIsSendingEmail(true);
      
      // Find the registration by ID
      const registration = registrations.find(reg => reg.id === registrationId);
      
      if (!registration) {
        throw new Error('Registration not found');
      }
      
      // Call the edge function to send the confirmation email
      const { error } = await supabase.functions.invoke('send-registration-email', {
        body: { 
          registrationId: registration.id,
          triggerPoint: 'registration' // Use 'registration' for confirmation emails
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Email Sent",
        description: "Confirmation email has been sent successfully.",
      });
      
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      toast({
        title: "Error Sending Email",
        description: (error as Error).message || "Failed to send confirmation email.",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleGenerateQuotation = async (registrationId: string) => {
    try {
      setIsGeneratingQuotation(true);
      
      // Find the registration by ID
      const registration = registrations.find(reg => reg.id === registrationId);
      
      if (!registration) {
        throw new Error('Registration not found');
      }
      
      // Create the quotation
      const quotation = await createQuotationForRegistration(
        registrationId,
        `Quotation for ${registration.course_name || 'course registration'}`
      );
      
      if (!quotation) {
        throw new Error('Failed to generate quotation');
      }
      
      toast({
        title: "Quotation Generated",
        description: `Quotation #${quotation?.quotation_number || 'New'} has been created successfully.`,
      });
      
      // Refresh registrations to show updated data
      refreshRegistrations();
      
    } catch (error) {
      console.error('Error generating quotation:', error);
      toast({
        title: "Error Generating Quotation",
        description: (error as Error).message || "Failed to generate quotation.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingQuotation(false);
    }
  };
  
  const handleGenerateInvoice = async (registrationId: string) => {
    try {
      setIsGeneratingInvoice(true);
      
      // Find the registration by ID
      const registration = registrations.find(reg => reg.id === registrationId);
      
      if (!registration) {
        throw new Error('Registration not found');
      }
      
      // Create the invoice using the invoice service with correct parameters
      const invoice = await createInvoiceForRegistration(
        registrationId,
        `Invoice for ${registration.course_name || 'course registration'}`
      );
      
      // Add null check for invoice
      if (!invoice) {
        throw new Error('Failed to generate invoice');
      }
      
      // Access invoice properties safely with optional chaining
      toast({
        title: "Invoice Generated",
        description: `Invoice #${invoice?.invoice_number || 'New'} has been created successfully.`,
      });
      
      // Refresh registrations to show updated data
      refreshRegistrations();
      
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: "Error Generating Invoice",
        description: (error as Error).message || "Failed to generate invoice.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  // Filter registrations based on search query
  const filteredRegistrations = useMemo(() => {
    if (!searchQuery.trim()) return registrations;

    const query = searchQuery.toLowerCase();
    return registrations.filter((reg) => {
      return (
        reg.id.toLowerCase().includes(query) ||
        (reg.custom_registration_id && reg.custom_registration_id.toLowerCase().includes(query)) ||
        reg.contact_name.toLowerCase().includes(query) ||
        reg.company_name.toLowerCase().includes(query) ||
        reg.email.toLowerCase().includes(query) ||
        (reg.course_name && reg.course_name.toLowerCase().includes(query))
      );
    });
  }, [registrations, searchQuery]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader userEmail={user?.email} />
      <div className="my-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Registrations Management</h1>
            <p className="text-gray-600">
              Manage course registrations, create quotations, generate invoices, and send notifications.
            </p>
          </div>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md shadow-sm"
            size="default"
          >
            <Plus className="h-4 w-4" />
            Add Registration
          </Button>
        </div>

        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by Registration ID, Name, Company, Email, or Course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <RegistrationsTable 
          registrations={filteredRegistrations} 
          loading={loading}
          onRegistrationUpdated={refreshRegistrations}
          onSendEmail={handleSendConfirmationEmail}
          onGenerateQuotation={handleGenerateQuotation}
          onGenerateInvoice={handleGenerateInvoice}
          isSendingEmail={isSendingEmail}
          isGeneratingQuotation={isGeneratingQuotation}
          isGeneratingInvoice={isGeneratingInvoice}
        />
      </div>
      
      <RegistrationCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={refreshRegistrations}
      />
    </div>
  );
};

export default AdminRegistrations;
