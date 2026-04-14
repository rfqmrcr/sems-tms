import { addDays, format } from 'date-fns';
import { getTable, insertRow, updateRow, deleteRow, delay } from '@/data/mockDatabase';

export interface Invoice {
  id: string;
  registration_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  description?: string;
  created_at: string;
}

const getDefaultTaxSetting = () => {
  const savedTaxRate = localStorage.getItem('taxRate');
  const savedTaxName = localStorage.getItem('taxName');
  return {
    name: savedTaxName || 'VAT',
    rate: savedTaxRate ? parseFloat(savedTaxRate) : 5,
  };
};

export const generateInvoiceNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}${day}-${random}`;
};

export const createInvoiceForRegistration = async (
  registrationId: string,
  description?: string,
  dueInDays: number = 14
): Promise<Invoice> => {
  await delay(200);
  const registrations = getTable('registrations');
  const registration = registrations.find(r => r.id === registrationId);
  if (!registration) throw new Error('Registration not found');

  const subtotal = registration.payment_amount || 0;
  const taxSetting = getDefaultTaxSetting();
  const taxRate = taxSetting.rate;
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;
  
  const issueDate = format(new Date(), 'yyyy-MM-dd');
  const dueDate = format(addDays(new Date(), dueInDays), 'yyyy-MM-dd');
  const invoiceNumber = generateInvoiceNumber();

  let invoiceDescription = description || 'Invoice for course registration';

  const newInvoice = insertRow('invoices', {
    registration_id: registrationId,
    invoice_number: invoiceNumber,
    issue_date: issueDate,
    due_date: dueDate,
    subtotal,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    status: 'pending',
    description: invoiceDescription
  });

  return newInvoice as Invoice;
};

export const updateInvoice = async (invoiceId: string, data: Partial<Invoice>) => {
  await delay(200);
  return updateRow('invoices', invoiceId, data);
};

export const deleteInvoice = async (invoiceId: string) => {
  await delay(200);
  deleteRow('invoices', invoiceId);
  return true;
};
