import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PromoCode } from '@/hooks/usePromoCodeData';
import { format } from 'date-fns';
import PromoCodeCreateDialog from './PromoCodeCreateDialog';
import PromoCodeEditDialog from './PromoCodeEditDialog';
import PromoCodeDeleteDialog from './PromoCodeDeleteDialog';
import PromoCodeViewDialog from './PromoCodeViewDialog';

const PromoCodeManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [deletingPromoCode, setDeletingPromoCode] = useState<PromoCode | null>(null);
  const [viewingPromoCode, setViewingPromoCode] = useState<PromoCode | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch promo codes
  const { data: promoCodes = [], isLoading } = useQuery({
    queryKey: ['promo_codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PromoCode[];
    },
  });

  // Add promo code mutation
  const addPromoCodeMutation = useMutation({
    mutationFn: async (newPromoCode: Omit<PromoCode, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => {
      const { data, error } = await supabase
        .from('promo_codes')
        .insert({
          ...newPromoCode,
          usage_count: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo_codes'] });
      setShowCreateDialog(false);
      toast({
        title: 'Promo code created',
        description: 'The promo code has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create promo code: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update promo code mutation
  const updatePromoCodeMutation = useMutation({
    mutationFn: async (promoCode: PromoCode) => {
      const { id, created_at, updated_at, ...promoCodeData } = promoCode;
      const { data, error } = await supabase
        .from('promo_codes')
        .update(promoCodeData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo_codes'] });
      setEditingPromoCode(null);
      toast({
        title: 'Promo code updated',
        description: 'The promo code has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update promo code: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete promo code mutation
  const deletePromoCodeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo_codes'] });
      setDeletingPromoCode(null);
      toast({
        title: 'Promo code deleted',
        description: 'The promo code has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete promo code: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const filteredPromoCodes = promoCodes.filter(promoCode =>
    promoCode.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promoCode.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (promoCode.description && promoCode.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fixed_amount':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (isActive: boolean, validUntil: string) => {
    if (!isActive) return 'bg-red-100 text-red-800 border-red-200';
    
    const now = new Date();
    const endDate = new Date(validUntil);
    
    if (endDate < now) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatusText = (isActive: boolean, validUntil: string) => {
    if (!isActive) return 'Inactive';
    
    const now = new Date();
    const endDate = new Date(validUntil);
    
    if (endDate < now) return 'Expired';
    return 'Active';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Promo Code Management
              </CardTitle>
              <CardDescription>
                Manage promotional codes and discount campaigns
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Promo Code
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search promo codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading promo codes...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Filters</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromoCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No promo codes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPromoCodes.map((promoCode) => (
                      <TableRow key={promoCode.id}>
                        <TableCell className="font-mono font-medium">
                          {promoCode.code}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={getTypeColor(promoCode.type)}
                          >
                            {promoCode.type === 'fixed_amount' ? 'Fixed Amount' : 'Percentage'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {promoCode.type === 'percentage' ? `${promoCode.percentage}%` : promoCode.percentage}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>
                            {format(new Date(promoCode.valid_from), 'dd/MM/yyyy')} -
                          </div>
                          <div>
                            {format(new Date(promoCode.valid_until), 'dd/MM/yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {promoCode.usage_count}
                            {promoCode.usage_limit ? ` / ${promoCode.usage_limit}` : ' / ∞'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {promoCode.course_visibility_filter}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {promoCode.sponsorship_type_filter}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(promoCode.is_active, promoCode.valid_until)}
                          >
                            {getStatusText(promoCode.is_active, promoCode.valid_until)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewingPromoCode(promoCode)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditingPromoCode(promoCode)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeletingPromoCode(promoCode)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PromoCodeCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={(data) => addPromoCodeMutation.mutate(data)}
        isLoading={addPromoCodeMutation.isPending}
      />

      {editingPromoCode && (
        <PromoCodeEditDialog
          promoCode={editingPromoCode}
          open={!!editingPromoCode}
          onOpenChange={(open) => !open && setEditingPromoCode(null)}
          onSubmit={(data) => updatePromoCodeMutation.mutate(data)}
          isLoading={updatePromoCodeMutation.isPending}
        />
      )}

      {deletingPromoCode && (
        <PromoCodeDeleteDialog
          promoCode={deletingPromoCode}
          open={!!deletingPromoCode}
          onOpenChange={(open) => !open && setDeletingPromoCode(null)}
          onConfirm={() => deletePromoCodeMutation.mutate(deletingPromoCode.id)}
          isLoading={deletePromoCodeMutation.isPending}
        />
      )}

      {viewingPromoCode && (
        <PromoCodeViewDialog
          promoCode={viewingPromoCode}
          open={!!viewingPromoCode}
          onOpenChange={(open) => !open && setViewingPromoCode(null)}
        />
      )}
    </div>
  );
};

export default PromoCodeManagement;