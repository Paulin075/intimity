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
import { Platform, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { enableScreens } from 'react-native-screens';
import { useTheme } from './hooks/use-theme';
import ForgotPasswordScreen from './pages/ForgotPassword';

import { useNavigation } from '@react-navigation/native';
import WelcomeScreen from './pages/Welcome'; // slides marketing (ancien OnboardingScreen)
import OnboardingScreen from './components/OnboardingScreen';
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
let Stack: any;
if (isWeb) {
  Stack = createStackNavigator();
} else {
  Stack = createNativeStackNavigator();
}

// Ancien composant d'onboarding supprimé - remplacé par OnboardingScreen

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
          screenOptions={{ 
            headerShown: false,
            cardStyle: { backgroundColor: 'white' },
            headerStyle: {
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            },
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
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