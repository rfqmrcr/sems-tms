import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createRegistration, CourseRun, Registration, Organization, Trainee } from '@/services/courseService';
import { fetchCourseRunsData } from '@/services/courseDataService';
import { getRegistrationCounts } from '@/services/registrationCountService';
import { enrichCourseRunsWithCapacity } from '@/services/courseRunProcessor';
import { createQuotationForRegistration } from '@/services/quotationService';
import { incrementPromoCodeUsage } from '@/services/discountService';
import { useDiscountCalculation } from '@/hooks/useDiscountCalculation';
import { supabase } from '@/integrations/supabase/client';
import { debugFetch } from '@/lib/debugFetch';
import { toast } from 'sonner';

export const useRegistrationForm = (preselectedCourseRun?: CourseRun, sponsorshipType?: 'corporate' | 'self' | null) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseRun[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Get course from navigation state or preselected
  const courseFromState = location.state?.course as CourseRun;
  const initialCourse = preselectedCourseRun || courseFromState;

  // Form data states
  const [organization, setOrganization] = useState<Organization>({
    name: '',
    address: '',
    contact_person: '',
    contact_email: '',
    contact_number: '',
  });

  const [contact, setContact] = useState<Registration>({
    contact_person: '',
    contact_email: '',
    contact_number: '',
    course_id: '',
    course_run_id: '',
    hrdf_grant: false,
  });

  const [trainees, setTrainees] = useState<Trainee[]>([]);

  // Sync organization contact details to contact state for corporate flow
  useEffect(() => {
    if (sponsorshipType === 'corporate') {
      setContact(prev => ({
        ...prev,
        contact_person: organization.contact_person || '',
        contact_email: organization.contact_email || '',
        contact_number: organization.contact_number || '',
      }));
    }
  }, [organization.contact_person, organization.contact_email, organization.contact_number, sponsorshipType]);

  // Calculate total function
  const calculateTotal = () => {
    if (!selectedCourse?.price || trainees.length === 0) return 0;
    return selectedCourse.price * trainees.length;
  };

  // Discount calculation hook
  const {
    discountCalculation,
    promoCode,
    loading: discountLoading,
    handlePromoCodeChange,
    recalculateDiscounts
  } = useDiscountCalculation(
    calculateTotal(),
    trainees.length,
    organization.name,
    selectedCourse?.visibility || 'public',
    sponsorshipType || undefined
  );

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        // Fetch only public course runs
        const courseRunsData = await fetchCourseRunsData();
        // Filter to only show public course runs
        const publicCourseRuns = courseRunsData.filter(run => run.visibility === 'public');
        const courseRunIds = publicCourseRuns.map(run => run.id);
        const registrationCounts = await getRegistrationCounts(courseRunIds);
        const courseData = enrichCourseRunsWithCapacity(publicCourseRuns, registrationCounts);
        setCourses(courseData);

        // If course was passed from navigation or preselected, select it
        if (initialCourse && initialCourse.id) {
          setSelectedCourse(initialCourse);
          setContact(prev => ({
            ...prev,
            course_id: initialCourse.course_id || '',
            course_run_id: initialCourse.id,
          }));
        }
      } catch (error) {
        console.error('Failed to load courses:', error);
        toast.error('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [initialCourse]);

  const handleCourseSelect = (course: CourseRun) => {
    // Reset selection if empty course is passed (for "Change Course" functionality)
    if (!course.id || !course.course_id) {
      setSelectedCourse(null);
      setContact(prev => ({
        ...prev,
        course_id: '',
        course_run_id: '',
      }));
      return;
    }
    
    setSelectedCourse(course);
    setContact(prev => ({
      ...prev,
      course_id: course.course_id || '',
      course_run_id: course.id,
    }));
  };

  const handleAddTrainee = () => {
    setTrainees([...trainees, {
      full_name: '',
      nric: '',
      dob: '',
      gender: '',
      contact_number: '',
      email: '',
    }]);
  };

  const handleRemoveTrainee = (index: number) => {
    setTrainees(trainees.filter((_, i) => i !== index));
  };

  const handleTraineeChange = (index: number, field: keyof Trainee, value: string) => {
    const updatedTrainees = [...trainees];
    updatedTrainees[index] = {
      ...updatedTrainees[index],
      [field]: value,
    };
    setTrainees(updatedTrainees);
  };

  const getTaxSetting = () => {
    const savedTaxRate = localStorage.getItem('taxRate');
    return savedTaxRate ? parseFloat(savedTaxRate) : 5;
  };

  const getFinalAmount = () => {
    return discountCalculation?.finalAmount || calculateTotal();
  };

  const getFinalAmountWithTax = () => {
    const baseAmount = getFinalAmount();
    const taxRate = getTaxSetting();
    const taxAmount = (baseAmount * taxRate) / 100;
    return baseAmount + taxAmount;
  };

  const handleSubmit = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    if (trainees.length === 0) {
      toast.error('Please add at least one trainee');
      return;
    }

    try {
      setSubmitting(true);

      const originalTotal = calculateTotal();
      const finalTotal = getFinalAmount();
      const finalTotalWithTax = getFinalAmountWithTax();
      console.log('Original total:', originalTotal, 'Final total:', finalTotal, 'Final with tax:', finalTotalWithTax);

      // For self-sponsored, use trainee details as contact details
      const iselfSponsored = organization.name === 'Self Sponsored';
      let contactData = contact;
      let orgData = {
        ...organization,
        sponsorship_type: sponsorshipType || undefined
      };

      if (iselfSponsored && trainees.length > 0) {
        const firstTrainee = trainees[0];
        contactData = {
          ...contact,
          contact_person: firstTrainee.full_name,
          contact_email: firstTrainee.email || '',
          contact_number: firstTrainee.contact_number || '',
        };
        
        orgData = {
          ...orgData,
          contact_person: firstTrainee.full_name,
          contact_email: firstTrainee.email || '',
          contact_number: firstTrainee.contact_number || '',
        };
      }

      // Create registration data with discount information
      const registrationData: Registration = {
        contact_person: contactData.contact_person,
        contact_email: contactData.contact_email,
        contact_number: contactData.contact_number,
        course_id: contactData.course_id,
        course_run_id: contactData.course_run_id,
        payment_amount: finalTotal,
        hrdf_grant: Boolean(contactData.hrdf_grant),
        promo_code_used: promoCode || undefined,
        partner_discount_percentage: discountCalculation?.partnerDiscount || 0,
        promo_discount_percentage: discountCalculation?.promoDiscount || 0,
        total_discount_percentage: discountCalculation?.totalDiscount || 0,
        original_amount: originalTotal,
        discount_amount: discountCalculation?.discountBreakdown.totalDiscountAmount || 0
      };

      const result = await createRegistration(
        registrationData,
        orgData,
        trainees
      );

      if (result.success && result.registrationId) {
        // Increment promo code usage if used
        if (promoCode && discountCalculation?.promoDiscount && discountCalculation.promoDiscount > 0) {
          await incrementPromoCodeUsage(promoCode);
        }

      // For HRDF registrations, skip payment and send confirmation email immediately
      if (Boolean(contactData.hrdf_grant)) {
        try {
          toast.success('HRDF registration completed successfully! A quotation will be sent to your email.');
          navigate(`/payment-success?registration_id=${result.registrationId}`);
        } catch (emailError) {
          console.error('Error during HRDF registration:', emailError);
          toast.warning('Registration completed successfully');
          navigate('/');
        }
      } else {
        // For self-sponsored, create Stripe checkout session for immediate payment
        try {
          const courseName = selectedCourse.title || selectedCourse.course?.title || 'Course Registration';
          
          const checkoutData = {
            amount: finalTotalWithTax,
            registrationId: result.registrationId,
            customerEmail: contactData.contact_email,
            customerName: contactData.contact_person,
            metadata: {
              courseTitle: courseName,
              organizationName: organization.name,
              numberOfTrainees: trainees.length.toString(),
            }
          };

          console.log('[PAYMENT] Creating Stripe checkout session:', checkoutData);
          
          const stripeUrl = 'https://fgmpgyigalemroggekzd.supabase.co/functions/v1/stripe-create-checkout';
          const response = await debugFetch(stripeUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbXBneWlnYWxlbXJvZ2dla3pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjE1MTcsImV4cCI6MjA3NDY5NzUxN30.nfMNPfrO5us2KY8o4gEWgpe0AMBhJy6Tkrls1HXrtZE',
            },
            body: JSON.stringify(checkoutData)
          });

          console.log('[PAYMENT] Response status:', response.status);

          if (!response.ok) {
            const errorData = await response.json();
            console.error('[PAYMENT] HTTP error:', errorData);
            throw new Error(`Payment setup failed: ${errorData.error || 'Unknown error'}`);
          }

          const checkoutResponse = await response.json();
          console.log('[PAYMENT] Checkout response:', checkoutResponse);

          if (checkoutResponse?.error) {
            console.error('[PAYMENT] Edge function error:', checkoutResponse.error);
            throw new Error(`Payment error: ${checkoutResponse.error}`);
          }

          if (!checkoutResponse?.url) {
            console.error('[PAYMENT] No URL in response:', checkoutResponse);
            throw new Error('Payment URL not received. Please try again.');
          }
          
          console.log('[PAYMENT] Redirecting to:', checkoutResponse.url);
          window.location.replace(checkoutResponse.url);
          
        } catch (paymentError) {
          console.error('[PAYMENT] Error:', paymentError);
          const errorMsg = paymentError instanceof Error ? paymentError.message : 'Payment setup failed';
          toast.error(errorMsg, { duration: 10000 });
        }
      }
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    courses,
    selectedCourse,
    loading,
    submitting,
    organization,
    setOrganization,
    contact,
    setContact,
    trainees,
    setTrainees,
    handleCourseSelect,
    handleAddTrainee,
    handleRemoveTrainee,
    handleTraineeChange,
    calculateTotal,
    getFinalAmount,
    getFinalAmountWithTax,
    handleSubmit,
    // Discount-related
    discountCalculation,
    promoCode,
    discountLoading,
    handlePromoCodeChange,
    recalculateDiscounts
  };
};
