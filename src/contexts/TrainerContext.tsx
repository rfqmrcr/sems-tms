import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface TrainerContextType {
  isTrainer: boolean;
  trainerId: string | null;
  trainerData: any | null;
  loading: boolean;
}

const TrainerContext = createContext<TrainerContextType>({
  isTrainer: false,
  trainerId: null,
  trainerData: null,
  loading: true,
});

export const useTrainer = () => useContext(TrainerContext);

export const TrainerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isTrainer, setIsTrainer] = useState(false);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [trainerData, setTrainerData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTrainerRole = async () => {
      if (!user) {
        setIsTrainer(false);
        setTrainerId(null);
        setTrainerData(null);
        setLoading(false);
        return;
      }

      if (user.role === 'trainer') {
        setIsTrainer(true);
        setTrainerId('t1');
        setTrainerData({
          id: 't1',
          user_id: user.id,
          name: 'Jane Smith',
          specialization: 'React & UI',
          profile_image_url: null,
          bio: 'Expert UI Trainer'
        });
      } else {
        setIsTrainer(false);
        setTrainerId(null);
        setTrainerData(null);
      }
      setLoading(false);
    };

    checkTrainerRole();
  }, [user]);

  return (
    <TrainerContext.Provider value={{ isTrainer, trainerId, trainerData, loading }}>
      {children}
    </TrainerContext.Provider>
  );
};
