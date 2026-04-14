import React, { useState } from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, Loader2, Mail, FileText, UserCheck, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import RegistrationEditDialog from './RegistrationEditDialog';
import RegistrationDeleteDialog from './RegistrationDeleteDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Registration {
  id: string;
  custom_registration_id: string | null;
  created_at: string;
  contact_name: string;
  company_name: string;
  email: string;
  phone: string;
  participant_count: number;
  course_id: string;
  course_name?: string;
  course_description?: string;
  course_start_date?: string | null;
  course_end_date?: string | null;
  course_price?: number;
  payment_amount: number;
  payment_status: string;
  payment_type?: string | null;
  hrdf_grant?: boolean;
  cme_sales_representative?: string | null;
  qbo_invoice_number?: string | null;
}

interface RegistrationsTableProps {
  registrations: Registration[];
  loading: boolean;
  onRegistrationUpdated: () => void;
  onSendEmail?: (registrationId: string) => Promise<void>;
  onGenerateInvoice?: (registrationId: string) => Promise<void>;
  onGenerateQuotation?: (registrationId: string) => Promise<void>;
  isSendingEmail?: boolean;
  isGeneratingInvoice?: boolean;
  isGeneratingQuotation?: boolean;
}

const RegistrationsTable: React.FC<RegistrationsTableProps> = ({ 
  registrations, 
  loading,
  onRegistrationUpdated,
  onSendEmail,
  onGenerateInvoice,
  onGenerateQuotation,
  isSendingEmail = false,
  isGeneratingInvoice = false,
  isGeneratingQuotation = false
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [emailInProgressId, setEmailInProgressId] = useState<string | null>(null);
  const [invoiceInProgressId, setInvoiceInProgressId] = useState<string | null>(null);
  const [quotationInProgressId, setQuotationInProgressId] = useState<string | null>(null);

  const getPaymentStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'unpaid':
      default:
        return <Badge className="bg-red-500">Unpaid</Badge>;
    }
  };

  const getHumanReadablePaymentType = (paymentType: string) => {
    const paymentTypeMap: { [key: string]: string } = {
      'bank_transfer': 'Bank Transfer',
      'online_payment': 'Online Payment',
      'cash': 'Cash',
      'check': 'Check',
      'credit_card': 'Credit Card',
      'debit_card': 'Debit Card'
    };
    
    return paymentTypeMap[paymentType] || paymentType || 'N/A';
  };

  const handleEditClick = (registration: Registration) => {
    setSelectedRegistration(registration);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (registration: Registration) => {
    setSelectedRegistration(registration);
    setDeleteDialogOpen(true);
  };

  const handleSendEmailClick = async (registration: Registration) => {
    if (onSendEmail) {
      setEmailInProgressId(registration.id);
      await onSendEmail(registration.id);
      setEmailInProgressId(null);
    }
  };

  const handleGenerateInvoiceClick = async (registration: Registration) => {
    if (onGenerateInvoice) {
      setInvoiceInProgressId(registration.id);
      await onGenerateInvoice(registration.id);
      setInvoiceInProgressId(null);
    }
  };

  const handleGenerateQuotationClick = async (registration: Registration) => {
    if (onGenerateQuotation) {
      setQuotationInProgressId(registration.id);
      await onGenerateQuotation(registration.id);
      setQuotationInProgressId(null);
    }
  };

  const formatCourseDates = (registration: Registration) => {
    if (!registration.course_start_date || !registration.course_end_date) {
      return 'N/A';
    }
    
    const startDate = format(new Date(registration.course_start_date), 'dd MMM yyyy');
    const endDate = format(new Date(registration.course_end_date), 'dd MMM yyyy');
    
    return `${startDate} - ${endDate}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrations</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No registrations to display yet.
          </div>
        ) : (
          <div className="max-h-[600px] overflow-auto rounded-md border">
            <Table className="relative">
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="bg-background">Reg ID</TableHead>
                  <TableHead className="bg-background">Registration Date</TableHead>
                  <TableHead className="bg-background">Time</TableHead>
                  <TableHead className="bg-background">Contact Person</TableHead>
                  <TableHead className="bg-background">Company</TableHead>
                  <TableHead className="bg-background">Course</TableHead>
                  <TableHead className="bg-background">Course Date</TableHead>
                  <TableHead className="bg-background">Participants</TableHead>
                  <TableHead className="bg-background">Payment Status</TableHead>
                  <TableHead className="bg-background">Payment Type</TableHead>
                  <TableHead className="bg-background">Amount</TableHead>
                  <TableHead className="bg-background">CME/Sales Rep</TableHead>
                  <TableHead className="bg-background">QBO Invoice #</TableHead>
                  <TableHead className="bg-background sticky right-0 shadow-[-4px_0_8px_rgba(0,0,0,0.1)]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-semibold">
                        {registration.custom_registration_id || 'Pending'}
                      </code>
                    </TableCell>
                    <TableCell>{format(new Date(registration.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{format(new Date(registration.created_at), 'h:mm a')}</TableCell>
                    <TableCell>{registration.contact_name}</TableCell>
                    <TableCell>{registration.company_name}</TableCell>
                    <TableCell>{registration.course_name}</TableCell>
                    <TableCell>{formatCourseDates(registration)}</TableCell>
                    <TableCell>{registration.participant_count}</TableCell>
                    <TableCell>{getPaymentStatusBadge(registration.payment_status)}</TableCell>
                    <TableCell>{getHumanReadablePaymentType(registration.payment_type || '')}</TableCell>
                    <TableCell>AED {registration.payment_amount.toFixed(2)}</TableCell>
                    <TableCell>{registration.cme_sales_representative || 'Not Assigned'}</TableCell>
                    <TableCell>{registration.qbo_invoice_number || 'N/A'}</TableCell>
                    <TableCell className="sticky right-0 bg-background shadow-[-4px_0_8px_rgba(0,0,0,0.1)]">
                      <div className="flex space-x-2">

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditClick(registration)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Registration</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteClick(registration)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete Registration</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {onSendEmail && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-500 hover:text-blue-700"
                                  onClick={() => handleSendEmailClick(registration)}
                                  disabled={isSendingEmail && emailInProgressId === registration.id}
                                >
                                  {isSendingEmail && emailInProgressId === registration.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Mail className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Send Confirmation Email</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {onGenerateQuotation && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-orange-500 hover:text-orange-700"
                                  onClick={() => handleGenerateQuotationClick(registration)}
                                  disabled={isGeneratingQuotation && quotationInProgressId === registration.id}
                                >
                                  {isGeneratingQuotation && quotationInProgressId === registration.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Receipt className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Generate Quotation</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        
                        {onGenerateInvoice && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-500 hover:text-green-700"
                                  onClick={() => handleGenerateInvoiceClick(registration)}
                                  disabled={isGeneratingInvoice && invoiceInProgressId === registration.id}
                                >
                                  {isGeneratingInvoice && invoiceInProgressId === registration.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <FileText className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Generate Invoice</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link to={`/admin/attendance?registration=${registration.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-purple-500 hover:text-purple-700"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Manage Attendance</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {selectedRegistration && (
        <>
          <RegistrationEditDialog
            registration={selectedRegistration}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSave={onRegistrationUpdated}
          />
          <RegistrationDeleteDialog
            registrationId={selectedRegistration.id}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onDelete={onRegistrationUpdated}
          />
        </>
      )}
    </Card>
  );
};

export default RegistrationsTable;
