import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useColorScheme, Alert, TextInput, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { useAuth } from '../hooks/use-auth';
import { symptomsService, SymptomInput } from '../services/symptoms';
import { useTheme } from '../hooks/use-theme';
import type { Symptom, UserPreferences, AuthUser } from '../types';
import { palettes } from '../theme/palette';
import { commonStyles } from '../styles/common';

const symptomTypes = [
  { id: 'cramps', name: 'Crampes', icon: 'activity', color: '#FF6D6D' },
  { id: 'fatigue', name: 'Fatigue', icon: 'zap', color: '#FFB74D' },
  { id: 'mood', name: 'Humeur', icon: 'heart', color: '#FF8FA3' },
  { id: 'flow', name: 'Flux', icon: 'droplet', color: '#E91E63' },
  { id: 'bloating', name: 'Ballonnements', icon: 'circle', color: '#9C27B0' },
  { id: 'headache', name: 'Mal de tête', icon: 'alert-circle', color: '#FF5722' },
];

const moodTypes = [
  { id: 'happy', name: 'Heureuse', emoji: '😊' },
  { id: 'calm', name: 'Calme', emoji: '😌' },
  { id: 'irritable', name: 'Irritable', emoji: '😤' },
  { id: 'sad', name: 'Triste', emoji: '😢' },
  { id: 'anxious', name: 'Anxieuse', emoji: '😰' },
  { id: 'energetic', name: 'Énergique', emoji: '💪' },
];

export default function SymptomsScreen() {
  // const systemScheme = useColorScheme();
  // const [theme, setTheme] = useState<'light' | 'dark'>(systemScheme === 'dark' ? 'dark' : 'light');
  const { theme, setTheme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSymptom, setNewSymptom] = useState<SymptomInput>({
    date: selectedDate,
    type: '',
    intensite: 5,
    notes: '',
  });

  useEffect(() => {
    if (user) {
      loadSymptoms();
    }
  }, [user]);

  const loadSymptoms = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await symptomsService.getSymptoms(user.id);
      setSymptoms(data);
    } catch (error) {
      console.error('Erreur lors du chargement des symptômes:', error);
      Alert.alert('Erreur', 'Impossible de charger les symptômes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSymptom = async () => {
    if (!user || !newSymptom.type) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type de symptôme');
      return;
    }

    try {
      const symptom = await symptomsService.addSymptom(user.id, newSymptom);
      if (symptom) {
        setSymptoms(prev => [symptom, ...prev]);
        setShowAddModal(false);
        setNewSymptom({
          date: selectedDate,
          type: '',
          intensite: 5,
          notes: '',
        });
        Alert.alert('Succès', 'Symptôme ajouté avec succès');
      } else {
        Alert.alert('Erreur', 'Impossible d\'ajouter le symptôme');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du symptôme:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  const handleDeleteSymptom = async (symptomId: string) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer ce symptôme ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await symptomsService.deleteSymptom(symptomId);
              if (success) {
                setSymptoms(prev => prev.filter(s => s.id !== symptomId));
                Alert.alert('Succès', 'Symptôme supprimé');
              } else {
                Alert.alert('Erreur', 'Impossible de supprimer le symptôme');
              }
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Une erreur est survenue');
            }
          },
        },
      ]
    );
  };

  const getSymptomTypeName = (type: string) => {
    const symptomType = symptomTypes.find(t => t.id === type);
    return symptomType ? symptomType.name : type;
  };

  const getMoodEmoji = (type: string) => {
    const moodType = moodTypes.find(m => m.id === type);
    return moodType ? moodType.emoji : '😐';
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 3) return palettes.light.success;
    if (intensity <= 7) return palettes.light.warning;
    return palettes.light.error;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? palettes.dark.background : palettes.light.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme === 'dark' ? palettes.dark.text : palettes.light.text }}>Journal</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              style={{ padding: 8, borderRadius: 8, backgroundColor: theme === 'dark' ? palettes.dark.surface : palettes.light.border }}
            >
              <Feather name={theme === 'dark' ? 'moon' : 'sun'} size={20} color={theme === 'dark' ? palettes.dark.primary : palettes.light.error } />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="Ajouter un symptôme"
              accessible={true}
              onPress={() => setShowAddModal(true)}
              style={{ padding: 8, borderRadius: 8, backgroundColor: theme === 'dark' ? palettes.dark.primary : palettes.light.error }}
            >
              <Feather name="plus" size={20} color={theme === 'dark' ? palettes.dark.background : palettes.light.background } />
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistiques rapides */}
        <View style={{ marginHorizontal: 16, padding: 16, borderRadius: 20, backgroundColor: theme === 'dark' ? palettes.dark.surface : palettes.light.error + '10' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: theme === 'dark' ? palettes.dark.primary : palettes.light.error }}>Aujourd'hui</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme === 'dark' ? palettes.dark.text : palettes.light.text }}>
                {symptoms.filter(s => s.date === selectedDate).length}
              </Text>
              <Text style={{ fontSize: 14, color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary }}>Symptômes</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme === 'dark' ? palettes.dark.text : palettes.light.text }}>
                {symptoms.filter(s => s.date === selectedDate && s.type === 'mood').length}
              </Text>
              <Text style={{ fontSize: 14, color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary }}>Humeurs</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme === 'dark' ? palettes.dark.text : palettes.light.text }}>
                {symptoms.filter(s => s.date === selectedDate && s.type !== 'mood').length}
              </Text>
              <Text style={{ fontSize: 14, color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary }}>Physiques</Text>
            </View>
          </View>
        </View>

        {/* Liste des symptômes */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: theme === 'dark' ? palettes.dark.text : palettes.light.text }}>Symptômes récents</Text>
          
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Text style={{ fontSize: 16, color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary }}>Chargement...</Text>
            </View>
          ) : symptoms.length === 0 ? (
            <View style={{ borderRadius: 20, padding: 24, alignItems: 'center', backgroundColor: theme === 'dark' ? palettes.dark.surface : palettes.light.background }}>
              <Feather name="book-open" size={48} color={theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary } />
              <Text style={{ fontSize: 18, fontWeight: 'semibold', marginTop: 16, marginBottom: 8, color: theme === 'dark' ? palettes.dark.text : palettes.light.text }}>Aucun symptôme</Text>
              <Text style={{ textAlign: 'center', color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary }}>
                Commencez à enregistrer vos symptômes pour mieux comprendre votre cycle
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {symptoms.slice(0, 10).map((symptom) => (
                <View key={symptom.id} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderRadius: 12, backgroundColor: theme === 'dark' ? palettes.dark.elevated : palettes.light.background }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    {symptom.type === 'mood' ? (
                      <Text style={{ fontSize: 24, marginRight: 12 }}>{getMoodEmoji(symptom.type)}</Text>
                    ) : (
                      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme === 'dark' ? palettes.dark.primary : palettes.light.error, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <Feather name="activity" size={20} color={theme === 'dark' ? palettes.dark.background : palettes.light.background } />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'semibold', color: theme === 'dark' ? palettes.dark.text : palettes.light.text }}>
                        {symptom.type === 'mood' ? 'Humeur' : getSymptomTypeName(symptom.type)}
                      </Text>
                      <Text style={{ fontSize: 14, color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary }}>
                        {new Date(symptom.date).toLocaleDateString('fr-FR')}
                      </Text>
                      {symptom.notes && (
                        <Text style={{ fontSize: 14, marginTop: 4, color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary }} numberOfLines={1}>
                          {symptom.notes}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: getIntensityColor(symptom.intensite) + '20' }}>
                      <Text style={{ fontSize: 12, fontWeight: 'semibold', color: getIntensityColor(symptom.intensite) }}>
                        {symptom.intensite}/10
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteSymptom(symptom.id)}
                      style={{ padding: 4 }}
                    >
                      <Feather name="trash-2" size={16} color={theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary } />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal d'ajout de symptôme */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? palettes.dark.surface : palettes.light.error + '40' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: theme === 'dark' ? palettes.dark.border : palettes.light.border }}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={{ fontSize: 16, color: theme === 'dark' ? palettes.dark.primary : palettes.light.error }}>Annuler</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: 'semibold', color: theme === 'dark' ? palettes.dark.text : palettes.light.text }}>Ajouter un symptôme</Text>
            <TouchableOpacity onPress={handleAddSymptom}>
              <Text style={{ fontSize: 16, fontWeight: 'semibold', color: theme === 'dark' ? palettes.dark.primary : palettes.light.error }}>Ajouter</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }}>
            {/* Date */}
            <View style={{ marginBottom: 16 }}>
              <Text style={commonStyles.label}>Date</Text>
              <TextInput
                accessibilityLabel="Saisir la date du symptôme"
                accessible={true}
                style={[commonStyles.input, { borderColor: theme === 'dark' ? palettes.dark.border : palettes.light.border, backgroundColor: theme === 'dark' ? palettes.dark.surface : palettes.light.background, color: theme === 'dark' ? palettes.dark.text : palettes.light.text }]}
                value={newSymptom.date}
                onChangeText={(text) => setNewSymptom({ ...newSymptom, date: text })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary }
              />
            </View>

            {/* Type de symptôme */}
            <View style={{ marginBottom: 16 }}>
              <Text style={commonStyles.label}>Type de symptôme</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {symptomTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      {
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 10,
                        borderWidth: 1,
                      },
                      newSymptom.type === type.id 
                        ? { backgroundColor: type.color, borderColor: type.color }
                        : { borderColor: theme === 'dark' ? palettes.dark.border : palettes.light.border }
                    ]}
                    onPress={() => setNewSymptom({ ...newSymptom, type: type.id })}
                  >
                    <Text style={[
                      { fontSize: 14, fontWeight: 'medium' },
                      newSymptom.type === type.id 
                        ? { color: '#fff' }
                        : { color: theme === 'dark' ? palettes.dark.text : palettes.light.text }
                    ]}>
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Humeurs */}
            <View style={{ marginBottom: 16 }}>
              <Text style={commonStyles.label}>Humeur</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {moodTypes.map((mood) => (
                  <TouchableOpacity
                    key={mood.id}
                    style={[
                      {
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 10,
                        borderWidth: 1,
                      },
                      newSymptom.type === mood.id 
                        ? { backgroundColor: '#FF8FA3', borderColor: '#FF8FA3' }
                        : { borderColor: theme === 'dark' ? palettes.dark.border : palettes.light.border }
                    ]}
                    onPress={() => setNewSymptom({ ...newSymptom, type: mood.id })}
                  >
                    <Text style={[
                      { fontSize: 14, fontWeight: 'medium' },
                      newSymptom.type === mood.id 
                        ? { color: '#fff' }
                        : { color: theme === 'dark' ? palettes.dark.text : palettes.light.text }
                    ]}>
                      {mood.emoji} {mood.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Intensité */}
            <View style={{ marginBottom: 16 }}>
              <Text style={commonStyles.label}>Intensité: {newSymptom.intensite}/10</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 14, color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary }}>1</Text>
                <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: theme === 'dark' ? palettes.dark.border : palettes.light.border }}>
                  <View 
                    style={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: getIntensityColor(newSymptom.intensite),
                      width: `${(newSymptom.intensite / 10) * 100}%`
                    }} 
                  />
                </View>
                <Text style={{ fontSize: 14, color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary }}>10</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setNewSymptom({ ...newSymptom, intensite: value })}
                    style={{ width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={[
                      { fontSize: 12, fontWeight: 'semibold' },
                      newSymptom.intensite === value 
                        ? { color: getIntensityColor(value) }
                        : { color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary }
                    ]}>
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={{ marginBottom: 16 }}>
              <Text style={commonStyles.label}>Notes (optionnel)</Text>
              <TextInput
                accessibilityLabel="Saisir les notes du symptôme"
                accessible={true}
                style={[commonStyles.input, { borderColor: theme === 'dark' ? palettes.dark.border : palettes.light.border, backgroundColor: theme === 'dark' ? palettes.dark.surface : palettes.light.background, color: theme === 'dark' ? palettes.dark.text : palettes.light.text }]}
                value={newSymptom.notes || ''}
                onChangeText={(text) => setNewSymptom({ ...newSymptom, notes: text })}
                placeholder="Ajoutez des notes..."
                placeholderTextColor={theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary }
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Barre de navigation fixe */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: 32,
        backgroundColor: theme === 'dark' ? palettes.dark.surface : palettes.light.background,
        borderTopWidth: 1,
        borderTopColor: theme === 'dark' ? palettes.dark.border : palettes.light.border,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)'
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Dashboard' as never)}>
            <Feather name="home" size={24} color={theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary } />
            <Text style={{ fontSize: 12, marginTop: 4, color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary }}>Accueil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Calendar' as never)}>
            <Feather name="calendar" size={24} color={theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary } />
            <Text style={{ fontSize: 12, marginTop: 4, color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary }}>Calendrier</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Symptoms' as never)}>
            <Feather name="book-open" size={24} color={theme === 'dark' ? palettes.dark.primary : palettes.light.error } />
            <Text style={{ fontSize: 12, marginTop: 4, color: theme === 'dark' ? palettes.dark.primary : palettes.light.error }}>Journal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Insights' as never)}>
            <Feather name="bar-chart" size={24} color={theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary } />
            <Text style={{ fontSize: 12, marginTop: 4, color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary }}>Analyses</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Settings' as never)}>
            <Feather name="settings" size={24} color={theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary } />
            <Text style={{ fontSize: 12, marginTop: 4, color: theme === 'dark' ? palettes.dark.textSecondary : palettes.light.textSecondary }}>Réglages</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}