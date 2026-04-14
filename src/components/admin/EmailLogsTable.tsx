import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Search, Filter, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EmailLog {
  id: string;
  email_type: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  status: string;
  error_message: string | null;
  sent_at: string;
  template_used: string | null;
  metadata: any;
}

const EmailLogsTable: React.FC = () => {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  useEffect(() => {
    let filtered = emailLogs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.recipient_name && log.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(log => log.email_type === typeFilter);
    }

    setFilteredLogs(filtered);
  }, [emailLogs, searchTerm, statusFilter, typeFilter]);

  const fetchEmailLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Error fetching email logs:', error);
        return;
      }

      setEmailLogs(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800">Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeColors = {
      'registration': 'bg-blue-100 text-blue-800',
      'reminder': 'bg-yellow-100 text-yellow-800',
      'trainee_confirmation': 'bg-purple-100 text-purple-800',
      'contact': 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge variant="outline" className={typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}>
        {type.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const EmailDetailsDialog = ({ log }: { log: EmailLog }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Email Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            <div>
              <label className="font-semibold">Subject:</label>
              <p>{log.subject}</p>
            </div>
            <div>
              <label className="font-semibold">Recipient:</label>
              <p>{log.recipient_name ? `${log.recipient_name} (${log.recipient_email})` : log.recipient_email}</p>
            </div>
            <div>
              <label className="font-semibold">Status:</label>
              <div className="mt-1">{getStatusBadge(log.status)}</div>
            </div>
            <div>
              <label className="font-semibold">Type:</label>
              <div className="mt-1">{getTypeBadge(log.email_type)}</div>
            </div>
            <div>
              <label className="font-semibold">Sent At:</label>
              <p>{format(new Date(log.sent_at), 'PPpp')}</p>
            </div>
            {log.template_used && (
              <div>
                <label className="font-semibold">Template:</label>
                <p>{log.template_used}</p>
              </div>
            )}
            {log.error_message && (
              <div>
                <label className="font-semibold">Error:</label>
                <p className="text-red-600">{log.error_message}</p>
              </div>
            )}
            {log.metadata && (
              <div>
                <label className="font-semibold">Metadata:</label>
                <pre className="bg-muted p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Logs ({filteredLogs.length})
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="registration">Registration</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
              <SelectItem value="trainee_confirmation">Trainee Confirmation</SelectItem>
              <SelectItem value="contact">Contact</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={fetchEmailLogs}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date/Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No email logs found
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(new Date(log.sent_at), 'MMM dd, yyyy')}</div>
                      <div className="text-muted-foreground">{format(new Date(log.sent_at), 'HH:mm:ss')}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getTypeBadge(log.email_type)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{log.recipient_name || 'N/A'}</div>
                      <div className="text-muted-foreground">{log.recipient_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={log.subject}>
                      {log.subject}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(log.status)}
                    {log.error_message && (
                      <div className="text-xs text-red-600 mt-1 truncate" title={log.error_message}>
                        {log.error_message}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <EmailDetailsDialog log={log} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EmailLogsTable;