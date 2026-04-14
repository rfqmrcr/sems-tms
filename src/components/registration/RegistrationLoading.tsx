
import React from 'react';

const RegistrationLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    </div>
  );
};

export default RegistrationLoading;
