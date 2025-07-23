import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { useAuth } from '../hooks/use-auth';
import { cyclesService } from '../services/cycles';
import { symptomsService } from '../services/symptoms';
import { useTheme } from '../hooks/use-theme';
import type { Cycle, Symptom, UserPreferences, AuthUser } from '../types';
import { palettes } from '../theme/palette';
import { commonStyles } from '../styles/common';

export default function InsightsScreen() {
  const { theme, setTheme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '1y'>('3m');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedPeriod]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [cyclesData, symptomsData] = await Promise.all([
        cyclesService.getCycles(user.id),
        symptomsService.getSymptoms(user.id)
      ]);
      
      setCycles(cyclesData);
      setSymptoms(symptomsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Correction des erreurs de typage dans les reduce/map
  const getAverageCycleLength = () => {
    if (!cycles || cycles.length === 0) return 28;
    const completedCycles = cycles.filter(c => c && c.duree != null);
    if (completedCycles.length === 0) return 28;
    const total = completedCycles.reduce((sum: number, cycle) => sum + (cycle.duree ?? 0), 0);
    return Math.round(total / completedCycles.length);
  };

  const getAveragePeriodLength = () => {
    if (!cycles || cycles.length === 0) return 5;
    const completedCycles = cycles.filter(c => c && c.fin != null && c.debut != null);
    if (completedCycles.length === 0) return 5;
    // Calculer la durée moyenne des règles
    const total = completedCycles.reduce((sum: number, cycle) => {
      if (cycle.debut && cycle.fin) {
        const start = new Date(cycle.debut);
        const end = new Date(cycle.fin);
        return sum + Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      }
      return sum;
    }, 0);
    return Math.round(total / completedCycles.length);
  };

  const getMostCommonSymptoms = () => {
    if (symptoms.length === 0) return [];
    
    const symptomCounts: { [key: string]: number } = {};
    symptoms.forEach(symptom => {
      symptomCounts[symptom.type] = (symptomCounts[symptom.type] || 0) + 1;
    });
    
    return Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  };

  const getSymptomIntensity = () => {
    if (symptoms.length === 0) return 0;
    
    const totalIntensity = symptoms.reduce((sum, symptom) => sum + (symptom.intensite || 0), 0);
    return Math.round(totalIntensity / symptoms.length);
  };

  const getCycleRegularity = () => {
    if (cycles.length < 2) return 'Insufficient data';
    
    const cycleLengths = cycles
      .filter(c => c.duree)
      .map(c => c.duree)
      .sort((a, b) => a - b);
    
    if (cycleLengths.length < 2) return 'Insufficient data';
    
    const average = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
    const variance = cycleLengths.reduce((sum, length) => sum + Math.pow(length - average, 2), 0) / cycleLengths.length;
    const standardDeviation = Math.sqrt(variance);
    
    const coefficient = (standardDeviation / average) * 100;
    
    if (coefficient < 10) return 'Très régulier';
    if (coefficient < 20) return 'Régulier';
    if (coefficient < 30) return 'Irregular';
    return 'Très irrégulier';
  };

  const getFilteredData = () => {
    const months = selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : 12;
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    return {
      cycles: cycles.filter(cycle => new Date(cycle.debut) >= cutoffDate),
      symptoms: symptoms.filter(symptom => new Date(symptom.date) >= cutoffDate)
    };
  };

  const renderStatCard = (title: string, value: string | number, subtitle: string, icon: string, color: string) => (
    <View style={{
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      backgroundColor: theme === 'dark' ? palettes.dark.elevated : palettes.light.surface,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary, fontSize: 13, fontWeight: '500' }}>
            {title}
          </Text>
          <Text style={{ color: theme === 'dark' ? palettes.dark.text : palettes.light.text, fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>
            {value}
          </Text>
          <Text style={{ color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary, fontSize: 12, marginTop: 4 }}>
            {subtitle}
          </Text>
        </View>
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: theme === 'dark' ? palettes.dark.primary : palettes.light.primary,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Feather name={icon as any} size={20} color="#fff" />
        </View>
      </View>
    </View>
  );

  const renderSymptomCard = (symptom: { type: string; count: number }, index: number) => (
    <View key={symptom.type} style={{
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: theme === 'dark' ? palettes.dark.elevated : palettes.light.surface,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme === 'dark' ? palettes.dark.primary : palettes.light.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 8,
          }}>
            <Text style={{ color: theme === 'dark' ? palettes.dark.background : palettes.light.primary, fontSize: 13, fontWeight: 'bold' }}>
              {index + 1}
            </Text>
          </View>
          <Text style={{ color: theme === 'dark' ? palettes.dark.text : palettes.light.text, fontSize: 14, fontWeight: '500' }}>
            {symptom.type}
          </Text>
        </View>
        <Text style={{ color: theme === 'dark' ? palettes.dark.primary : palettes.light.primary, fontSize: 14, fontWeight: 'bold' }}>
          {symptom.count}x
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? palettes.dark.background : palettes.light.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
          <View>
            <Text style={{ color: theme === 'dark' ? palettes.dark.text : palettes.light.text, fontSize: 24, fontWeight: 'bold' }}>
              Analyses
            </Text>
            <Text style={{ color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary, fontSize: 13 }}>
              Découvrez vos tendances
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{
              padding: 8,
              borderRadius: 12,
              backgroundColor: theme === 'dark' ? palettes.dark.surface : palettes.light.surface,
            }}
          >
            <Feather name={theme === 'dark' ? 'moon' : 'sun'} size={20} color={theme === 'dark' ? palettes.dark.primary : palettes.light.primary} />
          </TouchableOpacity>
        </View>

        {/* Période de filtrage */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ color: theme === 'dark' ? palettes.dark.text : palettes.light.text, fontSize: 13, fontWeight: '500', marginBottom: 8 }}>
            Période d'analyse
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { key: '3m', label: '3 mois' },
              { key: '6m', label: '6 mois' },
              { key: '1y', label: '1 an' }
            ].map((period) => (
              <TouchableOpacity
                accessibilityLabel={`Filtrer les analyses sur ${period.label}`}
                accessible={true}
                key={period.key}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 12,
                  backgroundColor: selectedPeriod === period.key
                    ? theme === 'dark' ? palettes.dark.primary : palettes.light.primary
                    : theme === 'dark' ? palettes.dark.elevated : palettes.light.surface,
                }}
                onPress={() => setSelectedPeriod(period.key as '3m' | '6m' | '1y')}
              >
                <Text style={{ color: selectedPeriod === period.key ? '#fff' : theme === 'dark' ? palettes.dark.text : palettes.light.text, fontSize: 13, fontWeight: '500' }}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Text style={{ color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary, fontSize: 18 }}>Chargement...</Text>
          </View>
        ) : (
          <>
            {/* Statistiques principales */}
            <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
              <Text style={commonStyles.label}>Statistiques principales</Text>
              
              <View style={{ gap: 12 }}>
                {renderStatCard(
                  'Durée moyenne du cycle',
                  `${getAverageCycleLength()} jours`,
                  'Basé sur vos cycles récents',
                  'calendar',
                  theme === 'dark' ? palettes.dark.primary : palettes.light.primary
                )}
                
                {renderStatCard(
                  'Durée moyenne des règles',
                  `${getAveragePeriodLength()} jours`,
                  'Basé sur vos cycles récents',
                  'droplet',
                  theme === 'dark' ? palettes.dark.accentRules : palettes.light.primary
                )}
                
                {renderStatCard(
                  'Régularité',
                  getCycleRegularity(),
                  'Basé sur la variance de vos cycles',
                  'trending-up',
                  theme === 'dark' ? palettes.dark.accentFertility : palettes.light.primary
                )}
                
                {renderStatCard(
                  'Intensité moyenne des symptômes',
                  `${getSymptomIntensity()}/5`,
                  'Basé sur tous vos symptômes',
                  'activity',
                  theme === 'dark' ? palettes.dark.secondary : palettes.light.primary
                )}
              </View>
            </View>

            {/* Symptômes les plus fréquents */}
            <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
              <Text style={commonStyles.label}>Symptômes les plus fréquents</Text>
              
              {getMostCommonSymptoms().length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                  <Feather name="bar-chart" size={48} color={theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary} />
                  <Text style={{ color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary, fontSize: 18, marginTop: 8 }}>
                    Aucun symptôme enregistré
                  </Text>
                  <Text style={{ color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 4 }}>
                    Commencez à enregistrer vos symptômes pour voir les tendances
                  </Text>
                </View>
              ) : (
                <View>
                  {getMostCommonSymptoms().map((symptom, index) => renderSymptomCard(symptom, index))}
                </View>
              )}
            </View>

            {/* Résumé des données */}
            <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
              <Text style={commonStyles.label}>Résumé des données</Text>
              
              <View style={{ gap: 12 }}>
                <View style={{
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: theme === 'dark' ? palettes.dark.elevated : palettes.light.surface,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: theme === 'dark' ? palettes.dark.text : palettes.light.text, fontWeight: 'semibold' }}>
                      Cycles enregistrés
                    </Text>
                    <Text style={{ color: theme === 'dark' ? palettes.dark.primary : palettes.light.primary, fontWeight: 'bold' }}>
                      {getFilteredData().cycles.length}
                    </Text>
                  </View>
                  <Text style={{ color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary, fontSize: 13 }}>
                    Dans les {selectedPeriod === '3m' ? '3 derniers mois' : selectedPeriod === '6m' ? '6 derniers mois' : '12 derniers mois'}
                  </Text>
                </View>
                
                <View style={{
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: theme === 'dark' ? palettes.dark.elevated : palettes.light.surface,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: theme === 'dark' ? palettes.dark.text : palettes.light.text, fontWeight: 'semibold' }}>
                      Symptômes enregistrés
                    </Text>
                    <Text style={{ color: theme === 'dark' ? palettes.dark.primary : palettes.light.primary, fontWeight: 'bold' }}>
                      {getFilteredData().symptoms.length}
                    </Text>
                  </View>
                  <Text style={{ color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary, fontSize: 13 }}>
                    Dans les {selectedPeriod === '3m' ? '3 derniers mois' : selectedPeriod === '6m' ? '6 derniers mois' : '12 derniers mois'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Conseils personnalisés */}
            <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
              <Text style={commonStyles.label}>Conseils personnalisés</Text>
              
              <View style={{
                padding: 16,
                borderRadius: 16,
                backgroundColor: theme === 'dark' ? palettes.dark.surface : palettes.light.primary,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme === 'dark' ? palettes.dark.primary : palettes.light.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}>
                    <Feather name="zap" size={20} color={theme === 'dark' ? palettes.dark.background : palettes.light.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme === 'dark' ? palettes.dark.text : palettes.light.text, fontWeight: 'semibold', marginBottom: 4 }}>
                      Basé sur vos données
                    </Text>
                    <Text style={{ color: theme === 'dark' ? palettes.dark.text : palettes.light.text, fontSize: 13, lineHeight: 18 }}>
                      {getCycleRegularity() === 'Très régulier' || getCycleRegularity() === 'Régulier' 
                        ? 'Excellent ! Votre cycle est régulier. Continuez à suivre vos symptômes pour identifier les patterns.'
                        : 'Votre cycle présente des variations. Considérez consulter un professionnel de santé pour des conseils personnalisés.'
                      }
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Barre de navigation fixe */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: 24,
        backgroundColor: theme === 'dark' ? palettes.dark.surface : palettes.light.background,
        borderTopWidth: 1,
        borderTopColor: theme === 'dark' ? palettes.dark.border : palettes.light.surface,
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
            <Feather name="home" size={24} color={theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary} />
            <Text style={{ color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary, fontSize: 12, marginTop: 4 }}>Accueil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Calendar' as never)}>
            <Feather name="calendar" size={24} color={theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary} />
            <Text style={{ color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary, fontSize: 12, marginTop: 4 }}>Calendrier</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Symptoms' as never)}>
            <Feather name="book-open" size={24} color={theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary} />
            <Text style={{ color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary, fontSize: 12, marginTop: 4 }}>Journal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Insights' as never)}>
            <Feather name="bar-chart" size={24} color={theme === 'dark' ? palettes.dark.primary : palettes.light.primary} />
            <Text style={{ color: theme === 'dark' ? palettes.dark.primary : palettes.light.primary, fontSize: 12, marginTop: 4 }}>Analyses</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Settings' as never)}>
            <Feather name="settings" size={24} color={theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary} />
            <Text style={{ color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary, fontSize: 12, marginTop: 4 }}>Réglages</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}