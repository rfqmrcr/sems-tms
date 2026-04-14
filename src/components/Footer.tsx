
import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-10">
          {/* Logo and Social Media Section */}
          <div className="flex flex-col">
            <a href="https://sems.ae/" className="inline-block mb-4">
              <img 
                src="/sems-logo.png" 
                alt="SEMS Logo" 
                className="h-16 w-auto brightness-0 invert" 
              />
            </a>
            <div className="flex items-center gap-3 mt-2">
              <a 
                href="https://www.facebook.com/people/Singapore-Emergency-Medical-Services-UAE/61579637951631/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-white/80 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a 
                href="https://www.instagram.com/sems.uae" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-white/80 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a 
                href="https://www.linkedin.com/company/singapore-emergency-medical-services-sems/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-white/80 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          {/* Contact Information Section */}
          <div className="md:text-right">
            <h3 className="text-2xl font-semibold mb-6 text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 md:justify-end">
                <MapPin className="w-5 h-5 text-white/70 flex-shrink-0 mt-1 md:order-2" />
                <div className="text-white/90 leading-relaxed md:text-right">
                  <p>Dubai Healthcare City</p>
                  <p>Dubai, United Arab Emirates</p>
                </div>
              </li>
              <li className="flex items-center gap-3 md:justify-end">
                <Phone className="w-5 h-5 text-white/70 flex-shrink-0 md:order-2" />
                <a 
                  href="tel:+971544662672" 
                  className="text-white/90 hover:text-white transition-colors"
                >
                  +971544662672
                </a>
              </li>
              <li className="flex items-center gap-3 md:justify-end">
                <Mail className="w-5 h-5 text-white/70 flex-shrink-0 md:order-2" />
                <a 
                  href="mailto:contact@sems.ae" 
                  className="text-white/90 hover:text-white transition-colors"
                >
                  contact@sems.ae
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright Section */}
        <div className="border-t border-white/20 pt-6 text-center">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} Singapore Emergency Medical Services (SEMS). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
