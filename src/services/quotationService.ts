import { addDays, format } from 'date-fns';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  const snap = await getDocs(collection(db, 'quotations'));
  const count = snap.size + 1;
  return `QUO-${year}${month}-${count.toString().padStart(3, '0')}`;
};

export const createQuotationForRegistration = async (
  registrationId: string,
  notes?: string,
  validForDays: number = 30
): Promise<Quotation> => {
  const regDoc = await getDoc(doc(db, 'registrations', registrationId));
  if (!regDoc.exists()) throw new Error('Registration not found');
  const registration = regDoc.data();

  const subtotal = registration.payment_amount || 0;
  const taxSetting = getDefaultTaxSetting();
  const taxRate = taxSetting.rate;
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;
  
  const quotationNumber = await generateQuotationNumber();
  const validUntil = addDays(new Date(), validForDays);

  const quotationData = {
    registration_id: registrationId,
    quotation_number: quotationNumber,
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    valid_until: format(validUntil, 'yyyy-MM-dd'),
    subtotal,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    status: 'pending',
    notes: notes || 'Quotation for course registration',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'quotations'), quotationData);

  return { id: docRef.id, ...quotationData } as Quotation;
};

export const convertQuotationToInvoice = async (
  quotationId: string,
  notes?: string,
  dueInDays: number = 14
): Promise<any> => {
  const quoDoc = await getDoc(doc(db, 'quotations', quotationId));
  if (!quoDoc.exists()) throw new Error('Quotation not found');
  const quotation = quoDoc.data();
  if (quotation.status === 'converted') throw new Error('Already converted');

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const invSnap = await getDocs(collection(db, 'invoices'));
  const count = invSnap.size + 1;
  const invoiceNumber = `INV-${year}${month}-${count.toString().padStart(3, '0')}`;
  const dueDate = addDays(new Date(), dueInDays);

  const invoiceData = {
    registration_id: quotation.registration_id,
    invoice_number: invoiceNumber,
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(dueDate, 'yyyy-MM-dd'),
    subtotal: quotation.subtotal,
    tax_rate: quotation.tax_rate,
    tax_amount: quotation.tax_amount,
    total_amount: quotation.total_amount,
    status: 'pending',
    description: notes || quotation.notes || 'Converted from quotation',
    created_at: new Date().toISOString()
  };

  const invoiceRef = await addDoc(collection(db, 'invoices'), invoiceData);

  await updateDoc(doc(db, 'quotations', quotationId), {
    status: 'converted',
    converted_to_invoice_id: invoiceRef.id,
    updated_at: new Date().toISOString()
  });

  return { id: invoiceRef.id, ...invoiceData };
};

export const updateQuotation = async (quotationId: string, data: Partial<Quotation>) => {
  const updates = { ...data, updated_at: new Date().toISOString() };
  await updateDoc(doc(db, 'quotations', quotationId), updates as any);
  return { id: quotationId, ...updates };
};

export const deleteQuotation = async (quotationId: string) => {
  await deleteDoc(doc(db, 'quotations', quotationId));
};
