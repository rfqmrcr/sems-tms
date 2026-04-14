
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { InputField } from '@/components/form/InputField';
import { SelectField } from '@/components/form/SelectField';

interface TraineeDetailsFormProps {
  index: number;
}

const TraineeDetailsForm: React.FC<TraineeDetailsFormProps> = ({ index }) => {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <InputField name={`trainees.${index}.fullName`} label="Full Name" required />
      <InputField name={`trainees.${index}.dob`} label="Date of Birth" type="date" />
      <SelectField
        name={`trainees.${index}.gender`}
        label="Gender"
        options={[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
        ]}
        placeholder="Select gender"
      />
      <InputField name={`trainees.${index}.contactNumber`} label="Contact Number" />
      <InputField name={`trainees.${index}.email`} label="Email Address" />
    </div>
  );
};

export default TraineeDetailsForm;
