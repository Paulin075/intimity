import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useColorScheme, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { useAuth } from '../hooks/use-auth';
import { cyclesService } from '../services/cycles';
import { useTheme } from '../hooks/use-theme';
import CyclePrediction from '../components/CyclePrediction';
import type { Cycle, UserPreferences, AuthUser } from '../types';
import { palettes } from '../theme/palette';
import { commonStyles } from '../styles/common';

export default function DashboardScreen() {
  const { theme, setTheme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, preferences, reloadUser } = useAuth();
  
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasCycles, setHasCycles] = useState(true);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [debugCycles, setDebugCycles] = useState<Cycle[]>([]);

  // Animation pour la section prédictions
  const predictionAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(predictionAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [hasCycles, predictions]);

  useFocusEffect(
    React.useCallback(() => {
      if (user && user.utilisatriceId) {
        loadPredictions(user.utilisatriceId);
      }
    }, [user?.utilisatriceId])
  );

  const loadPredictions = async (utilisatriceId: string) => {
    if (!utilisatriceId) return;
    
    setLoading(true);
    setPredictionError(null);
    setTimeoutReached(false);
    // Timeout de sécurité
    const timeout = setTimeout(() => {
      setTimeoutReached(true);
      setLoading(false);
    }, 5000);
    try {
      const data = await cyclesService.getPredictions(utilisatriceId);
      // Vérifier si l'utilisatrice a au moins un cycle
      const cycles = await cyclesService.getCycles(utilisatriceId);
      console.log('DASHBOARD utilisatriceId:', utilisatriceId, 'cycles.length:', cycles.length, cycles);
      setDebugCycles(cycles);
      setHasCycles(cycles.length > 0);
      setPredictions(data);
      if (cycles.length === 0) {
        console.warn('Aucun cycle trouvé pour utilisatriceId:', utilisatriceId);
      } else {
        console.log('Cycles trouvés:', cycles.map(c => c.debut));
      }
    } catch (error: any) {
      setPredictionError('Erreur lors du chargement des prédictions : ' + (error?.message || error));
      console.error('Erreur lors du chargement des prédictions:', error);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const getDaysUntil = (date: string) => {
    if (!date) return null;
    const targetDate = new Date(date);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 18) return 'Bonjour';
    return 'Bonsoir';
  };

  // Prénom de l'utilisatrice
  const getFirstName = () => {
    if (user?.name && typeof user.name === 'string' && user.name.trim().length > 0) {
      return user.name.split(' ')[0];
    }
    if (user?.email && typeof user.email === 'string') {
      return user.email.split('@')[0];
    }
    return 'Utilisateur';
  };

  // Conseils bien-être/féminin (même liste que dans CyclePrediction)
  const conseils = [
    "🌸 Prends un moment pour toi aujourd'hui.",
    "💧 Bois un grand verre d'eau et respire profondément.",
    "🧘‍♀️ Quelques étirements doux peuvent soulager les tensions.",
    "🍫 Autorise-toi une petite douceur, tu le mérites !",
    "🌿 Marche quelques minutes à l'extérieur pour t'aérer.",
    "📖 Lis ou écoute quelque chose qui t'inspire.",
    "💤 Un peu de repos, c'est aussi prendre soin de soi.",
    "🤗 Parle à une amie, partage tes ressentis.",
    "🎶 Mets ta musique préférée et danse !",
    "📝 Note trois choses positives de ta journée."
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? palettes.dark.background : '#fff' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 48 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
          <View>
            <Text style={{ fontSize: 26, fontWeight: 'bold', color: theme === 'dark' ? palettes.dark.text : '#1f2937', marginBottom: 2 }}>
              {getGreeting()}, {getFirstName()} <Text style={{ fontSize: 22 }}>👋</Text>
            </Text>
            <Text style={{ fontSize: 14, color: theme === 'dark' ? palettes.dark.textSecondary : '#6b7280' }}>
              Suivez votre cycle en toute sérénité
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{ padding: 8, borderRadius: 10, backgroundColor: theme === 'dark' ? palettes.dark.surface : '#e5e7eb' }}
          >
            <Feather name={theme === 'dark' ? 'moon' : 'sun'} size={20} color={theme === 'dark' ? palettes.dark.primary : '#e11d48'} />
          </TouchableOpacity>
        </View>

        {/* Statistiques rapides */}
        <Animated.View style={{
          marginHorizontal: 8,
          marginTop: 8,
          marginBottom: 16,
          opacity: predictionAnim,
          transform: [{ scale: predictionAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
        }}>
          {loading ? (
            <View style={{ backgroundColor: theme === 'dark' ? palettes.dark.surface : '#fff4f7', borderRadius: 18, padding: 18, alignItems: 'center' }}>
              <Text style={{ color: theme === 'dark' ? palettes.dark.text : '#1f2937', fontSize: 16 }}>Chargement des prédictions...</Text>
            </View>
          ) : (!hasCycles || timeoutReached) ? (
            <View style={{ backgroundColor: theme === 'dark' ? palettes.dark.surface : '#fff4f7', borderRadius: 18, padding: 18, alignItems: 'center' }}>
              <Text style={{ color: theme === 'dark' ? palettes.dark.text : '#1f2937', fontSize: 15, marginBottom: 8, textAlign: 'center' }}>
                Aucun cycle trouvé. Pour activer les prédictions, ajoutez un cycle dans le journal ou les paramètres.
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Symptoms' as never)} style={{ backgroundColor: theme === 'dark' ? palettes.dark.primary : '#e11d48', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, marginTop: 4 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ajouter un cycle</Text>
              </TouchableOpacity>
            </View>
          ) : predictionError ? (
            <View style={{ backgroundColor: theme === 'dark' ? palettes.dark.surface : '#fff4f7', borderRadius: 18, padding: 18, alignItems: 'center' }}>
              <Text style={{ color: '#e11d48', fontSize: 15 }}>{predictionError}</Text>
            </View>
          ) : predictions ? (
            <CyclePrediction
              cycleLength={predictions.averageCycleLength}
              currentDay={predictions.currentDay}
              nextPeriod={getDaysUntil(predictions.nextPeriod) ?? 0}
              nextOvulation={getDaysUntil(predictions.nextOvulation) ?? 0}
              fertilityLevel={predictions.fertilityLevel}
              progression={predictions.currentDay / predictions.averageCycleLength}
            />
          ) : null}
        </Animated.View>

        {/* Prédictions */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: theme === 'dark' ? palettes.dark.text : '#1f2937' }}>Prédictions</Text>
          
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Text style={{ fontSize: 16, color: theme === 'dark' ? palettes.dark.textSecondary : '#6b7280' }}>Chargement...</Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {/* Prochaines règles */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderRadius: 12, backgroundColor: theme === 'dark' ? palettes.dark.elevated : '#f9fafb' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme === 'dark' ? palettes.dark.accentRules : '#fee2e2', justifyContent: 'center', alignItems: 'center' }}>
                    <Feather name="droplet" size={20} color={theme === 'dark' ? palettes.dark.background : '#b91c1c'} />
                  </View>
                  <View>
                    <Text style={{ fontWeight: 'semibold', color: theme === 'dark' ? palettes.dark.text : '#1f2937' }}>Prochaines règles</Text>
                    <Text style={{ fontSize: 14, color: theme === 'dark' ? palettes.dark.textSecondary : '#6b7280' }}>
                      {predictions?.nextPeriod ? new Date(predictions.nextPeriod).toLocaleDateString('fr-FR') : 'Non calculé'}
                    </Text>
                  </View>
                </View>
                {predictions?.nextPeriod && (
                  <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: theme === 'dark' ? palettes.dark.accentRules : '#fee2e2' }}>
                    <Text style={{ fontSize: 14, fontWeight: 'semibold', color: theme === 'dark' ? palettes.dark.background : '#b91c1c' }}>
                      Dans {getDaysUntil(predictions.nextPeriod)} jours
                    </Text>
                  </View>
                )}
              </View>

              {/* Ovulation */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderRadius: 12, backgroundColor: theme === 'dark' ? palettes.dark.elevated : '#f9fafb' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme === 'dark' ? palettes.dark.accentFertility : '#d1fae5', justifyContent: 'center', alignItems: 'center' }}>
                    <Feather name="heart" size={20} color={theme === 'dark' ? palettes.dark.background : '#065f46'} />
                  </View>
                  <View>
                    <Text style={{ fontWeight: 'semibold', color: theme === 'dark' ? palettes.dark.text : '#1f2937' }}>Ovulation</Text>
                    <Text style={{ fontSize: 14, color: theme === 'dark' ? palettes.dark.textSecondary : '#6b7280' }}>
                      {predictions?.nextOvulation ? new Date(predictions.nextOvulation).toLocaleDateString('fr-FR') : 'Non calculé'}
                    </Text>
                  </View>
                </View>
                {predictions?.nextOvulation && (
                  <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: theme === 'dark' ? palettes.dark.accentFertility : '#d1fae5' }}>
                    <Text style={{ fontSize: 14, fontWeight: 'semibold', color: theme === 'dark' ? palettes.dark.background : '#065f46' }}>
                      Dans {getDaysUntil(predictions.nextOvulation)} jours
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Actions rapides */}
        <View style={{ marginHorizontal: 8, marginTop: 18, marginBottom: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme === 'dark' ? palettes.dark.text : '#1f2937', marginBottom: 8 }}>Actions rapides</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
            <TouchableOpacity
              accessibilityLabel="Aller au journal des symptômes"
              accessible={true}
              onPress={() => navigation.navigate('Symptoms' as never)}
              style={[
                { flexBasis: '48%', marginBottom: 0, marginHorizontal: 0, backgroundColor: theme === 'dark' ? '#231f24' : '#fff4f7', borderRadius: 16, padding: 18, alignItems: 'center', flexDirection: 'row', gap: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' },
              ]}
              activeOpacity={0.7}
            >
              <Feather name="plus" size={22} color={theme === 'dark' ? palettes.dark.primary : '#e11d48'} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 15, color: theme === 'dark' ? palettes.dark.text : '#1f2937', fontWeight: '500' }}>Ajouter des symptômes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                { flexBasis: '48%', marginBottom: 0, marginHorizontal: 0, backgroundColor: theme === 'dark' ? '#231f24' : '#fff4f7', borderRadius: 16, padding: 18, alignItems: 'center', flexDirection: 'row', gap: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' },
              ]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Symptoms' as never)}
            >
              <Feather name="heart" size={22} color={theme === 'dark' ? palettes.dark.primary : '#e11d48'} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 15, color: theme === 'dark' ? palettes.dark.text : '#1f2937', fontWeight: '500' }}>Humeur du jour</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                { flexBasis: '48%', marginBottom: 0, marginHorizontal: 0, backgroundColor: theme === 'dark' ? '#231f24' : '#fff4f7', borderRadius: 16, padding: 18, alignItems: 'center', flexDirection: 'row', gap: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' },
              ]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Insights' as never)}
            >
              <Feather name="trending-up" size={22} color={theme === 'dark' ? palettes.dark.primary : '#e11d48'} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 15, color: theme === 'dark' ? palettes.dark.text : '#1f2937', fontWeight: '500' }}>Voir les tendances</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                { flexBasis: '48%', marginBottom: 0, marginHorizontal: 0, backgroundColor: theme === 'dark' ? '#231f24' : '#fff4f7', borderRadius: 16, padding: 18, alignItems: 'center', flexDirection: 'row', gap: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' },
              ]}
              activeOpacity={0.7}
              onPress={() => alert('Assistant IA à venir !')}
            >
              <MaterialCommunityIcons name="robot-outline" size={22} color={theme === 'dark' ? palettes.dark.accentFertility : '#059669'} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 15, color: theme === 'dark' ? palettes.dark.text : '#1f2937', fontWeight: '500' }}>Assistant IA</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Conseil du jour dynamique */}
        <View style={{ borderRadius: 18, padding: 18, marginBottom: 24, backgroundColor: theme === 'dark' ? palettes.dark.surface : '#fff1f2' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: theme === 'dark' ? palettes.dark.primary : '#e11d48' }}>Conseil du jour</Text>
          <Text style={{ fontSize: 15, color: theme === 'dark' ? palettes.dark.text : '#e11d48', textAlign: 'center' }}>
            {(() => {
              // On prend le jour du cycle courant si possible, sinon le jour du mois
              let day = 1;
              if (predictions && typeof predictions.currentDay === 'number') {
                day = predictions.currentDay;
              } else {
                day = new Date().getDate();
              }
              return conseils[day % conseils.length];
            })()}
          </Text>
        </View>
      </ScrollView>

      {/* Barre de navigation fixe */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: 32,
        backgroundColor: theme === 'dark' ? palettes.dark.surface : '#fff',
        borderTopWidth: 1,
        borderTopColor: theme === 'dark' ? palettes.dark.border : '#e5e7eb',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 12,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Dashboard' as never)}>
            <Feather name="home" size={24} color={theme === 'dark' ? palettes.dark.primary : '#E11D48'} />
            <Text style={{ fontSize: 12, marginTop: 4, color: theme === 'dark' ? palettes.dark.primary : '#E11D48' }}>Accueil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Calendar' as never)}>
            <Feather name="calendar" size={24} color={theme === 'dark' ? palettes.dark.textSecondary : '#6b7280'} />
            <Text style={{ fontSize: 12, marginTop: 4, color: theme === 'dark' ? palettes.dark.textSecondary : '#6b7280' }}>Calendrier</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Symptoms' as never)}>
            <Feather name="book-open" size={24} color={theme === 'dark' ? palettes.dark.textSecondary : '#6b7280'} />
            <Text style={{ fontSize: 12, marginTop: 4, color: theme === 'dark' ? palettes.dark.textSecondary : '#6b7280' }}>Journal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Insights' as never)}>
            <Feather name="bar-chart" size={24} color={theme === 'dark' ? palettes.dark.textSecondary : '#6b7280'} />
            <Text style={{ fontSize: 12, marginTop: 4, color: theme === 'dark' ? palettes.dark.textSecondary : '#6b7280' }}>Analyses</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Settings' as never)}>
            <Feather name="settings" size={24} color={theme === 'dark' ? palettes.dark.textSecondary : '#6b7280'} />
            <Text style={{ fontSize: 12, marginTop: 4, color: theme === 'dark' ? palettes.dark.textSecondary : '#6b7280' }}>Réglages</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}