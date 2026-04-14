
import React from 'react';
import { BookOpen, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        <a href="https://sems.ae/" className="flex items-center mb-2 md:mb-0">
          <img 
            src="/sems-logo.png" 
            alt="SEMS Logo" 
            className="h-[80px]" 
          />
        </a>
        
        <nav className="flex items-center space-x-6">
          <a href="https://sems.ae" className="text-gray-700 hover:text-primary text-sm lg:text-base transition font-medium">
            Home
          </a>
          <Link to="/courses" className="text-gray-700 hover:text-primary text-sm lg:text-base transition font-medium">
            Courses
          </Link>
          <Link 
            to="/registration"
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-2 rounded-md transition shadow-sm text-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Enroll Now</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
