import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { useTheme } from '../hooks/use-theme';
import { useAuth } from '../hooks/use-auth';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const palette = {
    light: {
      background: '#FFEDF3',
      primary: '#FF4F8B',
      secondary: '#F5F5F5',
      text: '#1C1C1C',
      textSecondary: '#A3B4FF',
      border: '#FF4F8B',
    },
    dark: {
      background: '#1C1C1C',
      primary: '#FF4F8B',
      secondary: '#23232B',
      text: '#FFEDF3',
      textSecondary: '#A3B4FF',
      border: '#FF4F8B',
    }
  }[theme === 'dark' ? 'dark' : 'light'];

  const handleSend = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await resetPassword(email);
      setMessage('Un email de réinitialisation a été envoyé !');
    } catch (e: any) {
      setError(e.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.container, { backgroundColor: palette.background }]}> 
        <Text style={[styles.title, { color: palette.primary }]}>Réinitialiser le mot de passe</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>Entrez votre adresse email pour recevoir un lien de réinitialisation.</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: palette.secondary,
              color: palette.text,
              borderColor: palette.border,
            },
          ]}
          placeholder="Votre email"
          placeholderTextColor={palette.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {error ? <Text style={[styles.error, { color: palette.primary }]}>{error}</Text> : null}
        {message ? <Text style={[styles.success, { color: palette.textSecondary }]}>{message}</Text> : null}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: palette.primary }]}
          onPress={handleSend}
          disabled={loading || !email}
        >
          {loading ? (
            <ActivityIndicator color={palette.background} />
          ) : (
            <Text style={{ color: palette.background, fontWeight: 'bold', fontSize: 16 }}>Envoyer le lien de réinitialisation</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 10,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    width: '100%',
    maxWidth: 340,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 8,
  },
  error: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  success: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 14,
  },
}); 