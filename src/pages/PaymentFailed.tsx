
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

const PaymentFailed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const registrationId = searchParams.get('registration');

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <CardTitle className="text-2xl">Payment Failed</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Your Registration is Saved</h3>
            <p className="text-sm text-yellow-800">
              Don't worry! Your registration has been received and saved in our system. 
              However, we could not process your payment at this time.
            </p>
          </div>

          <p className="text-muted-foreground text-sm">
            This could be due to insufficient funds, network issues, or other technical problems.
          </p>
          
          {registrationId && (
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm font-medium">Registration ID</p>
              <p className="text-xs text-muted-foreground font-mono">{registrationId}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Your spot is reserved</li>
              <li>Contact us to arrange payment</li>
              <li>Check your email for details</li>
            </ul>
          </div>

          <div className="space-y-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/contact')} 
              className="w-full"
            >
              Contact Support
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailed;
