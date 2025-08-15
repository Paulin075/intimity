import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Alert } from 'react-native';

export const useAuth = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Écouter les changements d'authentification
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Vérification explicite de la session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        throw new Error('Session non établie');
      }

      setSession(currentSession);
      return { data, error: null };
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur de connexion';
      setError(errorMessage);
      Alert.alert('Erreur', errorMessage);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    loading,
    session,
  };
};