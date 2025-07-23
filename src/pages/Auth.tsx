import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Switch, useColorScheme, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { useAuth } from '../hooks/use-auth';
import { useTheme } from '../hooks/use-theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { commonStyles } from '../styles/common';

export default function AuthScreen() {
  const { theme, setTheme, palette } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signIn, signUp, preferences } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [inscriptionSuccess, setInscriptionSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setError('');
    if (!email || !password || (activeTab === 'signup' && (!prenom || !nom))) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'login') {
        const result = await signIn(email, password);
        if (result.success) {
          // Redirige vers l’onboarding santé si non complété, sinon Dashboard
          setTimeout(() => {
            if (preferences && preferences.onboardingCompleted === false) {
              navigation.navigate('OnboardingSante');
            } else {
              navigation.navigate('Dashboard');
            }
          }, 100);
        } else if (result.error && typeof result.error === 'object' && 'message' in result.error && typeof result.error.message === 'string' && result.error.message.toLowerCase().includes('email not confirmed')) {
          setError('Votre email n’a pas encore été confirmé. Veuillez vérifier votre boîte mail (y compris les spams) pour activer votre compte.');
        }
      } else {
        // Inscription : envoie prénom et nom à Supabase
        const result = await signUp(email, password, prenom, nom);
        if (result.success) {
          setInscriptionSuccess(true);
          setActiveTab('login');
          
        }
      }
    } catch (error) {
      setError('Une erreur est survenue.');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 20 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Header avec toggle dark mode */}
          <View style={{ position: 'absolute', top: 0, right: 0, padding: 16 }}>
            <TouchableOpacity
              accessibilityLabel="Basculer le mode sombre"
              accessible={true}
              onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              style={[{ padding: 8, borderRadius: 999 }, { backgroundColor: palette.card }]}
            >
              <Feather name={theme === 'dark' ? 'moon' : 'sun'} size={20} color={palette.primary} />
            </TouchableOpacity>
          </View>

          {/* Logo et titre */}
          <View style={{ alignItems: 'center', marginBottom: 8 }}>
            <View style={[{ width: 80, height: 80, borderRadius: 999, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }]}>
              <Feather name="heart" size={40} color={palette.background} />
            </View>
            <Text style={[{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }, { color: palette.text }]}>Intimity</Text>
            <Text style={[{ fontSize: 16 }, { color: palette.textSecondary }]}> 
              {activeTab === 'login' ? 'Connexion' : 'Créer un compte'}
            </Text>
          </View>

          {/* Tabs */}
          <View style={[{ flexDirection: 'row', borderRadius: 10, backgroundColor: palette.card, marginBottom: 24 }]}>
            <TouchableOpacity
              accessibilityLabel="Onglet Connexion"
              accessible={true}
              style={[
                { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
                activeTab === 'login' && { backgroundColor: palette.primary }
              ]}
              onPress={() => setActiveTab('login')}
            >
              <Text style={[
                { fontWeight: '600' },
                activeTab === 'login' 
                  ? { color: palette.background }
                  : { color: palette.textSecondary }
              ]}>Connexion</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="Onglet Inscription"
              accessible={true}
              style={[
                { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
                activeTab === 'signup' && { backgroundColor: palette.primary }
              ]}
              onPress={() => setActiveTab('signup')}
            >
              <Text style={[
                { fontWeight: '600' },
                activeTab === 'signup' 
                  ? { color: palette.background }
                  : { color: palette.textSecondary }
              ]}>Inscription</Text>
            </TouchableOpacity>
          </View>

          {/* Formulaire */}
          <View style={{ gap: 16 }}>
            {inscriptionSuccess && (
              <View style={{ marginBottom: 16, backgroundColor: palette.secondary, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: palette.primary }}>
                <Text style={{ color: palette.primary, fontWeight: 'bold', textAlign: 'center' }}>
                  Inscription réussie ! Un email de confirmation vient de vous être envoyé. Veuillez vérifier votre boîte mail (y compris les spams) pour activer votre compte.
                </Text>
              </View>
            )}
            {error ? (
              <Text style={{ color: palette.primary, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>{
                error.includes('n’a pas encore été confirmé')
                  ? 'Votre email n’a pas encore été confirmé. Veuillez vérifier votre boîte mail (y compris les spams) pour activer votre compte.'
                  : error
              }</Text>
            ) : null}
            {activeTab === 'signup' && (
              <>
                <Text style={[commonStyles.label, { color: palette.textSecondary }]}>Prénom</Text>
                <TextInput
                  accessibilityLabel="Saisir votre prénom"
                  accessible={true}
                  style={[commonStyles.input, { borderColor: palette.border, backgroundColor: palette.card, color: palette.text }]}
                  placeholder="Votre prénom"
                  placeholderTextColor={palette.placeholder}
                  value={prenom}
                  onChangeText={setPrenom}
                  autoCapitalize="words"
                />
                <Text style={[commonStyles.label, { color: palette.textSecondary }]}>Nom</Text>
                <TextInput
                  accessibilityLabel="Saisir votre nom"
                  accessible={true}
                  style={[commonStyles.input, { borderColor: palette.border, backgroundColor: palette.card, color: palette.text }]}
                  placeholder="Votre nom"
                  placeholderTextColor={palette.placeholder}
                  value={nom}
                  onChangeText={setNom}
                  autoCapitalize="words"
                />
              </>
            )}

            <View>
              <Text style={[commonStyles.label, { color: palette.textSecondary }]}>Email</Text>
              <TextInput
                accessibilityLabel="Saisir votre email"
                accessible={true}
                style={[commonStyles.input, { borderColor: palette.border, backgroundColor: palette.card, color: palette.text }]}
                placeholder="votre@email.com"
                placeholderTextColor={palette.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View>
              <Text style={[commonStyles.label, { color: palette.textSecondary }]}>Mot de passe</Text>
              <TextInput
                accessibilityLabel="Saisir votre mot de passe"
                accessible={true}
                style={[commonStyles.input, { borderColor: palette.border, backgroundColor: palette.card, color: palette.text }]}
                placeholder="Votre mot de passe"
                placeholderTextColor={palette.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            {/* Lien mot de passe oublié (connexion uniquement) */}
            {activeTab === 'login' && (
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}> 
                <Text style={{ color: palette.primary, textAlign: 'right', textDecorationLine: 'underline', fontWeight: 'bold', marginBottom: 8 }}>
                  Mot de passe oublié ?
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              accessibilityLabel="Bouton de connexion ou d'inscription"
              accessible={true}
              style={[commonStyles.buttonPrimary, loading && { opacity: 0.7 }, { backgroundColor: palette.button, shadowColor: palette.button }]}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={[commonStyles.buttonText, { color: palette.buttonText }]}> 
                {loading ? 'Chargement...' : (activeTab === 'login' ? 'Se connecter' : 'S\'inscrire')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={{ marginTop: 32, alignItems: 'center' }}>
            <Text style={[{ fontSize: 13 }, { color: palette.textSecondary }]}> 
              {activeTab === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
            </Text>
            <TouchableOpacity onPress={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')}>
              <Text style={[{ fontSize: 13, fontWeight: '600', marginTop: 4 }, { color: palette.primary }]}> 
                {activeTab === 'login' ? 'Créer un compte' : 'Se connecter'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}