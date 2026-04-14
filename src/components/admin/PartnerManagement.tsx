import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Building2 } from 'lucide-react';
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
import { Partner } from '@/types/partner';
import PartnerCreateDialog from './PartnerCreateDialog';
import PartnerEditDialog from './PartnerEditDialog';
import PartnerDeleteDialog from './PartnerDeleteDialog';
import PartnerViewDialog from './PartnerViewDialog';

const PartnerManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null);
  const [viewingPartner, setViewingPartner] = useState<Partner | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch partners
  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Partner[];
    },
  });

  // Add partner mutation
  const addPartnerMutation = useMutation({
    mutationFn: async (newPartner: Omit<Partner, 'id' | 'created_at' | 'updated_at' | 'partner_code'>) => {
      // Generate partner code
      const { data: partnerCode, error: codeError } = await supabase
        .rpc('generate_partner_code', { partner_name: newPartner.name });

      if (codeError) throw codeError;

      const { data, error } = await supabase
        .from('partners')
        .insert({
          ...newPartner,
          partner_code: partnerCode
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      setShowCreateDialog(false);
      toast({
        title: 'Partner created',
        description: 'The partner has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create partner: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update partner mutation
  const updatePartnerMutation = useMutation({
    mutationFn: async (partner: Partner) => {
      const { id, created_at, updated_at, partner_code, ...partnerData } = partner;
      const { data, error } = await supabase
        .from('partners')
        .update(partnerData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      setEditingPartner(null);
      toast({
        title: 'Partner updated',
        description: 'The partner has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update partner: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete partner mutation
  const deletePartnerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      setDeletingPartner(null);
      toast({
        title: 'Partner deleted',
        description: 'The partner has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete partner: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const filteredPartners = partners.filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.partner_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Tier 1':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Tier 2':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Tier 3':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Partner Management
              </CardTitle>
              <CardDescription>
                Manage partner organizations and their tier levels
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Partner
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading partners...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner Code</TableHead>
                    <TableHead>Organization Name</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contact Number</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No partners found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPartners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell className="font-mono font-medium">
                          {partner.partner_code}
                        </TableCell>
                        <TableCell className="font-medium">{partner.name}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={getTierColor(partner.tier)}
                          >
                            {partner.tier}
                          </Badge>
                        </TableCell>
                        <TableCell>{partner.contact_person_1}</TableCell>
                        <TableCell>{partner.email}</TableCell>
                        <TableCell>{partner.contact_number_1}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewingPartner(partner)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditingPartner(partner)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeletingPartner(partner)}
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
      <PartnerCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={(data) => addPartnerMutation.mutate(data)}
        isLoading={addPartnerMutation.isPending}
      />

      {editingPartner && (
        <PartnerEditDialog
          partner={editingPartner}
          open={!!editingPartner}
          onOpenChange={(open) => !open && setEditingPartner(null)}
          onSubmit={(data) => updatePartnerMutation.mutate(data)}
          isLoading={updatePartnerMutation.isPending}
        />
      )}

      {deletingPartner && (
        <PartnerDeleteDialog
          partner={deletingPartner}
          open={!!deletingPartner}
          onOpenChange={(open) => !open && setDeletingPartner(null)}
          onConfirm={() => deletePartnerMutation.mutate(deletingPartner.id)}
          isLoading={deletePartnerMutation.isPending}
        />
      )}

      {viewingPartner && (
        <PartnerViewDialog
          partner={viewingPartner}
          open={!!viewingPartner}
          onOpenChange={(open) => !open && setViewingPartner(null)}
        />
      )}
    </div>
  );
};

export default PartnerManagement;