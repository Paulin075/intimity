import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthScreen from './pages/Auth';
import CalendarScreen from './pages/Calendar';
import DashboardScreen from './pages/Dashboard';
import SymptomsScreen from './pages/Symptoms';
import InsightsScreen from './pages/Insights';
import SettingsScreen from './pages/Settings';
import LoadingScreen from './components/LoadingScreen';
import AuthStateHandler from './components/AuthStateHandler';
import { useAuth } from './hooks/use-auth';
import { Platform, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { enableScreens } from 'react-native-screens';
import { useTheme } from './hooks/use-theme';
import ForgotPasswordScreen from './pages/ForgotPassword';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import WelcomeScreen from './pages/Welcome'; // slides marketing (ancien OnboardingScreen)
enableScreens(false);

let createNativeStackNavigator: any;
if (Platform.OS !== 'web') {
  // @ts-ignore
  createNativeStackNavigator = require('@react-navigation/native-stack').createNativeStackNavigator;
}

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Auth: { tab: 'signup' | 'login' };
  Dashboard: undefined;
  Calendar: undefined;
  Symptoms: undefined;
  Insights: undefined;
  Settings: undefined;
  ForgotPassword: undefined;
};

const isWeb = Platform.OS === 'web';
let Stack: ReturnType<typeof createStackNavigator<RootStackParamList>>;
if (isWeb) {
  Stack = createStackNavigator<RootStackParamList>();
} else {
  Stack = createNativeStackNavigator<RootStackParamList>();
}

function OnboardingSanteScreen() {
  const { user, updatePreferences, completeOnboarding } = useAuth();
  const { palette } = useTheme();
  const [step, setStep] = useState(0);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [lastPeriod, setLastPeriod] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [goal, setGoal] = useState('Suivi du cycle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const steps = [
    {
      title: 'Bienvenue !',
      content: (
        <>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: palette.primary, marginBottom: 12 }}>Bienvenue sur Intimity</Text>
          <Text style={{ color: palette.text, fontSize: 16, textAlign: 'center' }}>
            Quelques questions pour personnaliser ton expérience et mieux comprendre ton cycle.
          </Text>
        </>
      ),
    },
    {
      title: 'Durée du cycle',
      content: (
        <>
          <Text style={{ color: palette.text, fontSize: 16, marginBottom: 8 }}>Durée moyenne de ton cycle (en jours)</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <TextInput
              style={{ borderWidth: 1, borderColor: palette.border, borderRadius: 8, padding: 12, width: 80, color: palette.text, backgroundColor: palette.secondary, textAlign: 'center', fontSize: 18 }}
              keyboardType="numeric"
              value={cycleLength.toString()}
              onChangeText={v => setCycleLength(Number(v.replace(/[^0-9]/g, '')))}
              maxLength={2}
            />
            <Text style={{ marginLeft: 8, color: palette.text }}>jours</Text>
          </View>
        </>
      ),
    },
    {
      title: 'Durée des règles',
      content: (
        <>
          <Text style={{ color: palette.text, fontSize: 16, marginBottom: 8 }}>Durée moyenne de tes règles (en jours)</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <TextInput
              style={{ borderWidth: 1, borderColor: palette.border, borderRadius: 8, padding: 12, width: 80, color: palette.text, backgroundColor: palette.secondary, textAlign: 'center', fontSize: 18 }}
              keyboardType="numeric"
              value={periodLength.toString()}
              onChangeText={v => setPeriodLength(Number(v.replace(/[^0-9]/g, '')))}
              maxLength={2}
            />
            <Text style={{ marginLeft: 8, color: palette.text }}>jours</Text>
          </View>
        </>
      ),
    },
    {
      title: 'Dernières règles',
      content: (
        <>
          <Text style={{ color: palette.text, fontSize: 16, marginBottom: 8 }}>Date du premier jour de tes dernières règles</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: palette.border, borderRadius: 8, padding: 12, color: palette.text, backgroundColor: palette.secondary, textAlign: 'center', fontSize: 18 }}
            placeholder="AAAA-MM-JJ"
            placeholderTextColor={palette.textSecondary}
            value={lastPeriod}
            onChangeText={setLastPeriod}
            maxLength={10}
          />
        </>
      ),
    },
    {
      title: 'Notifications',
      content: (
        <>
          <Text style={{ color: palette.text, fontSize: 16, marginBottom: 8 }}>Souhaites-tu recevoir des notifications et rappels ?</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24 }}>
            <TouchableOpacity onPress={() => setNotifications(true)} style={{ backgroundColor: notifications ? palette.primary : palette.secondary, borderRadius: 8, padding: 12, marginRight: 8 }}>
              <Text style={{ color: notifications ? palette.background : palette.text }}>Oui</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setNotifications(false)} style={{ backgroundColor: !notifications ? palette.primary : palette.secondary, borderRadius: 8, padding: 12 }}>
              <Text style={{ color: !notifications ? palette.background : palette.text }}>Non</Text>
            </TouchableOpacity>
          </View>
        </>
      ),
    },
    {
      title: 'Objectif',
      content: (
        <>
          <Text style={{ color: palette.text, fontSize: 16, marginBottom: 8 }}>Quel est ton objectif principal ?</Text>
          <View style={{ gap: 12 }}>
            {['Suivi du cycle', 'Conception', 'Bien-être', 'Autre'].map(opt => (
              <TouchableOpacity key={opt} onPress={() => setGoal(opt)} style={{ backgroundColor: goal === opt ? palette.primary : palette.secondary, borderRadius: 8, padding: 12, marginBottom: 4 }}>
                <Text style={{ color: goal === opt ? palette.background : palette.text }}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ),
    },
    {
      title: 'Résumé',
      content: (
        <>
          <Text style={{ color: palette.text, fontSize: 16, marginBottom: 8 }}>Vérifie tes informations :</Text>
          <Text style={{ color: palette.text }}>Cycle : <Text style={{ fontWeight: 'bold' }}>{cycleLength} jours</Text></Text>
          <Text style={{ color: palette.text }}>Règles : <Text style={{ fontWeight: 'bold' }}>{periodLength} jours</Text></Text>
          <Text style={{ color: palette.text }}>Dernières règles : <Text style={{ fontWeight: 'bold' }}>{lastPeriod}</Text></Text>
          <Text style={{ color: palette.text }}>Notifications : <Text style={{ fontWeight: 'bold' }}>{notifications ? 'Oui' : 'Non'}</Text></Text>
          <Text style={{ color: palette.text }}>Objectif : <Text style={{ fontWeight: 'bold' }}>{goal}</Text></Text>
        </>
      ),
    },
  ];

  const handleNext = () => {
    setError('');
    if (step === 1 && (cycleLength < 15 || cycleLength > 45)) {
      setError('La durée du cycle doit être entre 15 et 45 jours.');
      return;
    }
    if (step === 2 && (periodLength < 2 || periodLength > 10)) {
      setError('La durée des règles doit être entre 2 et 10 jours.');
      return;
    }
    if (step === 3 && !/^\d{4}-\d{2}-\d{2}$/.test(lastPeriod)) {
      setError('Format de date invalide (AAAA-MM-JJ).');
      return;
    }
    setStep(s => s + 1);
  };

  const handlePrev = () => {
    setError('');
    setStep(s => Math.max(0, s - 1));
  };

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    try {
      await updatePreferences({
        cycleLength,
        periodLength,
        lastPeriod,
        notifications,
        reminders,
        onboardingCompleted: true,
        goal,
      });
      await completeOnboarding({
        cycleLength,
        periodLength,
        lastPeriod,
        notifications,
        reminders,
      });
    } catch (e) {
      setError('Erreur lors de la sauvegarde.');
      setLoading(false);
      return;
    }
    setLoading(false);
    // Rediriger vers le dashboard avec navigation native
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <View style={{ width: '100%', maxWidth: 400, backgroundColor: palette.secondary, borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 }}>
        <Text style={{ color: palette.primary, fontWeight: 'bold', fontSize: 18, marginBottom: 12, textAlign: 'center' }}>{steps[step].title}</Text>
        {steps[step].content}
        {error ? <Text style={{ color: palette.primary, marginTop: 8, textAlign: 'center' }}>{error}</Text> : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
          {step > 0 ? (
            <TouchableOpacity onPress={handlePrev} style={{ padding: 12 }}>
              <Text style={{ color: palette.primary }}>Précédent</Text>
            </TouchableOpacity>
          ) : <View />}
          {step < steps.length - 1 ? (
            <TouchableOpacity onPress={handleNext} style={{ backgroundColor: palette.primary, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 24 }}>
              <Text style={{ color: palette.background, fontWeight: 'bold' }}>Suivant</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleFinish} style={{ backgroundColor: palette.primary, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 24 }} disabled={loading}>
              <Text style={{ color: palette.background, fontWeight: 'bold' }}>{loading ? 'Enregistrement...' : 'Terminer'}</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: palette.textSecondary, fontSize: 13 }}>Étape {step + 1} / {steps.length}</Text>
        </View>
      </View>
    </View>
  );
}

function AppContent() {
  const { user, loading, preferences } = useAuth();
  const { palette } = useTheme();

  // Afficher un écran de chargement pendant la vérification
  if (loading) {
    return <LoadingScreen />;
  }

  let initialRouteName = 'Welcome';
  if (user) {
    if (preferences && preferences.onboardingCompleted === false) {
      initialRouteName = 'Onboarding';
    } else {
      initialRouteName = 'Dashboard';
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <NavigationContainer>
        <AuthStateHandler />
        <Stack.Navigator 
          initialRouteName={initialRouteName}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingSanteScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Calendar" component={CalendarScreen} />
          <Stack.Screen name="Symptoms" component={SymptomsScreen} />
          <Stack.Screen name="Insights" component={InsightsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}