import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { useAuth } from '../hooks/use-auth';

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    let timeoutId;
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleLogin = async () => {
    if (loading || isNavigating) return;

    try {
      setIsNavigating(true);
      const { data, error } = await signIn(email, password);

      if (error) throw error;

      // Délai minimal pour éviter les transitions trop rapides
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (data?.user) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      }
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <View>
      {/* ...existing code... */}
      <Button
        onPress={handleLogin}
        disabled={loading || isNavigating}
        title={loading ? 'Connexion en cours...' : 'Se connecter'}
      />
      {/* ...existing code... */}
    </View>
  );
};
        });
      }
    } catch (error) {
      console.error('Login error:', error);

      if (retryCount < MAX_RETRIES) {
        setRetryCount((prev) => prev + 1);
        Alert.alert(
          'Erreur de connexion',
          'Une nouvelle tentative va être effectuée automatiquement.'
        );
        handleLogin(email, password);
      } else {
        Alert.alert(
          'Erreur de connexion',
          'Impossible de se connecter. Veuillez réessayer plus tard.'
        );
        setRetryCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {/* ...existing code... */}
      <Button
        onPress={() => handleLogin(email, password)}
        disabled={loading}
        title={loading ? 'Connexion en cours...' : 'Se connecter'}
      />
      {/* ...existing code... */}
    </View>
  );
};
