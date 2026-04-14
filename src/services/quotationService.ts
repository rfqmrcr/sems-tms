import { addDays, format } from 'date-fns';
import { getTable, insertRow, updateRow, deleteRow, delay } from '@/data/mockDatabase';

export interface Quotation {
  id: string;
  registration_id: string;
  quotation_number: string;
  issue_date: string;
  valid_until: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'converted';
  notes?: string;
  created_at: string;
  updated_at: string;
  converted_to_invoice_id?: string;
}

const getDefaultTaxSetting = () => {
  const currentTaxRate = localStorage.getItem('taxRate');
  const currentTaxName = localStorage.getItem('taxName');
  return {
    name: currentTaxName || 'VAT',
    rate: currentTaxRate ? parseFloat(currentTaxRate) : 5,
  };
};

const generateQuotationNumber = async (): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const count = getTable('quotations').length + 1;
  return `QUO-${year}${month}-${count.toString().padStart(3, '0')}`;
};

export const createQuotationForRegistration = async (
  registrationId: string,
  notes?: string,
  validForDays: number = 30
): Promise<Quotation> => {
  await delay(200);
  const registrations = getTable('registrations');
  const registration = registrations.find(r => r.id === registrationId);
  if (!registration) throw new Error('Registration not found');

  const subtotal = registration.payment_amount || 0;
  const taxSetting = getDefaultTaxSetting();
  const taxRate = taxSetting.rate;
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;
  
  const quotationNumber = await generateQuotationNumber();
  const validUntil = addDays(new Date(), validForDays);

  const quotation = insertRow('quotations', {
    registration_id: registrationId,
    quotation_number: quotationNumber,
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    valid_until: format(validUntil, 'yyyy-MM-dd'),
    subtotal,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    status: 'pending',
    notes: notes || 'Quotation for course registration'
  });

  return quotation as Quotation;
};

export const convertQuotationToInvoice = async (
  quotationId: string,
  notes?: string,
  dueInDays: number = 14
): Promise<any> => {
  await delay(200);
  const quotations = getTable('quotations');
  const quotation = quotations.find(q => q.id === quotationId);
  if (!quotation) throw new Error('Quotation not found');
  if (quotation.status === 'converted') throw new Error('Already converted');

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const count = getTable('invoices').length + 1;
  const invoiceNumber = `INV-${year}${month}-${count.toString().padStart(3, '0')}`;
  const dueDate = addDays(new Date(), dueInDays);

  const invoice = insertRow('invoices', {
    registration_id: quotation.registration_id,
    invoice_number: invoiceNumber,
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(dueDate, 'yyyy-MM-dd'),
    subtotal: quotation.subtotal,
    tax_rate: quotation.tax_rate,
    tax_amount: quotation.tax_amount,
    total_amount: quotation.total_amount,
    status: 'pending',
    description: notes || quotation.notes || 'Converted from quotation'
  });

  updateRow('quotations', quotationId, {
    status: 'converted',
    converted_to_invoice_id: invoice.id
  });

  return invoice;
};

export const updateQuotation = async (quotationId: string, data: Partial<Quotation>) => {
  await delay(200);
  return updateRow('quotations', quotationId, data);
};

export const deleteQuotation = async (quotationId: string) => {
  await delay(200);
  deleteRow('quotations', quotationId);
};
