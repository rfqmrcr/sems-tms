import React, { useState } from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, Loader2, FileText, Plus, Receipt } from 'lucide-react';
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
import { Quotation } from '@/types/quotation';
import QuotationEditDialog from './QuotationEditDialog';
import QuotationDeleteDialog from './QuotationDeleteDialog';
import QuotationViewDialog from './QuotationViewDialog';
import QuotationCreateDialog from './QuotationCreateDialog';
import QuotationConvertDialog from './QuotationConvertDialog';

interface QuotationsTableProps {
  quotations: Quotation[];
  loading: boolean;
  onQuotationUpdated: () => void;
}

const QuotationsTable: React.FC<QuotationsTableProps> = ({ 
  quotations, 
  loading,
  onQuotationUpdated
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'accepted':
        return <Badge className="bg-green-500">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'expired':
        return <Badge className="bg-gray-500">Expired</Badge>;
      case 'converted':
        return <Badge className="bg-blue-500">Converted</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  const handleViewClick = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setViewDialogOpen(true);
  };

  const handleEditClick = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setDeleteDialogOpen(true);
  };

  const handleConvertClick = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setConvertDialogOpen(true);
  };

  const handleCreateClick = () => {
    setCreateDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Quotations</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleCreateClick} className="ml-auto">
                <Plus className="mr-2 h-4 w-4" /> Create Quotation
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create New Quotation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : quotations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No quotations to display yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quotation #</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Registration Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell>{quotation.quotation_number}</TableCell>
                    <TableCell>{format(new Date(quotation.issue_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{format(new Date(quotation.valid_until), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{quotation.registration?.contact_person || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(quotation.status)}</TableCell>
                    <TableCell>AED {quotation.total_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewClick(quotation)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Quotation</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditClick(quotation)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Quotation</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {quotation.status === 'accepted' && !quotation.converted_to_invoice_id && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-blue-500 hover:text-blue-700"
                                  onClick={() => handleConvertClick(quotation)}
                                >
                                  <Receipt className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Convert to Invoice</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteClick(quotation)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete Quotation</p>
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

      {selectedQuotation && (
        <>
          <QuotationViewDialog
            quotation={selectedQuotation}
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
          />
          <QuotationEditDialog
            quotation={selectedQuotation}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSave={onQuotationUpdated}
          />
          <QuotationDeleteDialog
            quotationId={selectedQuotation.id}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onDelete={onQuotationUpdated}
          />
          <QuotationConvertDialog
            quotation={selectedQuotation}
            open={convertDialogOpen}
            onOpenChange={setConvertDialogOpen}
            onConverted={onQuotationUpdated}
          />
        </>
      )}
      
      <QuotationCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={onQuotationUpdated}
      />
    </Card>
  );
};

export default QuotationsTable;