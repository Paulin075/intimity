import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useColorScheme, Modal, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { useAuth } from '../hooks/use-auth';
import { cyclesService, type Cycle, type CycleInput } from '../services/cycles';
import { useTheme } from '../hooks/use-theme';

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

export default function CalendarScreen() {
  // const systemScheme = useColorScheme();
  // const [theme, setTheme] = useState<'light' | 'dark'>(systemScheme === 'dark' ? 'dark' : 'light');
  const { theme, setTheme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCycle, setNewCycle] = useState<CycleInput>({
    debut: '',
    fin: '',
    duree: undefined,
    date_ovulation: '',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      loadCycles();
    }
  }, [user]);

  const loadCycles = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await cyclesService.getCycles(user.id);
      setCycles(data);
    } catch (error) {
      console.error('Erreur lors du chargement des cycles:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCycle = async () => {
    if (!user || !newCycle.debut) {
      Alert.alert('Erreur', 'Veuillez remplir au moins la date de début');
      return;
    }

    try {
      const cycle = await cyclesService.addCycle(user.id, newCycle);
      if (cycle) {
        setCycles([cycle, ...cycles]);
        setNewCycle({
          debut: '',
          fin: '',
          duree: undefined,
          date_ovulation: '',
          notes: '',
        });
        setShowAddModal(false);
        Alert.alert('Succès', 'Cycle ajouté avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du cycle:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le cycle');
    }
  };

  const deleteCycle = async (cycleId: string) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûre de vouloir supprimer ce cycle ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await cyclesService.deleteCycle(cycleId);
              if (success) {
                setCycles(cycles.filter(c => c.id !== cycleId));
                Alert.alert('Succès', 'Cycle supprimé avec succès');
              }
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le cycle');
            }
          },
        },
      ]
    );
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getCycleForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return cycles.find(cycle => {
      const start = new Date(cycle.debut);
      const end = cycle.fin ? new Date(cycle.fin) : new Date(cycle.debut);
      end.setDate(end.getDate() + (cycle.duree || 5) - 1);
      const checkDate = new Date(dateStr);
      return checkDate >= start && checkDate <= end;
    });
  };

  const getDayStyle = (date: Date | null): any => {
    if (!date) return { aspectRatio: 1 };
    const isToday = date.toDateString() === new Date().toDateString();
    // Exemples de logique (à adapter selon tes données réelles)
    // Règles : 14-16 du mois
    const isRegles = date.getDate() >= 14 && date.getDate() <= 16;
    // Fertile : 16-18 du mois
    const isFertile = date.getDate() >= 16 && date.getDate() <= 18;
    // Ovulation : 15 du mois
    const isOvulation = date.getDate() === 15;
    let style: any = {
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 16,
      marginVertical: 2,
      marginHorizontal: 0,
      minWidth: 36,
      minHeight: 36,
      backgroundColor: undefined as any,
      borderWidth: 0,
      color: undefined as any,
      borderColor: undefined as any,
      shadowColor: undefined as any,
      shadowOffset: undefined as any,
      shadowOpacity: undefined as any,
      shadowRadius: undefined as any,
      elevation: undefined as any,
    };
    if (isRegles) {
      style.backgroundColor = isOvulation ? '#fbcfe8' : '#fee2e2'; // Rose clair pour règles, rose pour ovulation
      style.color = isOvulation ? '#be185d' : '#e11d48';
      style.borderWidth = isOvulation ? 2 : 0;
      style.borderColor = isOvulation ? '#f472b6' : undefined;
    }
    if (isFertile) {
      style.backgroundColor = '#d1fae5'; // Vert pastel
      style.color = '#10b981';
    }
    if (isToday) {
      style.backgroundColor = '#e11d48'; // Rose foncé
      style.color = '#fff';
      style.shadowColor = '#e11d48';
      style.shadowOffset = { width: 0, height: 2 };
      style.shadowOpacity = 0.18;
      style.shadowRadius = 8;
      style.elevation = 6;
    }
    // Priorité : aujourd'hui > ovulation > règles > fertile
    if (isToday) return style;
    if (isOvulation) return { ...style, backgroundColor: '#fbcfe8', color: '#be185d', borderWidth: 2, borderColor: '#f472b6' };
    if (isRegles) return style;
    if (isFertile) return style;
    return { ...style, backgroundColor: 'transparent' };
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? darkColors.background : '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme === 'dark' ? darkColors.text : '#1f2937' }}>
              Calendrier
            </Text>
            <Text style={{ fontSize: 14, color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>
              Suivez vos cycles menstruels
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={{ padding: 8, borderRadius: 20, backgroundColor: theme === 'dark' ? darkColors.primary : '#fce7f3' }}
          >
            <Feather name="plus" size={20} color={theme === 'dark' ? darkColors.background : '#E11D48'} />
          </TouchableOpacity>
        </View>

        {/* Navigation du mois */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            style={{ padding: 8, borderRadius: 10, backgroundColor: theme === 'dark' ? darkColors.surface : '#f3f4f6' }}
          >
            <Feather name="chevron-left" size={20} color={theme === 'dark' ? darkColors.text : '#374151'} />
          </TouchableOpacity>
          
          <Text style={{ fontSize: 18, fontWeight: 'semibold', color: theme === 'dark' ? darkColors.text : '#1f2937' }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          
          <TouchableOpacity
            onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            style={{ padding: 8, borderRadius: 10, backgroundColor: theme === 'dark' ? darkColors.surface : '#f3f4f6' }}
          >
            <Feather name="chevron-right" size={20} color={theme === 'dark' ? darkColors.text : '#374151'} />
          </TouchableOpacity>
        </View>

        {/* Calendrier */}
        <View style={{
          paddingHorizontal: 16,
          marginBottom: 24,
          backgroundColor: theme === 'dark' ? darkColors.surface : '#fff4f7',
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 4,
          paddingTop: 16,
          paddingBottom: 16,
        }}>
          {/* Jours de la semaine */}
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            {weekDays.map((day, index) => (
              <View key={index} style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: 'medium', color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Grille du calendrier */}
          <View style={{ gap: 4 }}>
            {Array.from({ length: Math.ceil(getMonthDays(currentDate).length / 7) }, (_, weekIndex) => (
              <View key={weekIndex} style={{ flexDirection: 'row', gap: 4 }}>
                {getMonthDays(currentDate).slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => (
                  <View key={dayIndex} style={{ flex: 1, alignItems: 'center' }}>
                    {date ? (
                      <View style={getDayStyle(date)}>
                        <Text style={{ fontSize: 14, fontWeight: 'medium', color: getDayStyle(date).color || (theme === 'dark' ? darkColors.text : '#1f2937') }}>
                          {date.getDate()}
                        </Text>
                      </View>
                    ) : (
                      <View style={{ aspectRatio: 1 }} />
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Légende */}
        <View style={{
          marginHorizontal: 16,
          marginBottom: 24,
          padding: 16,
          borderRadius: 20,
          backgroundColor: theme === 'dark' ? darkColors.surface : '#fff4f7',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 4,
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: theme === 'dark' ? darkColors.text : '#1f2937' }}>
            Légende des couleurs
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '48%' }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, marginRight: 8, backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5' }} />
              <Text style={{ fontSize: 15, color: '#e11d48' }}>Règles</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '48%' }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, marginRight: 8, backgroundColor: '#fbcfe8', borderWidth: 1, borderColor: '#f472b6' }} />
              <Text style={{ fontSize: 15, color: '#ec4899' }}>Ovulation</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '48%' }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, marginRight: 8, backgroundColor: '#d1fae5', borderWidth: 1, borderColor: '#34d399' }} />
              <Text style={{ fontSize: 15, color: '#10b981' }}>Période fertile</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '48%' }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, marginRight: 8, backgroundColor: '#e11d48', borderWidth: 1, borderColor: '#be185d' }} />
              <Text style={{ fontSize: 15, color: '#be185d' }}>Aujourd'hui</Text>
            </View>
          </View>
        </View>

        {/* Cycles récents */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: theme === 'dark' ? darkColors.text : '#1f2937' }}>
            Cycles récents
          </Text>
          
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={{ fontSize: 18, color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>Chargement...</Text>
            </View>
          ) : cycles.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Feather name="calendar" size={48} color={theme === 'dark' ? darkColors.textSecondary : '#d1d5db'} />
              <Text style={{ fontSize: 20, marginTop: 8, color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>
                Aucun cycle enregistré
              </Text>
              <Text style={{ fontSize: 14, textAlign: 'center', marginTop: 4, color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>
                Ajoutez votre premier cycle pour commencer le suivi
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {cycles.slice(0, 5).map((cycle) => (
                <View key={cycle.id} style={{ padding: 16, borderRadius: 12, backgroundColor: theme === 'dark' ? darkColors.elevated : '#f9fafb' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'semibold', color: theme === 'dark' ? darkColors.text : '#1f2937' }}>
                        {new Date(cycle.debut).toLocaleDateString('fr-FR')} - {cycle.fin ? new Date(cycle.fin).toLocaleDateString('fr-FR') : 'En cours'}
                      </Text>
                      {cycle.duree && (
                        <Text style={{ fontSize: 14, marginTop: 4, color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>
                          Durée: {cycle.duree} jours
                        </Text>
                      )}
                      {cycle.notes && (
                        <Text style={{ fontSize: 14, marginTop: 4, color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>
                          {cycle.notes}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => deleteCycle(cycle.id)}
                      style={{ padding: 8 }}
                    >
                      <Feather name="trash-2" size={16} color={theme === 'dark' ? darkColors.accentRules : '#ef4444'} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal d'ajout de cycle */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: darkColors.overlay }}>
          <View style={{ width: '90%', padding: 24, borderRadius: 32, backgroundColor: theme === 'dark' ? darkColors.surface : '#fff' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: theme === 'dark' ? darkColors.text : '#1f2937' }}>
              Ajouter un cycle
            </Text>
            
            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ fontSize: 14, fontWeight: 'medium', marginBottom: 4, color: theme === 'dark' ? darkColors.text : '#1f2937' }}>
                  Date de début *
                </Text>
                <TextInput
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    borderColor: theme === 'dark' ? darkColors.border : '#d1d5db',
                    borderWidth: 1,
                    backgroundColor: theme === 'dark' ? darkColors.elevated : '#f9fafb',
                    color: theme === 'dark' ? darkColors.text : '#1f2937'
                  }}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme === 'dark' ? darkColors.textSecondary : '#9ca3af'}
                  value={newCycle.debut || ''}
                  onChangeText={(text) => setNewCycle({ ...newCycle, debut: text })}
                />
              </View>
              
              <View>
                <Text style={{ fontSize: 14, fontWeight: 'medium', marginBottom: 4, color: theme === 'dark' ? darkColors.text : '#1f2937' }}>
                  Date de fin (optionnel)
                </Text>
                <TextInput
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    borderColor: theme === 'dark' ? darkColors.border : '#d1d5db',
                    borderWidth: 1,
                    backgroundColor: theme === 'dark' ? darkColors.elevated : '#f9fafb',
                    color: theme === 'dark' ? darkColors.text : '#1f2937'
                  }}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme === 'dark' ? darkColors.textSecondary : '#9ca3af'}
                  value={newCycle.fin || ''}
                  onChangeText={(text) => setNewCycle({ ...newCycle, fin: text })}
                />
              </View>
              
              <View>
                <Text style={{ fontSize: 14, fontWeight: 'medium', marginBottom: 4, color: theme === 'dark' ? darkColors.text : '#1f2937' }}>
                  Durée (jours)
                </Text>
                <TextInput
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    borderColor: theme === 'dark' ? darkColors.border : '#d1d5db',
                    borderWidth: 1,
                    backgroundColor: theme === 'dark' ? darkColors.elevated : '#f9fafb',
                    color: theme === 'dark' ? darkColors.text : '#1f2937'
                  }}
                  placeholder="5"
                  placeholderTextColor={theme === 'dark' ? darkColors.textSecondary : '#9ca3af'}
                  value={newCycle.duree !== undefined ? newCycle.duree.toString() : ''}
                  onChangeText={(text) => setNewCycle({ ...newCycle, duree: text ? parseInt(text) : undefined })}
                  keyboardType="numeric"
                />
              </View>
              
              <View>
                <Text style={{ fontSize: 14, fontWeight: 'medium', marginBottom: 4, color: theme === 'dark' ? darkColors.text : '#1f2937' }}>
                  Notes (optionnel)
                </Text>
                <TextInput
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    borderColor: theme === 'dark' ? darkColors.border : '#d1d5db',
                    borderWidth: 1,
                    backgroundColor: theme === 'dark' ? darkColors.elevated : '#f9fafb',
                    color: theme === 'dark' ? darkColors.text : '#1f2937'
                  }}
                  placeholder="Notes sur ce cycle..."
                  placeholderTextColor={theme === 'dark' ? darkColors.textSecondary : '#9ca3af'}
                  value={newCycle.notes || ''}
                  onChangeText={(text) => setNewCycle({ ...newCycle, notes: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: theme === 'dark' ? darkColors.elevated : '#f3f4f6' }}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={{ textAlign: 'center', fontWeight: 'medium', color: theme === 'dark' ? darkColors.text : '#374151' }}>
                  Annuler
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: theme === 'dark' ? darkColors.primary : '#E11D48' }}
                onPress={addCycle}
              >
                <Text style={{ textAlign: 'center', fontWeight: 'medium', color: '#fff' }}>
                  Ajouter
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Barre de navigation fixe */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: 32,
        backgroundColor: theme === 'dark' ? darkColors.surface : '#fff',
        borderTopWidth: 1,
        borderTopColor: theme === 'dark' ? darkColors.border : '#e5e7eb',
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
            <Feather name="home" size={24} color={theme === 'dark' ? darkColors.textSecondary : '#6b7280'} />
            <Text style={{ fontSize: 12, marginTop: 4, color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>Accueil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Calendar' as never)}>
            <Feather name="calendar" size={24} color={theme === 'dark' ? darkColors.primary : '#E11D48'} />
            <Text style={{ fontSize: 12, marginTop: 4, color: theme === 'dark' ? darkColors.primary : '#E11D48' }}>Calendrier</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Symptoms' as never)}>
            <Feather name="book-open" size={24} color={theme === 'dark' ? darkColors.textSecondary : '#6b7280'} />
            <Text style={{ fontSize: 12, marginTop: 4, color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>Journal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Insights' as never)}>
            <Feather name="bar-chart" size={24} color={theme === 'dark' ? darkColors.textSecondary : '#6b7280'} />
            <Text style={{ fontSize: 12, marginTop: 4, color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>Analyses</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Settings' as never)}>
            <Feather name="settings" size={24} color={theme === 'dark' ? darkColors.textSecondary : '#6b7280'} />
            <Text style={{ fontSize: 12, marginTop: 4, color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>Réglages</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}