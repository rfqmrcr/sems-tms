
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ExternalLink } from 'lucide-react';

interface AuthErrorProps {
  authError: string;
  isEmailDisabled: boolean;
  errorDetails?: string | null;
}

const AuthError: React.FC<AuthErrorProps> = ({ authError, isEmailDisabled, errorDetails }) => {
  return (
    <>
      <Alert variant={isEmailDisabled ? "default" : "destructive"} className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{authError}</AlertDescription>
      </Alert>
      
      {isEmailDisabled && (
        <>
          <Alert variant="default" className="bg-blue-50 border-blue-100 text-blue-800">
            <AlertDescription className="text-sm">
              <p className="font-semibold mb-2">How to Enable Email Authentication:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Go to the Supabase Dashboard</li>
                <li>Navigate to Authentication → Providers</li>
                <li>Enable the "Email" provider</li>
                <li>Save changes</li>
                <li>Return here and try logging in again</li>
              </ol>
              <div className="mt-2">
                <a 
                  href="https://supabase.com/dashboard/project/rjrnmwpcjmrthcdtklsu/auth/providers" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  Open Supabase Auth Settings
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
            </AlertDescription>
          </Alert>
          
          {errorDetails && (
            <div className="mt-2 text-xs text-gray-500 p-2 bg-gray-50 rounded border border-gray-200 overflow-auto">
              <p className="font-semibold">Technical details:</p>
              <code className="block mt-1">{errorDetails}</code>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default AuthError;
