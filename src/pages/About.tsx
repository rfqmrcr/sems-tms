
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, Award, Clock } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">About SEMS</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We are dedicated to providing high-quality CPR and First Aid training to individuals and organizations nationwide.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-6">
            We're committed to deliver high quality training to further assist our associates in the healthcare sector to grow, improve and excel – ultimately delivering a higher level of care to the industry. SEMS takes pride with our wide offerings of certified medical courses which are recognised and accredited by globally accepted institutions, such as the American Heart Association, National Association of Emergency Medical Technicians (NAEMT), Maritime & Port Authority of Singapore (MPA), Department of Occupational Safety and Health (DOSH), International Trauma Life Support and STCW aligned programs.
          </p>
          <p className="text-gray-700">
            Our team of certified instructors brings real-world experience to every training session, ensuring that our students receive practical, hands-on instruction that prepares them for real emergencies. We're not just teaching procedures—we're building confidence and readiness.
          </p>
        </div>
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
            alt="Training session"
            className="rounded-lg shadow-md w-full h-full object-cover"
          />
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent/20 rounded-full -z-10"></div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 text-center">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Certified Training</h3>
                <p className="text-gray-600">Our courses meet or exceed industry standards and guidelines.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Experienced Instructors</h3>
                <p className="text-gray-600">Learn from professionals with years of real-world experience.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Recognized Certification</h3>
                <p className="text-gray-600">Earn certifications that are recognized nationwide.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Convenient Scheduling</h3>
                <p className="text-gray-600">Choose from multiple course options to fit your schedule.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">Our History</h2>
        <div className="bg-gray-50 rounded-lg p-8">
          <p className="text-gray-700 mb-4">
            Paragraph 1 
          </p>
          <p className="text-gray-700 mb-4">
            Paragraph 2
          </p>
          <p className="text-gray-700">
            Paragraph 3
          </p>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-6">Our Certifications</h2>
        <div className="flex flex-wrap justify-center gap-10 items-center">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <img src="https://placehold.co/200x100?text=Certification+1" alt="Certification Logo" className="h-20" />
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <img src="https://placehold.co/200x100?text=Certification+2" alt="Certification Logo" className="h-20" />
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <img src="https://placehold.co/200x100?text=Certification+3" alt="Certification Logo" className="h-20" />
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <img src="https://placehold.co/200x100?text=Certification+4" alt="Certification Logo" className="h-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
