import { addDays, format } from 'date-fns';
import { collection, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  const regDoc = await getDoc(doc(db, 'registrations', registrationId));
  if (!regDoc.exists()) throw new Error('Registration not found');
  const registration = regDoc.data();

  const subtotal = registration.payment_amount || 0;
  const taxSetting = getDefaultTaxSetting();
  const taxRate = taxSetting.rate;
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;
  
  const issueDate = format(new Date(), 'yyyy-MM-dd');
  const dueDate = format(addDays(new Date(), dueInDays), 'yyyy-MM-dd');
  const invoiceNumber = generateInvoiceNumber();

  let invoiceDescription = description || 'Invoice for course registration';

  const invoiceData = {
    registration_id: registrationId,
    invoice_number: invoiceNumber,
    issue_date: issueDate,
    due_date: dueDate,
    subtotal,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    status: 'pending',
    description: invoiceDescription,
    created_at: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'invoices'), invoiceData);

  return { id: docRef.id, ...invoiceData } as Invoice;
};

export const updateInvoice = async (invoiceId: string, data: Partial<Invoice>) => {
  await updateDoc(doc(db, 'invoices', invoiceId), data as any);
  return { id: invoiceId, ...data };
};

export const deleteInvoice = async (invoiceId: string) => {
  await deleteDoc(doc(db, 'invoices', invoiceId));
  return true;
};
