
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const registrationId = searchParams.get('registration');
  const sessionId = searchParams.get('session_id');
  const [isSending, setIsSending] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);

  useEffect(() => {
    const processPaymentSuccess = async () => {
      if (!registrationId || isProcessed) return;
      
      setIsProcessed(true);
      console.log('[PaymentSuccess] Processing payment for registration:', registrationId);
      
      try {
        // Update payment status to paid
        const { error: updateError } = await supabase
          .from('registrations')
          .update({ 
            payment_status: 'paid',
            payment_type: 'Online',
            updated_at: new Date().toISOString()
          })
          .eq('id', registrationId);

        if (updateError) {
          console.error('[PaymentSuccess] Error updating payment status:', updateError);
          throw updateError;
        }

        console.log('[PaymentSuccess] Payment status updated, sending confirmation email');

        // Send confirmation email
        const { error: emailError } = await supabase.functions.invoke('send-registration-email', {
          body: { registrationId, emailType: 'confirmation' }
        });
        
        if (emailError) {
          console.error('[PaymentSuccess] Error sending email:', emailError);
          toast.error('Payment recorded but failed to send confirmation email. Please contact support.');
        } else {
          console.log('[PaymentSuccess] Confirmation email sent successfully');
          toast.success('Payment successful! Confirmation email sent.');
        }
      } catch (error) {
        console.error('[PaymentSuccess] Error processing payment:', error);
        toast.error('Payment recorded but there was an issue. Please contact support if you don\'t receive confirmation.');
      }
    };

    processPaymentSuccess();
  }, [registrationId, isProcessed]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your course registration payment has been completed successfully. 
            You will receive a confirmation email shortly.
          </p>
          
          {registrationId && (
            <p className="text-sm text-gray-500 break-all">
              Registration ID: {registrationId}
            </p>
          )}
          
          {sessionId && (
            <p className="text-sm text-gray-500 break-all">
              Payment Session: {sessionId}
            </p>
          )}

          <div className="space-y-2">
            {registrationId && (
              <Button 
                onClick={async () => {
                  setIsSending(true);
                  try {
                    const { error } = await supabase.functions.invoke('send-registration-email', {
                      body: { registrationId, triggerPoint: 'registration' }
                    });
                    
                    if (error) throw error;
                    
                    toast.success('Confirmation email sent successfully!');
                  } catch (error) {
                    console.error('Error sending email:', error);
                    toast.error('Failed to send email. Please contact support.');
                  } finally {
                    setIsSending(false);
                  }
                }}
                variant="outline"
                className="w-full"
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Confirmation Email
                  </>
                )}
              </Button>
            )}
            
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
