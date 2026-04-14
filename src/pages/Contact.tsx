import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' })
});

type FormData = z.infer<typeof formSchema>;

const Contact: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('send-contact-message', {
        body: data
      });

      if (error) {
        throw new Error(error.message || "Failed to send message.");
      }

      toast({
        title: "Message sent!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });
      reset();
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "An error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Have questions about our training programs? Get in touch with us and our team will be happy to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
          
          <div className="space-y-6">
            <Card className="p-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Our Location</h3>
                  <p className="text-gray-600 mt-1">
                    Dubai Healthcare City<br />
                    Dubai, United Arab Emirates
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-start">
                <Phone className="w-5 h-5 mr-3 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Phone Number</h3>
                  <p className="text-gray-600 mt-1">
                    <a href="tel:+60378905933" className="hover:text-primary transition">+60-37890-5933</a>
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-start">
                <Mail className="w-5 h-5 mr-3 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Email Address</h3>
                  <p className="text-gray-600 mt-1">
                    <a href="mailto:contact@sems.ae" className="hover:text-primary transition">contact@sems.ae</a>
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-start">
                <Clock className="w-5 h-5 mr-3 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Operating Hours</h3>
                  <div className="text-gray-600 mt-1">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday, Sunday & PH : Closed</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Send Us a Message</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  {...register('name')}
                  className={errors.name ? "border-red-500" : ""}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={errors.email ? "border-red-500" : ""}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <Input
                  id="subject"
                  {...register('subject')}
                  className={errors.subject ? "border-red-500" : ""}
                  placeholder="Enter subject"
                />
                {errors.subject && (
                  <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="message"
                  {...register('message')}
                  className={errors.message ? "border-red-500" : ""}
                  placeholder="Enter your message"
                  rows={5}
                />
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
      
      <div className="rounded-lg overflow-hidden shadow-sm h-80 w-full">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8144865917254!2d101.71503717479018!3d3.1460499976041314!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc362aaa20c97f%3A0x2415fddae30be2c5!2sChulan%20Tower!5e0!3m2!1sen!2smy!4v1715177467673!5m2!1sen!2smy"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
};

export default Contact;
