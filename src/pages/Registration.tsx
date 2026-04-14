
import React from 'react';
import { useRegistrationForm } from '@/hooks/useRegistrationForm';
import RegistrationContainer from '@/components/registration/RegistrationContainer';
import RegistrationLoading from '@/components/registration/RegistrationLoading';

const RegistrationPage: React.FC = () => {
  const { loading } = useRegistrationForm();

  if (loading) {
    return <RegistrationLoading />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <RegistrationContainer />
      </main>
    </div>
  );
};

export default RegistrationPage;
