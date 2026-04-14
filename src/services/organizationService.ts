import { Organization } from '@/types/course';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const createOrFindOrganization = async (organization: Organization): Promise<string> => {
  const q = query(
    collection(db, 'organizations'),
    where('name', '==', organization.name),
    where('contact_email', '==', organization.contact_email)
  );
  
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }
  
  const docRef = await addDoc(collection(db, 'organizations'), {
    name: organization.name,
    address: organization.address,
    contact_person: organization.contact_person,
    contact_email: organization.contact_email,
    contact_number: organization.contact_number,
    created_at: new Date().toISOString()
  });
  
  return docRef.id;
};
