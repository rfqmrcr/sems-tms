
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, Loader2, FileText, Plus } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Invoice } from '@/types/invoice';
import InvoiceEditDialog from './InvoiceEditDialog';
import InvoiceDeleteDialog from './InvoiceDeleteDialog';
import InvoiceViewDialog from './InvoiceViewDialog';
import InvoiceCreateDialog from './InvoiceCreateDialog';

interface InvoicesTableProps {
  invoices: Invoice[];
  loading: boolean;
  onInvoiceUpdated: () => void;
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({ 
  invoices, 
  loading,
  onInvoiceUpdated
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500">Overdue</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500">Cancelled</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  const handleViewClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const handleEditClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDeleteDialogOpen(true);
  };

  const handleCreateClick = () => {
    setCreateDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Invoices</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleCreateClick} className="ml-auto">
                <Plus className="mr-2 h-4 w-4" /> Create Invoice
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create New Invoice</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No invoices to display yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Registration Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoice_number}</TableCell>
                    <TableCell>{format(new Date(invoice.issue_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{format(new Date(invoice.due_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{invoice.registration?.contact_person || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>AED {invoice.total_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewClick(invoice)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Invoice</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditClick(invoice)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Invoice</p>
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
                                onClick={() => handleDeleteClick(invoice)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete Invoice</p>
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

      {selectedInvoice && (
        <>
          <InvoiceViewDialog
            invoice={selectedInvoice}
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
          />
          <InvoiceEditDialog
            invoice={selectedInvoice}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSave={onInvoiceUpdated}
          />
          <InvoiceDeleteDialog
            invoiceId={selectedInvoice.id}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onDelete={onInvoiceUpdated}
          />
        </>
      )}
      
      <InvoiceCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={onInvoiceUpdated}
      />
    </Card>
  );
};

export default InvoicesTable;
