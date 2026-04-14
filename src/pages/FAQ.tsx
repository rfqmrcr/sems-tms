
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const FAQ = () => {
  const faqs = [
    {
      question: "What types of medical training courses do you offer?",
      answer: "We offer a wide range of medical training courses including Basic Life Support (BLS), Advanced Cardiac Life Support (ACLS), First Aid, CPR, and specialized healthcare professional courses. Our programs are designed for healthcare professionals, corporate employees, and individuals seeking certification."
    },
    {
      question: "Are your courses internationally recognized?",
      answer: "Yes, our courses follow international guidelines and standards. Many of our certifications are recognized globally, making them valuable for healthcare professionals working internationally or those planning to work abroad."
    },
    {
      question: "How long does certification last?",
      answer: "Most of our certifications are valid for 2 years, after which you'll need to take a recertification course. Some specialized courses may have different validity periods, which will be clearly indicated in the course details."
    },
    {
      question: "Do I need any prerequisites to join your courses?",
      answer: "Prerequisites vary by course. Basic courses like First Aid generally have no prerequisites. Advanced courses like ACLS typically require prior healthcare experience or education. The specific prerequisites for each course are listed on the individual course pages."
    },
    {
      question: "How do I register for a course?",
      answer: "Registration is simple! Visit our Registration page, select your desired course, fill out the form with your details, and complete the payment process. You'll receive a confirmation email with all necessary information about your course."
    },
    {
      question: "What is your refund policy?",
      answer: "We offer full refunds for cancellations made at least 7 days before the course start date. Cancellations made 3-7 days before may receive a partial refund. No refunds are available for cancellations less than 3 days before the course. Please refer to our terms and conditions for more details."
    },
    {
      question: "Can you conduct training at our company premises?",
      answer: "Yes, we offer on-site corporate training programs tailored to your company's needs. Please contact us directly to discuss your requirements and to get a customized quote."
    },
    {
      question: "What should I bring to the training?",
      answer: "You should bring a valid ID, comfortable clothing suitable for practical exercises, and any course materials you were instructed to prepare. For most courses, all necessary equipment and learning materials will be provided."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-8 text-center">Frequently Asked Questions</h1>
      <p className="text-gray-700 mb-10 text-center max-w-3xl mx-auto">
        Find answers to common questions about our medical training courses, certification process, and more. 
        If you don't see your question here, please feel free to <Link to="/contact" className="text-primary hover:underline">contact us</Link>.
      </p>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <Collapsible 
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <CollapsibleTrigger className="flex justify-between items-center w-full text-left p-4 font-medium bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none">
              <span>{faq.question}</span>
              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 bg-white">
              <p className="text-gray-700">{faq.answer}</p>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
