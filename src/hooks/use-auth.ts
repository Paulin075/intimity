import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Alert } from 'react-native';

// Mode de test pour contourner Supabase
const TEST_MODE = false; // Mettre à false pour utiliser Supabase réel

export interface UserPreferences {
  cycleLength: number;
  periodLength: number;
  lastPeriod: string;
  notifications: boolean;
  reminders: boolean;
  onboardingCompleted: boolean;
  theme?: string;
  language?: string;
  goal?: string;
}

export interface AuthUser {
  id: string; // ID Auth
  email: string;
  name?: string;
  birthDate?: string;
  utilisatriceId?: string; // ID de la table utilisatrices
  taille?: number;
  poids?: number;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Timeout pour éviter le loading infini
    const timeout = setTimeout(() => {
      setLoading(false);
      setError('Connexion trop lente ou indisponible.');
    }, 8000);

    if (TEST_MODE) {
      // Mode de test : simuler un utilisateur connecté
      setTimeout(() => {
        setUser({
          id: 'test-user',
          email: 'owldesmond8@gmail.com',
          name: 'Test User',
          birthDate: '1990-01-01',
          utilisatriceId: 'test-utilisatrice-id',
        });
        setPreferences({
          cycleLength: 28,
          periodLength: 5,
          lastPeriod: new Date().toISOString().split('T')[0],
          notifications: true,
          reminders: true,
          onboardingCompleted: true,
          theme: 'clair',
          language: 'fr',
          goal: 'Suivi du cycle',
        });
        setLoading(false);
      }, 1000);
      return;
    }

    // Vérifier l'état d'authentification initial
    checkUser().finally(() => {
      clearTimeout(timeout);
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        if (session?.user) {
          // Chercher l'ID de la table utilisatrices
          let utilisatriceId = undefined;
          if (session.user.email) {
            const { data: utilisatriceData } = await supabase
              .from('utilisatrices')
              .select('id', { head: false })
              .eq('email', session.user.email)
              .single();
            utilisatriceId = utilisatriceData?.id;
          }
          const userData = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.nom,
            birthDate: session.user.user_metadata?.date_naissance,
            utilisatriceId,
          };
          setUser(userData);
          console.log('Loading preferences for user:', session.user.id);
          await loadUserPreferences(session.user.id);
        } else {
          setUser(null);
          // Pour un utilisateur non connecté, définir les préférences par défaut
          setPreferences({
            cycleLength: 28,
            periodLength: 5,
            lastPeriod: new Date().toISOString().split('T')[0],
            notifications: true,
            reminders: true,
            onboardingCompleted: false,
            theme: 'clair',
            language: 'fr',
            goal: 'Suivi du cycle',
          });
        }
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    if (TEST_MODE) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session?.user?.email);
      if (session?.user) {
        // Chercher l'ID de la table utilisatrices
        let utilisatriceId = undefined;
        if (session.user.email) {
          const { data: utilisatriceData } = await supabase
            .from('utilisatrices')
            .select('id', { head: false })
            .eq('email', session.user.email)
            .single();
          utilisatriceId = utilisatriceData?.id;
        }
        const userData = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.nom,
          birthDate: session.user.user_metadata?.date_naissance,
          utilisatriceId,
        };
        setUser(userData);
        console.log('Loading preferences for existing user:', session.user.id);
        await loadUserPreferences(session.user.id);
      } else {
        // Utilisateur non connecté, définir les préférences par défaut
        setPreferences({
          cycleLength: 28,
          periodLength: 5,
          lastPeriod: new Date().toISOString().split('T')[0],
          notifications: true,
          reminders: true,
          onboardingCompleted: false,
          theme: 'clair',
          language: 'fr',
          goal: 'Suivi du cycle',
        });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', error);
      // En cas d'erreur, définir les préférences par défaut
      setPreferences({
        cycleLength: 28,
        periodLength: 5,
        lastPeriod: new Date().toISOString().split('T')[0],
        notifications: true,
        reminders: true,
        onboardingCompleted: false,
        theme: 'clair',
        language: 'fr',
        goal: 'Suivi du cycle',
      });
    }
  };

  const loadUserPreferences = async (userId: string) => {
    if (TEST_MODE) return;

    try {
      console.log('Attempting to load preferences for user:', userId);

      // Essayer d'abord la table parametres
      const { data: parametresData, error: parametresError } = await supabase
        .from('parametres' as any)
        .select('*')
        .eq('utilisatrice_id', userId)
        .single();

      if (parametresError && parametresError.code !== 'PGRST116') {
        console.error('Error loading parametres:', parametresError);
      }

      if (parametresData) {
        console.log('Parametres loaded successfully:', parametresData);
        setPreferences({
          cycleLength: (parametresData as any).duree_regles || 28,
          periodLength: 5, // Valeur par défaut
          lastPeriod: new Date().toISOString().split('T')[0], // À calculer
          notifications: (parametresData as any).notifications ?? true,
          reminders: true, // Valeur par défaut
          onboardingCompleted: true, // Si on a des paramètres, l'onboarding est fait
          theme: (parametresData as any).theme || 'clair',
          language: (parametresData as any).langue || 'fr',
          goal: (parametresData as any).objectif || 'Suivi du cycle',
        });
        return;
      }

      // Si pas de paramètres, essayer user_preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_preferences' as any)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (preferencesError) {
        if (preferencesError.code === 'PGRST116') { // No rows returned
          console.info('No preferences found, creating default preferences');
          // Créer des préférences par défaut
          const defaultPreferences = {
            cycleLength: 28,
            periodLength: 5,
            lastPeriod: new Date().toISOString().split('T')[0],
            notifications: true,
            reminders: true,
            onboardingCompleted: false, // <-- ici !
            theme: 'clair',
            language: 'fr',
            goal: 'Suivi du cycle',
          };
          setPreferences(defaultPreferences);

          // Essayer de sauvegarder dans parametres
          try {
            await supabase
              .from('parametres' as any)
              .upsert({
                utilisatrice_id: userId,
                theme: (defaultPreferences as any).theme,
                notifications: (defaultPreferences as any).notifications,
                langue: (defaultPreferences as any).language,
                duree_regles: (defaultPreferences as any).cycleLength,
                objectif: (defaultPreferences as any).goal,
              });
            console.log('Default parametres saved successfully');
          } catch (saveError) {
            console.error('Error saving default parametres:', saveError);
          }
        } else {
          // Autre erreur, utiliser les préférences par défaut
          console.error('Error loading preferences:', preferencesError);
          setPreferences({
            cycleLength: 28,
            periodLength: 5,
            lastPeriod: new Date().toISOString().split('T')[0],
            notifications: true,
            reminders: true,
            onboardingCompleted: false,
            theme: 'clair',
            language: 'fr',
            goal: 'Suivi du cycle',
          });
        }
        return;
      }

      if (preferencesData) {
        console.log('Preferences loaded successfully:', preferencesData);
        setPreferences({
          cycleLength: (preferencesData as any).cycle_length || 28,
          periodLength: (preferencesData as any).period_length || 5,
          lastPeriod: (preferencesData as any).last_period || new Date().toISOString().split('T')[0],
          notifications: (preferencesData as any).notifications ?? true,
          reminders: (preferencesData as any).reminders ?? true,
          onboardingCompleted: (preferencesData as any).onboarding_completed ?? true,
          theme: (preferencesData as any).theme || 'clair',
          language: (preferencesData as any).language || 'fr',
          goal: (preferencesData as any).goal || 'Suivi du cycle',
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
      // En cas d'erreur, utiliser les préférences par défaut
      setPreferences({
        cycleLength: 28,
        periodLength: 5,
        lastPeriod: new Date().toISOString().split('T')[0],
        notifications: true,
        reminders: true,
        onboardingCompleted: false,
        theme: 'clair',
        language: 'fr',
        goal: 'Suivi du cycle',
      });
    }
  };

  const signUp = async (email: string, password: string, prenom: string, nom: string) => {
    if (TEST_MODE) {
      Alert.alert('Mode Test', 'Inscription simulée en mode test');
      return { success: true, data: null };
    }
    try {
      console.log('Avant signUp');
      const { data, error } = await supabase.auth.signUp({
        email,
        password
        // options: {
        //   data: {
        //     prenom: prenom,
        //     nom: nom,
        //     date_naissance: new Date().toISOString().split('T')[0],
        //   },
        // },
      });
      console.log('Après signUp');
      if (error) {
        Alert.alert('Erreur Auth', error.message);
        console.error('Erreur Auth:', error);
        return { success: false, error };
      }

      // Insertion dans utilisatrices
      console.log('Avant insert utilisatrices');
      const { error: insertError } = await supabase
        .from('utilisatrices')
        .insert([{
          email,
          prenom,
          nom,
          date_naissance: new Date().toISOString().split('T')[0],
          mot_de_passe_hash: 'external',
        }]);
      console.log('Après insert utilisatrices');
      if (insertError) {
        Alert.alert('Erreur Utilisatrice', insertError.message);
        console.error('Erreur Utilisatrice:', insertError);
        return { success: false, error: insertError };
      }

      // Récupérer l'id de l'utilisatrice
      let utilisatriceId = null;
      const { data: userRow } = await supabase
        .from('utilisatrices')
        .select('id')
        .eq('email', email)
        .single();
      utilisatriceId = userRow?.id;
      // Récupérer l'id de l'utilisateur auth (user.id)
      const userId = data?.user?.id;
      console.log('userId pour user_preferences:', userId);
      // Créer la ligne user_preferences si elle n'existe pas
      if (userId) {
        await supabase
          .from('user_preferences')
          .upsert([
            {
              user_id: userId,
              cycle_length: 28,
              period_length: 5,
              last_period: new Date().toISOString().split('T')[0],
              notifications: true,
              reminders: true,
              onboarding_completed: false,
            }
          ], { onConflict: 'user_id' });
        // Créer la ligne parametres si besoin
        if (utilisatriceId && typeof utilisatriceId === 'string') {
          await supabase
            .from('parametres')
            .upsert([
              {
                utilisatrice_id: utilisatriceId,
                theme: 'clair',
                notifications: true,
                langue: 'fr',
                duree_regles: 28,
                objectif: 'Suivi du cycle',
              }
            ], { onConflict: 'utilisatrice_id' });
        }
      }
      Alert.alert('Succès', 'Compte créé ! Vérifiez votre email pour valider votre compte.');
      return { success: true, data };
    } catch (e) {
      Alert.alert('Erreur Exception', JSON.stringify(e));
      console.error('Exception:', e);
      return { success: false, error: e };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (TEST_MODE) {
      // Simuler une connexion réussie
      setUser({
        id: 'test-user',
        email: email,
        name: 'Test User',
        birthDate: '1990-01-01',
        utilisatriceId: 'test-utilisatrice-id',
      });
      setPreferences({
        cycleLength: 28,
        periodLength: 5,
        lastPeriod: new Date().toISOString().split('T')[0],
        notifications: true,
        reminders: true,
        onboardingCompleted: true,
        theme: 'clair',
        language: 'fr',
        goal: 'Suivi du cycle',
      });
      Alert.alert('Mode Test', 'Connexion simulée réussie');
      return { success: true, data: null };
    }

    try {
      console.log('Tentative de connexion pour:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erreur de connexion:', error.message);
        Alert.alert('Erreur', error.message);
        return { success: false, error };
      }

      console.log('Connexion réussie pour:', email);
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion.');
      return { success: false, error };
    }
  };

  const signOut = async () => {
    if (TEST_MODE) {
      console.log('Mode test: Déconnexion simulée');
      setUser(null);
      setPreferences(null);
      Alert.alert('Mode Test', 'Déconnexion simulée réussie');
      return { success: true };
    }

    try {
      console.log('Tentative de déconnexion Supabase...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erreur Supabase lors de la déconnexion:', error);
        Alert.alert('Erreur', error.message);
        return { success: false, error };
      }

      console.log('Déconnexion Supabase réussie');
      // Réinitialiser l'état local
      setUser(null);
      setPreferences(null);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion.');
      return { success: false, error };
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return { success: false, error: 'Utilisateur non connecté' };

    if (TEST_MODE) {
      setPreferences(prev => ({ ...prev!, ...newPreferences }));
      return { success: true, data: null };
    }

    try {
      // Mettre à jour dans la table parametres
      const { data, error } = await supabase
        .from('parametres' as any)
        .upsert({
          utilisatrice_id: user.id,
          theme: (newPreferences as any).theme || 'clair',
          notifications: (newPreferences as any).notifications,
          langue: (newPreferences as any).language || 'fr',
          duree_regles: (newPreferences as any).cycleLength,
          objectif: (newPreferences as any).goal || 'Suivi du cycle',
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour des paramètres:', error);
        return { success: false, error };
      }

      setPreferences(prev => ({ ...prev!, ...newPreferences }));
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      return { success: false, error };
    }
  };

  const completeOnboarding = async (config: {
    cycleLength: number;
    periodLength: number;
    lastPeriod: string;
    notifications: boolean;
    reminders: boolean;
  }) => {
    if (!user) return { success: false, error: 'Utilisateur non connecté' };

    if (TEST_MODE) {
      setPreferences({
        cycleLength: config.cycleLength,
        periodLength: config.periodLength,
        lastPeriod: config.lastPeriod,
        notifications: config.notifications,
        reminders: config.reminders,
        onboardingCompleted: true,
        theme: 'clair',
        language: 'fr',
        goal: 'Suivi du cycle',
      });
      return { success: true, data: null };
    }

    try {
      // Sauvegarder dans la table parametres
      const { data, error } = await supabase
        .from('parametres' as any)
        .upsert({
          utilisatrice_id: user.id,
          theme: (config as any).theme || 'clair',
          notifications: config.notifications,
          langue: (config as any).language || 'fr',
          duree_regles: config.cycleLength,
          objectif: (config as any).goal || 'Suivi du cycle',
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la sauvegarde de la configuration:', error);
        return { success: false, error };
      }

      setPreferences({
        cycleLength: config.cycleLength,
        periodLength: config.periodLength,
        lastPeriod: config.lastPeriod,
        notifications: config.notifications,
        reminders: config.reminders,
        onboardingCompleted: true,
        theme: 'clair',
        language: 'fr',
        goal: 'Suivi du cycle',
      });

      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
      return { success: false, error };
    }
  };

  const reloadUser = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('utilisatrices')
      .select('*')
      .eq('email', user.email)
      .single();
    if (!error && data) {
      setUser({
        id: user.id, // ID Auth
        email: data.email,
        name: data.nom,
        birthDate: data.date_naissance,
        utilisatriceId: data.id,
        taille: (data as any).taille ?? undefined,
        poids: (data as any).poids ?? undefined,
      });
    }
  };

  const resetPassword = async (email: string) => {
    if (TEST_MODE) {
      Alert.alert('Mode Test', 'Réinitialisation simulée en mode test');
      return { success: true };
    }
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        Alert.alert('Erreur', error.message);
        return { success: false, error };
      }
      Alert.alert('Succès', 'Un email de réinitialisation a été envoyé.');
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la réinitialisation.');
      return { success: false, error };
    }
  };

  return {
    user,
    loading,
    preferences,
    signUp,
    signIn,
    signOut,
    updatePreferences,
    completeOnboarding,
    reloadUser,
    resetPassword,
  };
} 