import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, useColorScheme, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const darkColors = {
  background: '#121212',
  surface: '#1E1E1E',
  elevated: '#2C2C2E',
  primary: '#FF8FA3',
  secondary: '#A5789D',
  text: '#E0E0E0',
  textSecondary: '#A0A0A0',
  border: '#3C3C3E',
  accentFertility: '#4CD9B1',
  accentRules: '#FF6D6D',
  overlay: '#00000070',
};

export default function LoadingScreen() {
  const systemScheme = useColorScheme();
  const theme = systemScheme === 'dark' ? 'dark' : 'light';
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    // Afficher le bouton de retry après 5 secondes
    const timer = setTimeout(() => {
      setShowRetry(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    // Recharger la page
    window.location.reload();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme === 'dark' ? darkColors.background : '#fff' }}>
      <View style={{ alignItems: 'center' }}>
        <View style={{ padding: 24, borderRadius: 999, marginBottom: 16, backgroundColor: theme === 'dark' ? darkColors.surface : '#fce7f3' }}>
          <Feather 
            name="heart" 
            size={48} 
            color={theme === 'dark' ? darkColors.primary : '#e11d48'} 
          />
        </View>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: theme === 'dark' ? darkColors.primary : '#e11d48' }}>
          INTIMITY
        </Text>
        <Text style={{ fontSize: 18, marginBottom: 24, color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>
          Chargement...
        </Text>
        <ActivityIndicator 
          size="large" 
          color={theme === 'dark' ? darkColors.primary : '#e11d48'} 
        />
        
        {showRetry && (
          <TouchableOpacity
            style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999, backgroundColor: theme === 'dark' ? darkColors.primary : '#e11d48' }}
            onPress={handleRetry}
          >
            <Text style={{ fontSize: 18, fontWeight: 'semibold', color: theme === 'dark' ? darkColors.background : '#fff' }}>
              Réessayer
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
} 