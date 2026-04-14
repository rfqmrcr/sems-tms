import { Organization } from '@/types/course';
import { getTable, insertRow, delay } from '@/data/mockDatabase';

export const createOrFindOrganization = async (organization: Organization): Promise<string> => {
  await delay(200);
  const orgs = getTable('organizations');
  const existingOrg = orgs.find(o => o.name === organization.name && o.contact_email === organization.contact_email);
  if (existingOrg) return existingOrg.id;
  
  const newOrg = insertRow('organizations', {
    name: organization.name,
    address: organization.address,
    contact_person: organization.contact_person,
    contact_email: organization.contact_email,
    contact_number: organization.contact_number,
  });
  
  return newOrg.id;
};
