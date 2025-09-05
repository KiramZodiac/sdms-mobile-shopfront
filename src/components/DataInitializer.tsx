import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, ensureConnection } from '@/integrations/supabase/client';

interface DataInitializerContextType {
  isInitialized: boolean;
  isConnected: boolean;
  error: string | null;
}

const DataInitializerContext = createContext<DataInitializerContextType>({
  isInitialized: false,
  isConnected: false,
  error: null,
});

export const useDataInitializer = () => useContext(DataInitializerContext);

interface DataInitializerProviderProps {
  children: ReactNode;
}

export const DataInitializerProvider = ({ children }: DataInitializerProviderProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('Initializing data connection...');
        
        // Test Supabase connection
        const connected = await ensureConnection();
        setIsConnected(connected);
        
        if (!connected) {
          setError('Unable to connect to database');
        }

        // Add a small delay to show skeleton
        setTimeout(() => {
          setIsInitialized(true);
        }, 1000);
        
      } catch (err: any) {
        console.error('Data initialization failed:', err);
        setError(err.message || 'Failed to initialize data');
        setIsInitialized(true);
      }
    };

    initializeData();
  }, []);

  return (
    <DataInitializerContext.Provider value={{ isInitialized, isConnected, error }}>
      {children}
    </DataInitializerContext.Provider>
  );
}; 