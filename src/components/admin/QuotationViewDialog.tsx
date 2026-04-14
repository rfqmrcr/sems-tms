import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Quotation } from '@/types/quotation';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { supabase } from '@/integrations/supabase/client';

interface QuotationViewDialogProps {
  quotation: Quotation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Trainee {
  id: string;
  full_name: string;
  nric?: string | null;
}

const QuotationViewDialog: React.FC<QuotationViewDialogProps> = ({
  quotation,
  open,
  onOpenChange,
}) => {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch trainees when quotation changes
  useEffect(() => {
    const fetchTrainees = async () => {
      if (quotation?.registration_id && open) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('trainees')
            .select('id, full_name, nric')
            .eq('registration_id', quotation.registration_id);
            
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
  }, [quotation?.registration_id, open]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'accepted':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'rejected':
        return 'text-red-600';
      case 'expired':
        return 'text-gray-600';
      case 'converted':
        return 'text-blue-600';
      default:
        return '';
    }
  };

  // Add print functionality
  const handlePrint = () => {
    const printContent = document.getElementById('quotation-print-content');
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
          <DialogTitle>Quotation Details</DialogTitle>
        </DialogHeader>
        
        <div id="quotation-print-content" className="p-6 bg-white">
          {/* Company Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">SEMS</h1>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Dubai Healthcare City</p>
                <p>Dubai, United Arab Emirates</p>
                <p>+971 4 123 4567</p>
                <p>https://www.sems.ae/</p>
                <p>VAT Registration No.: TBD</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <img 
                src="/lovable-uploads/c3d04f54-1e19-4d37-bdf5-f11e1671a76a.png" 
                alt="SEMS Logo" 
                className="h-16 w-auto"
              />
            </div>
          </div>

          {/* Quotation Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-light text-gray-400 mb-4">Quotation</h2>
          </div>

          {/* Address and Quotation Details */}
          <div className="flex justify-between mb-8">
            <div className="flex-1">
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">ADDRESS</h3>
                <div className="text-sm text-gray-900">
                  <p className="font-medium">{quotation.registration?.organization?.name || 'N/A'}</p>
                  <p>Address: {quotation.registration?.organization?.name ? 'Contact for address' : 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">IN-CHARGE</h3>
                <p className="text-sm text-gray-900">{quotation.registration?.contact_person || 'N/A'}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">QUOTATION</h3>
                <p className="text-sm text-gray-900 font-medium">{quotation.quotation_number}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">DATE</h3>
                <p className="text-sm text-gray-900">{format(new Date(quotation.issue_date), 'dd.MM.yyyy')}</p>
              </div>
            </div>
          </div>
          
          {/* Activity Table */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">ACTIVITY</th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">QTY</th>
                  <th className="border border-gray-300 px-4 py-3 text-right text-sm font-medium text-gray-700">RATE</th>
                  <th className="border border-gray-300 px-4 py-3 text-right text-sm font-medium text-gray-700">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-6 align-top">
                    <div className="font-medium text-gray-900 mb-2">
                      {quotation.registration?.courses?.title || 'Training Course'}
                    </div>
                    {quotation.registration?.courses?.start_date && (
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Course Date: {format(new Date(quotation.registration.courses.start_date), 'dd/MM/yyyy')}
                        {quotation.registration.courses.end_date && 
                          ` - ${format(new Date(quotation.registration.courses.end_date), 'dd/MM/yyyy')}`}</p>
                        <p>Time: 9:00am - 6:00pm ({quotation.registration.courses.end_date ? '2 Days' : '1 Day'})</p>
                        <p>Venue: SEMS Training Centre, Dubai Healthcare City, Dubai, United Arab Emirates.</p>
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-6 text-center text-sm">
                    {trainees.length || 1}
                  </td>
                  <td className="border border-gray-300 px-4 py-6 text-right text-sm">
                    {(quotation.subtotal / (trainees.length || 1)).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-6 text-right text-sm font-medium">
                    {quotation.subtotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Terms & Conditions */}
          <div className="mb-8">
            <div className="text-sm text-gray-600 space-y-2">
              <p className="font-medium text-gray-700">Terms & Conditions:</p>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <p>1. Quotation Validity: Valid for 30 days from issuance.</p>
                <p>2. Class Confirmation: Confirmation attendance at least 14 days before course date.</p>
                <p>3. Rescheduling: Changes must be made 14 days in advance; AED 300 admin fee applies.</p>
                <p>4. Cancellations: Fully chargeable if cancelled within 14 days of course.</p>
                <p>5. Same-Day Requests: No charges allowed; full fee applies.</p>
                <p>6. No-Show:</p>
                <p>   a) With valid reason: Full fee applies, rescheduling allowed.</p>
                <p>   b) Without valid reason: Full fee applies; replacement allowed with prior notice.</p>
                <p>7. Payment: Full payment required before training, unless agreed otherwise.</p>
                <p>8. eBook: If AHA eBook is redeemed and participant cancels, only the eBook cost (as per AHA rate) will be charged.</p>
                <p>9. Governing Law: Subject to UAE law.</p>
              </div>
            </div>
          </div>

          {/* Summary Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span>SUBTOTAL</span>
                  <span>{quotation.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span>TAX TOTAL</span>
                  <span>{quotation.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 text-xl font-bold">
                  <span>TOTAL</span>
                  <span>AED {quotation.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Summary */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-4">TAX SUMMARY</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">RATE</th>
                  <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">TAX</th>
                  <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">NET</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                    VAT @ {quotation.tax_rate}%
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                    {quotation.tax_amount.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                    {quotation.subtotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
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
          {quotation.notes && (
            <div className="mb-6">
              <p className="text-sm text-gray-500">NOTES:</p>
              <p className="whitespace-pre-line">{quotation.notes}</p>
            </div>
          )}
          
          {/* Footer */}
          <div className="text-center text-gray-500 text-sm mt-8">
            <p>This quotation is valid until {formatDate(quotation.valid_until)}</p>
            <p>For any inquiries, please contact finance@sems.ae</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            Print Quotation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationViewDialog;