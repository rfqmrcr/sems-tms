
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DashboardHeaderProps {
  userEmail?: string | null;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userEmail }) => {
  const { signOut } = useAuth();

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Courses', path: '/admin/courses' },
    { name: 'Registrations', path: '/admin/registrations' },
    { name: 'Trainees', path: '/admin/trainees' },
    { name: 'Invoices', path: '/admin/invoices' },
    { name: 'Quotations', path: '/admin/quotations' },
    { name: 'Attendance', path: '/admin/attendance' },
    { name: 'Reports', path: '/admin/reports' },
    { name: 'Partners', path: '/admin/partners' },
    { name: 'Promo Codes', path: '/admin/promo-codes' },
    { name: 'Email Logs', path: '/admin/email-logs' },
    { name: 'Guide', path: '/admin/guide' },
  ];

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">Admin Portal</h1>
            <p className="text-sm text-gray-600">{userEmail}</p>
          </div>
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={signOut}
                    className="flex items-center text-gray-600 hover:text-primary transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-1" />
                    <span>Sign Out</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign Out from Admin Portal</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <nav className="mt-4">
          <ul className="flex space-x-6 overflow-x-auto">
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `py-2 px-1 border-b-2 ${
                      isActive
                        ? 'border-primary text-primary font-medium'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    } transition-colors`
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default DashboardHeader;
