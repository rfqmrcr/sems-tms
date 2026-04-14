
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUploadField } from '@/components/form/FileUploadField';
import { Organization } from '@/services/courseService';

interface OrganizationDetailsStepProps {
  organization: Organization;
  setOrganization: React.Dispatch<React.SetStateAction<Organization>>;
}

const OrganizationDetailsStep: React.FC<OrganizationDetailsStepProps> = ({
  organization,
  setOrganization
}) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Organization Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="org-name">Organization Name *</Label>
          <Input
            id="org-name"
            value={organization.name}
            onChange={(e) => setOrganization(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter organization name"
            required
          />
        </div>
        <div>
          <Label htmlFor="org-contact-person">Contact Person *</Label>
          <Input
            id="org-contact-person"
            value={organization.contact_person || ''}
            onChange={(e) => setOrganization(prev => ({ ...prev, contact_person: e.target.value }))}
            placeholder="Enter contact person name"
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="org-address">Address</Label>
          <Input
            id="org-address"
            value={organization.address || ''}
            onChange={(e) => setOrganization(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Enter organization address"
          />
        </div>
        <div>
          <Label htmlFor="org-email">Email *</Label>
          <Input
            id="org-email"
            type="email"
            value={organization.contact_email || ''}
            onChange={(e) => setOrganization(prev => ({ ...prev, contact_email: e.target.value }))}
            placeholder="Enter email address"
            required
          />
        </div>
        <div>
          <Label htmlFor="org-phone">Phone Number</Label>
          <Input
            id="org-phone"
            value={organization.contact_number || ''}
            onChange={(e) => setOrganization(prev => ({ ...prev, contact_number: e.target.value }))}
            placeholder="Enter phone number"
          />
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetailsStep;
