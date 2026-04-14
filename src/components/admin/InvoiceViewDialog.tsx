
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Invoice } from '@/types/invoice';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { supabase } from '@/integrations/supabase/client';

interface InvoiceViewDialogProps {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Trainee {
  id: string;
  full_name: string;
  nric?: string | null;
}

const InvoiceViewDialog: React.FC<InvoiceViewDialogProps> = ({
  invoice,
  open,
  onOpenChange,
}) => {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch trainees when invoice changes
  useEffect(() => {
    const fetchTrainees = async () => {
      if (invoice?.registration_id && open) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('trainees')
            .select('id, full_name, nric')
            .eq('registration_id', invoice.registration_id);
            
          if (error) throw error;
          setTrainees(data || []);
        } catch (error) {
          console.error('Error fetching trainees:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchTrainees();
  }, [invoice?.registration_id, open]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'overdue':
        return 'text-red-600';
      case 'cancelled':
        return 'text-gray-600';
      default:
        return '';
    }
  };

  // Add print functionality
  const handlePrint = () => {
    const printContent = document.getElementById('invoice-print-content');
    const originalContent = document.body.innerHTML;
    
    if (printContent) {
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContent;
      // Reload the page to restore event listeners
      window.location.reload();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>Full summary of the invoice, registration and participants.</DialogDescription>
        </DialogHeader>
        
        <div id="invoice-print-content" className="p-4">
          {/* Header */}
          <div className="flex justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">INVOICE</h1>
              <p className={`text-lg font-semibold ${getStatusColor(String(invoice.status || 'pending'))}`}>
                #{String(invoice.invoice_number || 'N/A')} - {String(invoice.status || 'pending').toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold">SEMS Training</p>
              <p>Dubai Healthcare City</p>
              <p>Dubai, United Arab Emirates</p>
            </div>
          </div>
          
          {/* Dates */}
          <div className="flex justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">BILL TO:</p>
            <p className="font-bold">
              {(invoice.registration as any)?.organization?.name || 'N/A'}
            </p>
            <p>Contact: {invoice.registration?.contact_person || 'N/A'}</p>
            <p>Email: {invoice.registration?.contact_email || 'N/A'}</p>
          </div>
            <div className="text-right">
              <div className="mb-2">
                <p className="text-sm text-gray-500">INVOICE DATE</p>
                <p>{formatDate(invoice.issue_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">DUE DATE</p>
                <p>{formatDate(invoice.due_date)}</p>
              </div>
            </div>
          </div>
          
          {/* Service */}
          <div className="mb-6">
            <Card>
              <CardContent className="p-0">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-6 py-4">
                        <p className="font-medium">
                          {String((invoice.registration as any)?.course_runs?.title || (invoice.registration as any)?.course_runs?.courses?.title || 'Training Course')}
                        </p>
                        {(invoice.registration as any)?.course_runs?.start_date && (
                          <p className="text-sm text-gray-500">
                            Date: {formatDate(String((invoice.registration as any).course_runs.start_date))}
                            {(invoice.registration as any).course_runs.end_date &&
                              ` - ${formatDate(String((invoice.registration as any).course_runs.end_date))}`}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        AED {Number(invoice.subtotal || 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
          
          {/* Summary */}
          <div className="flex justify-end mb-6">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span>Subtotal</span>
                <span>AED {Number(invoice.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({Number(invoice.tax_rate || 0)}%):</span>
                <span>AED {Number(invoice.tax_amount || 0).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>AED {Number(invoice.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Trainees */}
          {trainees.length > 0 && (
            <div className="mb-6">
              <p className="font-semibold mb-2">Participants:</p>
              <Card>
                <CardContent className="p-4">
                  <ul className="list-decimal pl-5">
                    {trainees.map(trainee => (
                      <li key={trainee.id} className="mb-1">
                        {trainee.full_name} {trainee.nric && `(${trainee.nric})`}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Notes */}
          {invoice.notes && (
            <div className="mb-6">
              <p className="text-sm text-gray-500">NOTES:</p>
              <p className="whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
          
          {/* Footer */}
          <div className="text-center text-gray-500 text-sm mt-8">
            <p>Thank you for your business!</p>
            <p>For any inquiries, please contact finance@sems.ae</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            Print Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceViewDialog;
