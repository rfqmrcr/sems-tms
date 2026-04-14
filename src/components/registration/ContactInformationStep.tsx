import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Registration } from '@/services/courseService';

interface ContactInformationStepProps {
  contact: Registration;
  setContact: React.Dispatch<React.SetStateAction<Registration>>;
}

const ContactInformationStep: React.FC<ContactInformationStepProps> = ({
  contact,
  setContact
}) => {
  const [emailError, setEmailError] = React.useState<string>('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setContact(prev => ({ ...prev, contact_email: value }));
    
    // Clear error when user starts typing
    if (emailError) {
      setEmailError('');
    }
  };

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Phone number changing to:', value);
    setContact(prev => ({ 
      ...prev, 
      contact_number: value 
    }));
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="contact-person">Contact Person *</Label>
          <Input
            id="contact-person"
            value={contact.contact_person || ''}
            onChange={(e) => setContact(prev => ({ ...prev, contact_person: e.target.value }))}
            placeholder="Enter contact person name"
            required
          />
        </div>
        <div>
          <Label htmlFor="contact-email">Email *</Label>
          <Input
            id="contact-email"
            type="email"
            value={contact.contact_email || ''}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            placeholder="Enter email address"
            className={emailError ? 'border-red-500' : ''}
            required
          />
          {emailError && (
            <p className="text-red-500 text-sm mt-1">{emailError}</p>
          )}
        </div>
        <div>
          <Label htmlFor="contact-phone">Phone Number</Label>
          <Input
            id="contact-phone"
            type="tel"
            value={contact.contact_number || ''}
            onChange={handlePhoneChange}
            placeholder="Enter phone number"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactInformationStep;
