import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, useColorScheme, Alert, Modal, TextInput, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { useAuth } from '../hooks/use-auth';
import { useTheme } from '../hooks/use-theme';
import { supabase } from '../integrations/supabase/client';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { commonStyles } from '../styles/common';

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

  const settingsGroups = [
    {
      title: "Profil",
    icon: "user",
      items: [
        { label: "Informations personnelles", action: "navigate", badge: null },
        { label: "Paramètres du cycle", action: "navigate", badge: null },
        { label: "Objectifs de santé", action: "navigate", badge: "Nouveau" },
      ]
    },
    {
      title: "Notifications",
    icon: "bell",
      items: [
      { label: "Notifications générales", action: "toggle", badge: null },
        { label: "Rappels de saisie", action: "navigate", badge: null },
        { label: "Alertes de cycle", action: "navigate", badge: null },
      ]
    },
    {
      title: "Confidentialité et sécurité",
    icon: "shield",
      items: [
      { label: "Authentification biométrique", action: "toggle", badge: null },
        { label: "Code PIN", action: "navigate", badge: null },
        { label: "Politique de confidentialité", action: "navigate", badge: null },
        { label: "Gestion des données", action: "navigate", badge: null },
      ]
    },
    {
      title: "Apparence",
    icon: "settings",
      items: [
      { label: "Mode sombre", action: "toggle", badge: null },
        { label: "Taille du texte", action: "navigate", badge: null },
        { label: "Thème de couleur", action: "navigate", badge: null },
      ]
    },
    {
      title: "Application",
    icon: "globe",
      items: [
        { label: "Langue", action: "navigate", badge: "Français" },
        { label: "Unités de mesure", action: "navigate", badge: null },
        { label: "À propos", action: "navigate", badge: "v1.0.0" },
      ]
    }
  ];

const quickActions = [
  { label: "Gérer rappels", icon: "bell" },
  { label: "Sécurité", icon: "shield" },
  { label: "Sauvegarde", icon: "download" },
  { label: "Support", icon: "help-circle" },
];

export default function SettingsScreen() {
  // const systemScheme = useColorScheme();
  // const [theme, setTheme] = useState<'light' | 'dark'>(systemScheme === 'dark' ? 'dark' : 'light');
  const { theme, setTheme, palette } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, signOut, preferences, updatePreferences, reloadUser } = useAuth();
  const [notifications, setNotifications] = useState(preferences?.notifications ?? true);
  const [biometric, setBiometric] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editBirthDate, setEditBirthDate] = useState(user?.birthDate || '');
  const [editTaille, setEditTaille] = useState(user?.taille ? String(user.taille) : '');
  const [editPoids, setEditPoids] = useState(user?.poids ? String(user.poids) : '');
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [editCycleLength, setEditCycleLength] = useState(preferences?.cycleLength?.toString() || '');
  const [editGoal, setEditGoal] = useState(preferences?.goal || '');

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [savingCycle, setSavingCycle] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (preferences) {
      setNotifications(preferences.notifications);
    }
  }, [preferences]);

  const handleToggleNotifications = async (value: boolean) => {
    setNotifications(value);
    const result = await updatePreferences({ notifications: value });
    if (!result.success) {
      Alert.alert('Erreur', "Impossible de mettre à jour les notifications");
      setNotifications(!value); // rollback
    }
  };

  const handleEditPersonalInfo = () => {
    // Toujours réinitialiser les champs avec les valeurs actuelles de l'utilisateur
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditBirthDate(user?.birthDate || '');
    setShowEditModal(true);
  };

  const handleSavePersonalInfo = async () => {
    if (!user) return;
    const updates: any = {
      name: editName,
      email: editEmail,
      birthDate: editBirthDate,
    };
    if (editTaille) updates.taille = parseInt(editTaille, 10);
    if (editPoids) updates.poids = parseFloat(editPoids);
    const { error } = await supabase
      .from('utilisatrices')
      .update(updates)
      .eq('email', user.email);
    if (error) {
      Alert.alert('Erreur', "Impossible de mettre à jour les informations personnelles");
    } else {
      await reloadUser();
      Alert.alert('Succès', 'Informations mises à jour');
      setShowEditModal(false);
    }
  };

  const handleEditCycle = () => {
    setEditCycleLength(preferences?.cycleLength?.toString() || '');
    setShowCycleModal(true);
  };

  const handleSaveCycle = async () => {
    if (!user) return;
    setSavingCycle(true);
    const { error } = await (supabase
      .from('parametres' as any)
      .update({ duree_regles: parseInt(editCycleLength) })
      .eq('utilisatrice_id', user.id));
    setSavingCycle(false);
    if (error) {
      Alert.alert('Erreur', "Impossible de mettre à jour la durée des règles");
    } else {
      Alert.alert('Succès', 'Durée des règles mise à jour');
      setShowCycleModal(false);
    }
  };

  const handleEditGoal = () => {
    setEditGoal(preferences?.goal || '');
    setShowGoalModal(true);
  };
  const handleSaveGoal = async () => {
    if (!user) return;
    setSavingGoal(true);
    const { error } = await (supabase
      .from('parametres' as any)
      .update({ objectif: editGoal })
      .eq('utilisatrice_id', user.id));
    setSavingGoal(false);
    if (error) {
      Alert.alert('Erreur', "Impossible de mettre à jour l'objectif");
    } else {
      Alert.alert('Succès', 'Objectif mis à jour');
      setShowGoalModal(false);
    }
  };

  const getIcon = (iconName: string, size: number = 20) => {
    switch (iconName) {
      case 'user': return <Feather name="user" size={size} />;
      case 'bell': return <Feather name="bell" size={size} />;
      case 'shield': return <Feather name="shield" size={size} />;
      case 'settings': return <Feather name="settings" size={size} />;
      case 'globe': return <Feather name="globe" size={size} />;
      case 'download': return <Feather name="download" size={size} />;
      case 'help-circle': return <Feather name="help-circle" size={size} />;
      default: return <Feather name="circle" size={size} />;
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Tentative de déconnexion...');
              const result = await signOut();
              console.log('Résultat de la déconnexion:', result);
              
              if (result.success) {
                console.log('Déconnexion réussie');
                // La navigation sera gérée automatiquement par AuthStateHandler
                // Mais on peut aussi forcer la navigation vers Auth
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Auth' as never }],
                });
              } else {
                console.error('Erreur lors de la déconnexion:', result.error);
                Alert.alert('Erreur', 'Impossible de se déconnecter. Veuillez réessayer.');
              }
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
              Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion.');
            }
          },
        },
      ]
    );
  };

  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth < 340;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? darkColors.background : '#fff' }}>  


      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 96 }}>  
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>  
          <Text style={{ fontSize: isSmallScreen ? 16 : 20, fontWeight: 'bold', color: theme === 'dark' ? darkColors.text : '#1f2937' }}>Réglages</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              style={[{ padding: 8, borderRadius: 999 }, { backgroundColor: theme === 'dark' ? darkColors.surface : '#e5e7eb' }]}
            >
              <Feather name={theme === 'dark' ? 'moon' : 'sun'} size={20} color={theme === 'dark' ? darkColors.primary : '#e11d48'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Dashboard' as never)}>  
              <Feather name="arrow-left" size={24} color={theme === 'dark' ? darkColors.textSecondary : '#6b7280'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profil utilisateur */}
        <View style={{ borderRadius: 24, padding: 24, marginBottom: 24, backgroundColor: theme === 'dark' ? darkColors.surface : '#fff', borderColor: theme === 'dark' ? darkColors.border : '#e5e7eb', borderWidth: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: theme === 'dark' ? darkColors.primary : '#E11D48' }}>
              <Feather name="user" size={32} color={theme === 'dark' ? darkColors.background : '#fff'} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontSize: isSmallScreen ? 13 : 16, fontWeight: '600', color: theme === 'dark' ? darkColors.text : '#1f2937' }}>{user?.name || 'Utilisateur'}</Text>
              <Text style={{ fontSize: isSmallScreen ? 12 : 14, color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>{user?.email}</Text>
              <Text style={{ fontSize: isSmallScreen ? 10 : 12, marginTop: 4, color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>Membre depuis mars 2024</Text>
            </View>
            <TouchableOpacity style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: theme === 'dark' ? darkColors.primary : '#E11D48' }} onPress={handleEditPersonalInfo}>
              <Text style={{ fontSize: isSmallScreen ? 12 : 14, fontWeight: '500', color: theme === 'dark' ? darkColors.primary : '#E11D48' }}>Modifier</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal d'édition des infos perso */}
        <Modal visible={showEditModal} animationType="slide" transparent>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000070', paddingHorizontal: 0 }}>
            <View style={{ width: '98%', maxWidth: 400, backgroundColor: theme === 'dark' ? darkColors.surface : '#fff', borderRadius: 24, padding: isSmallScreen ? 8 : 16 }}>
              <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
              <Text style={{ fontSize: isSmallScreen ? 16 : 20, fontWeight: 'bold', marginBottom: 16, color: theme === 'dark' ? darkColors.text : '#1f2937' }}>Modifier mes informations</Text>
              <TextInput
                accessibilityLabel="Saisir votre nom"
                accessible={true}
                style={[commonStyles.input, { borderColor: theme === 'dark' ? darkColors.border : '#e5e7eb', backgroundColor: theme === 'dark' ? darkColors.surface : '#fff', color: theme === 'dark' ? darkColors.text : '#1f2937' }]}
                placeholder="Nom complet"
                value={editName}
                onChangeText={setEditName}
              />
              <TextInput
                accessibilityLabel="Saisir votre email"
                accessible={true}
                style={[commonStyles.input, { borderColor: theme === 'dark' ? darkColors.border : '#e5e7eb', backgroundColor: theme === 'dark' ? darkColors.surface : '#fff', color: theme === 'dark' ? darkColors.text : '#1f2937' }]}
                placeholder="Email"
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {/* Champ date de naissance avec DatePicker */}
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={[commonStyles.input, { borderColor: theme === 'dark' ? darkColors.border : '#e5e7eb', backgroundColor: theme === 'dark' ? darkColors.surface : '#fff' }]}
              >
                <Text style={{ color: theme === 'dark' ? darkColors.text : '#1f2937' }}>
                  {editBirthDate ? editBirthDate : 'Date de naissance (YYYY-MM-DD)'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={editBirthDate ? new Date(editBirthDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const iso = selectedDate.toISOString().split('T')[0];
                      setEditBirthDate(iso);
                    }
                  }}
                  maximumDate={new Date()}
                />
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={commonStyles.label}>Taille (cm)</Text>
                  <TextInput
                    accessibilityLabel="Saisir votre taille"
                    accessible={true}
                    style={[commonStyles.input, { borderColor: theme === 'dark' ? darkColors.border : '#e5e7eb', backgroundColor: theme === 'dark' ? darkColors.surface : '#fff', color: theme === 'dark' ? darkColors.text : '#1f2937' }]}
                    value={editTaille}
                    onChangeText={setEditTaille}
                    keyboardType="numeric"
                    placeholder="Taille en cm"
                    placeholderTextColor={theme === 'dark' ? darkColors.textSecondary : '#9ca3af'}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={commonStyles.label}>Poids (kg)</Text>
                  <TextInput
                    accessibilityLabel="Saisir votre poids"
                    accessible={true}
                    style={[commonStyles.input, { borderColor: theme === 'dark' ? darkColors.border : '#e5e7eb', backgroundColor: theme === 'dark' ? darkColors.surface : '#fff', color: theme === 'dark' ? darkColors.text : '#1f2937' }]}
                    value={editPoids}
                    onChangeText={setEditPoids}
                    keyboardType="numeric"
                    placeholder="Poids en kg"
                    placeholderTextColor={theme === 'dark' ? darkColors.textSecondary : '#9ca3af'}
                  />
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <TouchableOpacity onPress={() => setShowEditModal(false)} style={commonStyles.buttonSecondary}>
                  <Text style={commonStyles.buttonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSavePersonalInfo} style={commonStyles.buttonPrimary}>
                  <Text style={commonStyles.buttonText}>Enregistrer</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Modal d'édition de la durée des règles */}
        <Modal visible={showCycleModal} animationType="slide" transparent>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000070', paddingHorizontal: 0 }}>
            <View style={{ width: '98%', maxWidth: 400, backgroundColor: theme === 'dark' ? darkColors.surface : '#fff', borderRadius: 24, padding: isSmallScreen ? 8 : 16 }}>
              <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
              <Text style={{ fontSize: isSmallScreen ? 16 : 20, fontWeight: 'bold', marginBottom: 16, color: theme === 'dark' ? darkColors.text : '#1f2937' }}>Modifier la durée des règles</Text>
              <TextInput
                accessibilityLabel="Saisir la durée des règles"
                accessible={true}
                style={[commonStyles.input, { borderColor: theme === 'dark' ? darkColors.border : '#e5e7eb', backgroundColor: theme === 'dark' ? darkColors.surface : '#fff', color: theme === 'dark' ? darkColors.text : '#1f2937' }]}
                placeholder="Durée des règles (jours)"
                value={editCycleLength}
                onChangeText={setEditCycleLength}
                keyboardType="numeric"
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <TouchableOpacity onPress={() => { if (!savingCycle) setShowCycleModal(false); }} style={commonStyles.buttonSecondary} disabled={savingCycle}>
                  <Text style={commonStyles.buttonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveCycle} style={commonStyles.buttonPrimary} disabled={savingCycle}>
                  <Text style={commonStyles.buttonText}>{savingCycle ? 'Enregistrement...' : 'Enregistrer'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Modal d'édition de l'objectif de santé */}
        <Modal visible={showGoalModal} animationType="slide" transparent>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000070', paddingHorizontal: 0 }}>
            <View style={{ width: '98%', maxWidth: 400, backgroundColor: theme === 'dark' ? darkColors.surface : '#fff', borderRadius: 24, padding: isSmallScreen ? 8 : 16 }}>
              <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
              <Text style={{ fontSize: isSmallScreen ? 16 : 20, fontWeight: 'bold', marginBottom: 16, color: theme === 'dark' ? darkColors.text : '#1f2937' }}>Modifier l'objectif de santé</Text>
              <Picker
                selectedValue={editGoal}
                onValueChange={setEditGoal}
                style={{ marginBottom: 12, color: theme === 'dark' ? darkColors.text : '#1f2937', backgroundColor: theme === 'dark' ? darkColors.surface : '#fff' }}
              >
                <Picker.Item label="Suivi simple" value="Suivi simple" />
                <Picker.Item label="Grossesse" value="Grossesse" />
                <Picker.Item label="Contraception" value="Contraception" />
                <Picker.Item label="PMA/FIV" value="PMA/FIV" />
                <Picker.Item label="Autre" value="Autre" />
              </Picker>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <TouchableOpacity onPress={() => { if (!savingGoal) setShowGoalModal(false); }} style={commonStyles.buttonSecondary} disabled={savingGoal}>
                  <Text style={commonStyles.buttonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveGoal} style={commonStyles.buttonPrimary} disabled={savingGoal}>
                  <Text style={commonStyles.buttonText}>{savingGoal ? 'Enregistrement...' : 'Enregistrer'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Groupes de paramètres */}
        {settingsGroups.map((group) => (
          <View key={group.title} style={{ borderRadius: 24, marginBottom: 24, backgroundColor: theme === 'dark' ? darkColors.surface : '#fff', borderColor: theme === 'dark' ? darkColors.border : '#e5e7eb', borderWidth: 1 }}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderColor: theme === 'dark' ? darkColors.border : '#e5e7eb' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {getIcon(group.icon, 20)}
                <Text style={{ fontSize: isSmallScreen ? 13 : 16, fontWeight: 'bold', marginLeft: 8, color: theme === 'dark' ? darkColors.text : '#1f2937' }}>{group.title}</Text>
              </View>
            </View>
            <View style={{ padding: 16 }}>
              {group.items.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    {item.label === 'Paramètres du cycle' && (
                      <TouchableOpacity onPress={handleEditCycle} style={{ flex: 1 }}>
                        <Text style={{ fontSize: isSmallScreen ? 12 : 14, color: theme === 'dark' ? darkColors.text : '#1f2937' }}>{item.label}</Text>
                      </TouchableOpacity>
                    )}
                    {item.label === 'Objectifs de santé' && (
                      <TouchableOpacity onPress={handleEditGoal} style={{ flex: 1 }}>
                        <Text style={{ fontSize: isSmallScreen ? 12 : 14, color: theme === 'dark' ? darkColors.text : '#1f2937' }}>{item.label}</Text>
                      </TouchableOpacity>
                    )}
                    {item.label !== 'Paramètres du cycle' && item.label !== 'Objectifs de santé' && (
                      <Text style={{ fontSize: isSmallScreen ? 12 : 14, color: theme === 'dark' ? darkColors.text : '#1f2937' }}>{item.label}</Text>
                    )}
                    {item.badge && (
                      <View style={{ marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: theme === 'dark' ? darkColors.secondary : '#f3e8ff' }}>
                        <Text style={{ fontSize: 12, fontWeight: '500', color: theme === 'dark' ? darkColors.text : '#7c3aed' }}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {item.action === "toggle" && item.label === "Notifications générales" ? (
                      <Switch
                        value={notifications}
                        onValueChange={handleToggleNotifications}
                        trackColor={{ false: theme === 'dark' ? darkColors.border : '#e5e7eb', true: theme === 'dark' ? darkColors.primary : '#E11D48' }}
                        thumbColor={theme === 'dark' ? darkColors.text : '#fff'}
                      />
                    ) : item.action === "toggle" && item.label === "Authentification biométrique" ? (
                      <Switch
                        value={biometric}
                        onValueChange={setBiometric}
                        trackColor={{ false: theme === 'dark' ? darkColors.border : '#e5e7eb', true: theme === 'dark' ? darkColors.primary : '#E11D48' }}
                        thumbColor={theme === 'dark' ? darkColors.text : '#fff'}
                      />
                    ) : item.action === "toggle" && item.label === "Mode sombre" ? (
                      <Switch
                        value={darkMode}
                        onValueChange={setDarkMode}
                        trackColor={{ false: theme === 'dark' ? darkColors.border : '#e5e7eb', true: theme === 'dark' ? darkColors.primary : '#E11D48' }}
                        thumbColor={theme === 'dark' ? darkColors.text : '#fff'}
                      />
                    ) : (
                      <Feather name="chevron-right" size={16} color={theme === 'dark' ? darkColors.textSecondary : '#6b7280'} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Raccourcis rapides */}
        <View style={{ borderRadius: 24, padding: 24, marginBottom: 24, backgroundColor: theme === 'dark' ? darkColors.surface : '#fff', borderColor: theme === 'dark' ? darkColors.border : '#e5e7eb', borderWidth: 1 }}>
          <Text style={{ fontSize: isSmallScreen ? 13 : 16, fontWeight: 'bold', marginBottom: 8, color: theme === 'dark' ? darkColors.text : '#1f2937' }}>Raccourcis rapides</Text>
          <Text style={{ fontSize: isSmallScreen ? 12 : 14, marginBottom: 16, color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>Actions fréquemment utilisées</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={{ width: '48%', height: 64, marginBottom: 12, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: theme === 'dark' ? darkColors.elevated : '#f9fafb', borderColor: theme === 'dark' ? darkColors.border : '#e5e7eb', borderWidth: 1 }}
              >
                {getIcon(action.icon, 20)}
                <Text style={{ fontSize: isSmallScreen ? 10 : 12, marginTop: 4, fontWeight: '500', color: theme === 'dark' ? darkColors.text : '#1f2937' }}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Actions importantes */}
        <View style={{ borderRadius: 24, padding: 24, marginBottom: 24, backgroundColor: theme === 'dark' ? darkColors.surface : '#fff', borderColor: theme === 'dark' ? darkColors.border : '#e5e7eb', borderWidth: 1 }}>
          <Text style={{ fontSize: isSmallScreen ? 13 : 16, fontWeight: 'bold', marginBottom: 16, color: theme === 'dark' ? darkColors.text : '#1f2937' }}>Actions importantes</Text>
          <View style={{ gap: 12 }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, backgroundColor: theme === 'dark' ? darkColors.elevated : '#f9fafb' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="download" size={20} color={theme === 'dark' ? darkColors.primary : '#E11D48'} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ fontWeight: '500', color: theme === 'dark' ? darkColors.text : '#1f2937' }}>Exporter mes données</Text>
                  <Text style={{ fontSize: isSmallScreen ? 12 : 14, color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>Télécharger toutes vos données personnelles</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, backgroundColor: theme === 'dark' ? darkColors.elevated : '#fef2f2' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="trash-2" size={20} color="#ef4444" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ fontWeight: '500', color: '#ef4444' }}>Supprimer mon compte</Text>
                  <Text style={{ fontSize: isSmallScreen ? 12 : 14, color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>Supprimer définitivement votre compte et vos données</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Déconnexion */}
        <TouchableOpacity 
          accessibilityLabel="Se déconnecter"
          accessible={true}
          style={commonStyles.buttonPrimary}
          onPress={handleSignOut}
        >  
          <Text style={commonStyles.buttonText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>

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
            <Text style={{ fontSize: isSmallScreen ? 10 : 12, marginTop: 4, color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>Accueil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Calendar' as never)}>
            <Feather name="calendar" size={24} color={theme === 'dark' ? darkColors.textSecondary : '#6b7280'} />
            <Text style={{ fontSize: isSmallScreen ? 10 : 12, marginTop: 4, color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>Calendrier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Symptoms' as never)}>
            <Feather name="book-open" size={24} color={theme === 'dark' ? darkColors.textSecondary : '#6b7280'} />
            <Text style={{ fontSize: isSmallScreen ? 10 : 12, marginTop: 4, color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>Journal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Insights' as never)}>
            <Feather name="bar-chart" size={24} color={theme === 'dark' ? darkColors.textSecondary : '#6b7280'} />
            <Text style={{ fontSize: isSmallScreen ? 10 : 12, marginTop: 4, color: theme === 'dark' ? darkColors.textSecondary : '#6b7280' }}>Analyses</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Settings' as never)}>
            <Feather name="settings" size={24} color={theme === 'dark' ? darkColors.primary : '#E11D48'} />
            <Text style={{ fontSize: isSmallScreen ? 10 : 12, marginTop: 4, color: theme === 'dark' ? darkColors.primary : '#E11D48' }}>Réglages</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}