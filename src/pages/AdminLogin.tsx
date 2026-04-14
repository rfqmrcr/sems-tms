
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import AuthError from '@/components/admin/auth/AuthError';
import LoginForm from '@/components/admin/auth/LoginForm';
import CreateAdminSection from '@/components/admin/auth/CreateAdminSection';
import { debugFetch } from '@/lib/debugFetch';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('admin@semsenrolment.com'); // Pre-fill the admin email
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isEmailDisabled, setIsEmailDisabled] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsEmailDisabled(false);
    setErrorDetails(null);
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in both email and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Attempting to sign in with:', email);
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Sign in error:', error);
        let errorMessage = error.message;
        
        // Handle different error scenarios
        if (error.message.includes('Email logins are disabled')) {
          errorMessage = "Email authentication is disabled. Please enable it in your Supabase dashboard under Authentication → Providers.";
          setIsEmailDisabled(true);
          setErrorDetails(error.message);
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. If this is your first time, try creating an admin account first.";
        } else if (error.message.includes('confirmation_token')) {
          errorMessage = "Authentication system configuration issue. Please check your Supabase settings.";
          setErrorDetails(error.message);
        } else {
          errorMessage = `Login failed: ${error.message}`;
        }
        
        setAuthError(errorMessage);
        return;
      }
      
      // Authentication successful
      toast({
        title: "Success",
        description: "You have been logged in successfully",
      });
      
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Unexpected login error:', error);
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in both email and password to create an admin account",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating admin account for:', email);
      
      // Call the Edge Function to create admin
      const response = await debugFetch('https://fgmpgyigalemroggekzd.supabase.co/functions/v1/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbXBneWlnYWxlbXJvZ2dla3pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjE1MTcsImV4cCI6MjA3NDY5NzUxN30.nfMNPfrO5us2KY8o4gEWgpe0AMBhJy6Tkrls1HXrtZE',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      console.log('Create admin response:', data);

      if (!response.ok) {
        console.error('Create admin error:', data);
        toast({
          title: "Error",
          description: data.error || "Failed to create admin account",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Admin account created successfully! You can now log in.",
      });
      
      // Clear any previous errors
      setAuthError(null);
      setIsEmailDisabled(false);
      setErrorDetails(null);
      
    } catch (error) {
      console.error('Create admin network error:', error);
      toast({
        title: "Error",
        description: "Network error while creating admin account. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
            <AuthError 
              authError={authError}
              isEmailDisabled={isEmailDisabled}
              errorDetails={errorDetails}
            />
          )}
          <LoginForm
            email={email}
            password={password}
            isLoading={isLoading}
            isEmailDisabled={isEmailDisabled}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleSubmit}
          />
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {!isEmailDisabled && (
            <CreateAdminSection
              email={email}
              password={password}
              isLoading={isLoading}
              onCreateAdmin={handleCreateAdmin}
            />
          )}
          <p className="text-xs text-gray-400 text-center mt-4">
            First time? Create an admin account above. Having trouble? Enable email authentication in Supabase dashboard.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLogin;
