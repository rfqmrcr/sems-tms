
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, LogIn, UserPlus } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

const HeaderAuth: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully"
      });
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      // Still navigate to auth page even if there's an error
      toast({
        title: "Notice",
        description: "You have been signed out, but there may have been an issue with the session"
      });
      navigate('/auth');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <span className="hidden sm:inline">{user.email}</span>
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs uppercase">
                {user.email?.charAt(0) || 'U'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/auth">
              <LogIn className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link to="/auth?tab=register">
              <UserPlus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Register</span>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default HeaderAuth;
