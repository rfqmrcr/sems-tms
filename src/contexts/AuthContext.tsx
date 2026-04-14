import * as React from 'react';
import { delay } from '@/data/mockDatabase';

type User = { id: string; email: string; role: string };
type Session = { user: User; access_token: string };

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; }>;
  signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = 'sems_tms_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const stored = localStorage.getItem(LOCAL_SESSION_KEY);
    if (stored) {
      try {
        const parsedSession = JSON.parse(stored);
        setSession(parsedSession);
        setUser(parsedSession.user);
      } catch (e) {
        localStorage.removeItem(LOCAL_SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await delay(500); // Simulate network
      let mockUser: User;
      
      if (email === 'admin@admin.com') {
        mockUser = { id: 'admin123', email, role: 'admin' };
      } else if (email === 'trainer@trainer.com') {
        mockUser = { id: 'trainer123', email, role: 'trainer' };
      } else {
        throw new Error('Invalid login credentials. Try admin@admin.com or trainer@trainer.com');
      }

      const mockSession: Session = { user: mockUser, access_token: 'mock-token-' + Date.now() };
      
      setSession(mockSession);
      setUser(mockUser);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(mockSession));
      
      return { error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    await delay(500);
    return { error: new Error('Sign up is disabled in prototype mode') };
  };

  const signOut = async () => {
    await delay(300);
    setUser(null);
    setSession(null);
    localStorage.removeItem(LOCAL_SESSION_KEY);
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
