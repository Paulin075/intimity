import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView, SafeAreaView } from 'react-native';
import { useTheme } from '../hooks/use-theme';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
// Ajout pour le web
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../hooks/use-auth';
import { supabase } from '../integrations/supabase/client';

const steps = [
  'Objectif principal',
  'Date de naissance',
  'Taille et poids',
  'Symptômes à suivre',
  'Contraception',
  'Cycle menstruel',
  'Bien-être',
  'Préférences',
  'Autres infos santé',
  'Résumé & confirmation'
];

const stepData = [
  {
    icon: <Feather name="target" size={36} color="#FF4F8B" />,
    title: 'Quel est ton objectif principal ?',
    subtitle: 'Pour personnaliser ton expérience Intimity.'
  },
  {
    icon: <Feather name="calendar" size={36} color="#FF4F8B" />,
    title: 'Date de naissance',
    subtitle: 'Ces infos restent privées et modifiables plus tard.'
  },
  {
    icon: <MaterialCommunityIcons name="human-male-height" size={36} color="#FF4F8B" />,
    title: 'Taille et poids',
    subtitle: 'Pour personnaliser tes prédictions.'
  },
  {
    icon: <Feather name="activity" size={36} color="#FF4F8B" />,
    title: 'Symptômes à suivre',
    subtitle: 'Sélectionne les symptômes que tu souhaites suivre.'
  },
  {
    icon: <Feather name="shield" size={36} color="#FF4F8B" />,
    title: 'Contraception',
    subtitle: 'Utilises-tu une contraception ?'
  },
  {
    icon: <Feather name="droplet" size={36} color="#FF4F8B" />,
    title: 'Cycle menstruel',
    subtitle: 'Quelques infos pour mieux t’accompagner.'
  },
  {
    icon: <Feather name="smile" size={36} color="#FF4F8B" />,
    title: 'Bien-être',
    subtitle: 'Pour adapter les conseils à ton quotidien.'
  },
  {
    icon: <Feather name="settings" size={36} color="#FF4F8B" />,
    title: 'Préférences',
    subtitle: 'Derniers réglages pour une expérience sur-mesure.'
  },
  {
    icon: <Feather name="info" size={36} color="#FF4F8B" />,
    title: 'Autres infos santé',
    subtitle: 'Allergies, pathologies, remarques (optionnel)'
  },
  {
    icon: <Feather name="check-circle" size={36} color="#FF4F8B" />,
    title: 'Résumé & confirmation',
    subtitle: 'Vérifie et valide tes informations.'
  },
];

export default function OnboardingSante() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [step, setStep] = useState(0);
  const [objectif, setObjectif] = useState('');
  const [birth, setBirth] = useState('');
  const [taille, setTaille] = useState('');
  const [poids, setPoids] = useState('');
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState('');
  const [periodLength, setPeriodLength] = useState('');
  const [activity, setActivity] = useState('');
  const [sleep, setSleep] = useState('');
  const [stress, setStress] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [langue, setLangue] = useState('fr');
  const [themePref, setThemePref] = useState('clair');
  const [showBirthPicker, setShowBirthPicker] = useState(false);
  const [showLastPeriodPicker, setShowLastPeriodPicker] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [symptomes, setSymptomes] = useState<string[]>([]);
  const [contraception, setContraception] = useState<'Oui' | 'Non' | ''>('');
  const [contraceptionType, setContraceptionType] = useState('');
  const [autresInfos, setAutresInfos] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { user } = useAuth();

  const palette = {
    light: {
      background: '#FFEDF3',
      primary: '#FF4F8B',
      secondary: '#FFF',
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

  const handleNext = () => {
    setFeedback('');
    setStep(s => Math.min(s + 1, steps.length - 1));
  };
  const handlePrev = () => {
    setFeedback('');
    setStep(s => Math.max(s - 1, 0));
  };
  const handleSkip = () => {
    setFeedback('');
    setStep(s => Math.min(s + 1, steps.length - 1));
  };
  const handleFinish = async () => {
    if (!user) {
      setSaveError('Utilisateur non connecté.');
      return;
    }
    if (!user.utilisatriceId || typeof user.utilisatriceId !== 'string') {
      setSaveError('Impossible de retrouver votre identifiant utilisateur. Veuillez réessayer.');
      return;
    }
    setLoading(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      // 1. Mettre à jour la table utilisatrices
      await supabase
        .from('utilisatrices')
        .update({
          taille: taille ? Number(taille) : undefined,
          poids: poids ? Number(poids) : undefined,
          date_naissance: birth || undefined,
          symptomes_suivis: symptomes.length ? symptomes : undefined,
        })
        .eq('id', user.utilisatriceId);

      // 2. Mettre à jour la table parametres (avec infos_sante)
      await supabase
        .from('parametres')
        .upsert([
          {
            utilisatrice_id: user.utilisatriceId,
            objectif: objectif,
            theme: themePref,
            notifications: notifications,
            langue: langue,
            duree_regles: cycleLength ? Number(cycleLength) : undefined,
            infos_sante: {
              contraception: contraception ? { reponse: contraception, type: contraceptionType } : null,
              autresInfos: autresInfos || null,
            },
          }
        ], { onConflict: 'utilisatrice_id' });

      setSaveSuccess(true);
      setLoading(false);
      navigation.navigate('Dashboard');
    } catch (e: any) {
      setSaveError('Erreur lors de la sauvegarde : ' + (e?.message || e));
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.container, { backgroundColor: palette.background }]}>
          {/* Progression */}
          <View style={{ width: '100%', alignItems: 'center', marginBottom: 18 }}>
            <Text style={{ color: palette.primary, fontWeight: 'bold', fontSize: 15 }}>Étape {step + 1} / {steps.length}</Text>
            <View style={{ height: 8, width: 180, backgroundColor: palette.secondary, borderRadius: 8, marginTop: 6, marginBottom: 2 }}>
              <View style={{ height: 8, width: ((step + 1) / steps.length) * 180, backgroundColor: palette.primary, borderRadius: 8 }} />
            </View>
          </View>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 10 }}>
            {stepData[step].icon}
            <Text style={[styles.title, { color: palette.primary }]}>{stepData[step].title}</Text>
            <Text style={{ color: palette.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 8 }}>{stepData[step].subtitle}</Text>
          </View>
          {/* Cartes de questions */}
          <View style={{ backgroundColor: palette.secondary, borderRadius: 18, padding: 20, width: 320, 
            shadowColor: '#FF4F8B', shadowOpacity: 0.08, shadowRadius: 12, marginBottom: 12,
            boxShadow: '0 4px 24px rgba(255,79,139,0.08)'
          }}>
            {step === 0 && (
              <>
                <Text style={{ color: palette.text, fontSize: 16, marginBottom: 12 }}>Choisis ton objectif principal :</Text>
                {['Suivi du cycle', 'Connaître ma fertilité', 'Suivi des symptômes', 'Grossesse', 'Autre'].map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={{
                      backgroundColor: objectif === opt ? palette.primary : palette.background,
                      borderColor: palette.primary,
                      borderWidth: 2,
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 10,
                    }}
                    onPress={() => {
                      setObjectif(opt);
                      setFeedback('Merci, c’est noté !');
                    }}
                    accessibilityLabel={`Choisir l'objectif ${opt}`}
                  >
                    <Text style={{ color: objectif === opt ? palette.background : palette.text, fontWeight: 'bold', fontSize: 16 }}>{opt}</Text>
                  </TouchableOpacity>
                ))}
                {feedback ? <Text style={{ color: palette.primary, marginTop: 8, fontWeight: 'bold' }}>{feedback}</Text> : null}
              </>
            )}
            {step === 1 && (
              <>
                {Platform.OS === 'web' ? (
                  <DatePicker
                    selected={birth ? new Date(birth) : null}
                    onChange={(date: Date | null) => date && setBirth(date.toISOString().split('T')[0])}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Sélectionne ta date de naissance"
                    className="custom-datepicker"
                  />
                ) : (
                  <>
                    <TouchableOpacity onPress={() => setShowBirthPicker(true)} style={[styles.input, { justifyContent: 'center', alignItems: 'flex-start', backgroundColor: palette.background, borderColor: palette.border }]}> 
                      <Text style={{ color: birth ? palette.text : palette.textSecondary, fontSize: 16 }}>{birth ? birth : 'Sélectionne ta date de naissance'}</Text>
                    </TouchableOpacity>
                    {showBirthPicker && (
                      <DateTimePicker
                        value={birth ? new Date(birth) : new Date(2000, 0, 1)}
                        mode="date"
                        display="calendar"
                        onChange={(event, date) => {
                          setShowBirthPicker(false);
                          if (date) setBirth(date.toISOString().split('T')[0]);
                        }}
                        maximumDate={new Date()}
                      />
                    )}
                  </>
                )}
              </>
            )}
            {step === 2 && (
              <>
                <TextInput
                  style={[styles.input, { backgroundColor: palette.background, color: palette.text, borderColor: palette.border }]}
                  placeholder="Taille (cm)"
                  placeholderTextColor={palette.textSecondary}
                  value={taille}
                  onChangeText={setTaille}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, { backgroundColor: palette.background, color: palette.text, borderColor: palette.border }]}
                  placeholder="Poids (kg)"
                  placeholderTextColor={palette.textSecondary}
                  value={poids}
                  onChangeText={setPoids}
                  keyboardType="numeric"
                />
              </>
            )}
            {step === 3 && (
              <>
                <Text style={{ color: palette.text, fontSize: 16, marginBottom: 12 }}>Quels symptômes veux-tu suivre ?</Text>
                {['Douleurs', 'Humeur', 'Migraine', 'Fatigue', 'Ballonnements', 'Acné', 'Appétit', 'Sommeil', 'Autre'].map(symptome => (
                  <TouchableOpacity
                    key={symptome}
                    style={{
                      backgroundColor: symptomes.includes(symptome) ? palette.primary : palette.background,
                      borderColor: palette.primary,
                      borderWidth: 2,
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 10,
                    }}
                    onPress={() => {
                      setSymptomes(prev => prev.includes(symptome)
                        ? prev.filter(s => s !== symptome)
                        : [...prev, symptome]);
                      setFeedback('Merci, c’est noté !');
                    }}
                    accessibilityLabel={`Sélectionner le symptôme ${symptome}`}
                  >
                    <Text style={{ color: symptomes.includes(symptome) ? palette.background : palette.text, fontWeight: 'bold', fontSize: 16 }}>{symptome}</Text>
                  </TouchableOpacity>
                ))}
                {feedback ? <Text style={{ color: palette.primary, marginTop: 8, fontWeight: 'bold' }}>{feedback}</Text> : null}
              </>
            )}
            {step === 4 && (
              <>
                <Text style={{ color: palette.text, fontSize: 16, marginBottom: 12 }}>Utilises-tu une contraception ?</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                  {['Oui', 'Non'].map(opt => (
                    <TouchableOpacity
                      key={opt}
                      style={{
                        backgroundColor: contraception === opt ? palette.primary : palette.background,
                        borderColor: palette.primary,
                        borderWidth: 2,
                        borderRadius: 12,
                        padding: 12,
                        marginRight: 10,
                      }}
                      onPress={() => {
                        setContraception(opt as 'Oui' | 'Non');
                        setFeedback('Merci, c’est noté !');
                        if (opt === 'Non') setContraceptionType('');
                      }}
                      accessibilityLabel={`Choisir ${opt} pour contraception`}
                    >
                      <Text style={{ color: contraception === opt ? palette.background : palette.text, fontWeight: 'bold', fontSize: 16 }}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {contraception === 'Oui' && (
                  <>
                    <Text style={{ color: palette.text, fontSize: 15, marginBottom: 8 }}>Quel type de contraception ?</Text>
                    {['Pilule', 'Stérilet', 'Implant', 'Préservatif', 'Autre'].map(type => (
                      <TouchableOpacity
                        key={type}
                        style={{
                          backgroundColor: contraceptionType === type ? palette.primary : palette.background,
                          borderColor: palette.primary,
                          borderWidth: 2,
                          borderRadius: 12,
                          padding: 12,
                          marginBottom: 10,
                        }}
                        onPress={() => {
                          setContraceptionType(type);
                          setFeedback('Merci, c’est noté !');
                        }}
                        accessibilityLabel={`Choisir le type de contraception ${type}`}
                      >
                        <Text style={{ color: contraceptionType === type ? palette.background : palette.text, fontWeight: 'bold', fontSize: 16 }}>{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
                {feedback ? <Text style={{ color: palette.primary, marginTop: 8, fontWeight: 'bold' }}>{feedback}</Text> : null}
              </>
            )}
            {step === 5 && (
              <>
                {Platform.OS === 'web' ? (
                  <DatePicker
                    selected={lastPeriod ? new Date(lastPeriod) : null}
                    onChange={(date: Date | null) => date && setLastPeriod(date.toISOString().split('T')[0])}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Date des dernières règles"
                    className="custom-datepicker"
                  />
                ) : (
                  <>
                    <TouchableOpacity onPress={() => setShowLastPeriodPicker(true)} style={[styles.input, { justifyContent: 'center', alignItems: 'flex-start', backgroundColor: palette.background, borderColor: palette.border }]}> 
                      <Text style={{ color: lastPeriod ? palette.text : palette.textSecondary, fontSize: 16 }}>{lastPeriod ? lastPeriod : 'Date des dernières règles'}</Text>
                    </TouchableOpacity>
                    {showLastPeriodPicker && (
                      <DateTimePicker
                        value={lastPeriod ? new Date(lastPeriod) : new Date()}
                        mode="date"
                        display="calendar"
                        onChange={(event, date) => {
                          setShowLastPeriodPicker(false);
                          if (date) setLastPeriod(date.toISOString().split('T')[0]);
                        }}
                        maximumDate={new Date()}
                      />
                    )}
                  </>
                )}
                <TextInput
                  style={[styles.input, { backgroundColor: palette.background, color: palette.text, borderColor: palette.border }]}
                  placeholder="Durée du cycle (jours)"
                  placeholderTextColor={palette.textSecondary}
                  value={cycleLength}
                  onChangeText={setCycleLength}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, { backgroundColor: palette.background, color: palette.text, borderColor: palette.border }]}
                  placeholder="Durée des règles (jours)"
                  placeholderTextColor={palette.textSecondary}
                  value={periodLength}
                  onChangeText={setPeriodLength}
                  keyboardType="numeric"
                />
              </>
            )}
            {step === 6 && (
              <>
                <TextInput
                  style={[styles.input, { backgroundColor: palette.background, color: palette.text, borderColor: palette.border }]}
                  placeholder="Activité physique (ex : modérée)"
                  placeholderTextColor={palette.textSecondary}
                  value={activity}
                  onChangeText={setActivity}
                />
                <TextInput
                  style={[styles.input, { backgroundColor: palette.background, color: palette.text, borderColor: palette.border }]}
                  placeholder="Sommeil (heures/nuit)"
                  placeholderTextColor={palette.textSecondary}
                  value={sleep}
                  onChangeText={setSleep}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, { backgroundColor: palette.background, color: palette.text, borderColor: palette.border }]}
                  placeholder="Niveau de stress (1-10)"
                  placeholderTextColor={palette.textSecondary}
                  value={stress}
                  onChangeText={setStress}
                  keyboardType="numeric"
                />
              </>
            )}
            {step === 7 && (
              <>
                <Text style={{ color: palette.text, marginBottom: 8 }}>Notifications</Text>
                <TouchableOpacity onPress={() => setNotifications(n => !n)} style={[styles.toggle, { backgroundColor: notifications ? palette.primary : palette.secondary, shadowColor: '#FF4F8B', shadowOpacity: 0.12, shadowRadius: 8, boxShadow: '0 2px 8px rgba(255,79,139,0.12)' }]}>
                  <Text style={{ color: notifications ? palette.background : palette.text, fontWeight: 'bold' }}> {notifications ? 'Activées' : 'Désactivées'} </Text>
                </TouchableOpacity>
                <Text style={{ color: palette.text, marginTop: 16, marginBottom: 8 }}>Langue</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => setLangue('fr')} style={[styles.toggle, { backgroundColor: langue === 'fr' ? palette.primary : palette.secondary }]}><Text style={{ color: langue === 'fr' ? palette.background : palette.text, fontWeight: 'bold' }}>Français</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setLangue('en')} style={[styles.toggle, { backgroundColor: langue === 'en' ? palette.primary : palette.secondary }]}><Text style={{ color: langue === 'en' ? palette.background : palette.text, fontWeight: 'bold' }}>English</Text></TouchableOpacity>
                </View>
                <Text style={{ color: palette.text, marginTop: 16, marginBottom: 8 }}>Thème</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => setThemePref('clair')} style={[styles.toggle, { backgroundColor: themePref === 'clair' ? palette.primary : palette.secondary }]}><Text style={{ color: themePref === 'clair' ? palette.background : palette.text, fontWeight: 'bold' }}>Clair</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setThemePref('sombre')} style={[styles.toggle, { backgroundColor: themePref === 'sombre' ? palette.primary : palette.secondary }]}><Text style={{ color: themePref === 'sombre' ? palette.background : palette.text, fontWeight: 'bold' }}>Sombre</Text></TouchableOpacity>
                </View>
              </>
            )}
            {step === 8 && (
              <>
                <Text style={{ color: palette.text, fontSize: 16, marginBottom: 12 }}>Autres infos santé importantes (optionnel)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: palette.background, color: palette.text, borderColor: palette.border, minHeight: 60 }]}
                  placeholder="Allergies, pathologies, remarques..."
                  placeholderTextColor={palette.textSecondary}
                  value={autresInfos}
                  onChangeText={setAutresInfos}
                  multiline
                  numberOfLines={3}
                  accessibilityLabel="Saisir d'autres informations santé importantes"
                />
                {feedback ? <Text style={{ color: palette.primary, marginTop: 8, fontWeight: 'bold' }}>{feedback}</Text> : null}
              </>
            )}
            {step === 9 && (
              <>
                <Text style={{ color: palette.text, fontSize: 17, fontWeight: 'bold', marginBottom: 10 }}>Résumé de tes informations</Text>
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ color: palette.text }}><Text style={{ fontWeight: 'bold' }}>Objectif :</Text> {objectif || 'Non renseigné'}</Text>
                  <Text style={{ color: palette.text }}><Text style={{ fontWeight: 'bold' }}>Date de naissance :</Text> {birth || 'Non renseigné'}</Text>
                  <Text style={{ color: palette.text }}><Text style={{ fontWeight: 'bold' }}>Taille :</Text> {taille || 'Non renseigné'} cm</Text>
                  <Text style={{ color: palette.text }}><Text style={{ fontWeight: 'bold' }}>Poids :</Text> {poids || 'Non renseigné'} kg</Text>
                  <Text style={{ color: palette.text }}><Text style={{ fontWeight: 'bold' }}>Symptômes suivis :</Text> {symptomes.length ? symptomes.join(', ') : 'Aucun'}</Text>
                  <Text style={{ color: palette.text }}><Text style={{ fontWeight: 'bold' }}>Contraception :</Text> {contraception || 'Non renseigné'} {contraception === 'Oui' && contraceptionType ? `(${contraceptionType})` : ''}</Text>
                  <Text style={{ color: palette.text }}><Text style={{ fontWeight: 'bold' }}>Date dernières règles :</Text> {lastPeriod || 'Non renseigné'}</Text>
                  <Text style={{ color: palette.text }}><Text style={{ fontWeight: 'bold' }}>Durée du cycle :</Text> {cycleLength || 'Non renseigné'} jours</Text>
                  <Text style={{ color: palette.text }}><Text style={{ fontWeight: 'bold' }}>Durée des règles :</Text> {periodLength || 'Non renseigné'} jours</Text>
                  <Text style={{ color: palette.text }}><Text style={{ fontWeight: 'bold' }}>Activité physique :</Text> {activity || 'Non renseigné'}</Text>
                  <Text style={{ color: palette.text }}><Text style={{ fontWeight: 'bold' }}>Sommeil :</Text> {sleep || 'Non renseigné'} h/nuit</Text>
                  <Text style={{ color: palette.text }}><Text style={{ fontWeight: 'bold' }}>Stress :</Text> {stress || 'Non renseigné'}</Text>
                  <Text style={{ color: palette.text }}><Text style={{ fontWeight: 'bold' }}>Notifications :</Text> {notifications ? 'Oui' : 'Non'}</Text>
                  <Text style={{ color: palette.text }}><Text style={{ fontWeight: 'bold' }}>Langue :</Text> {langue}</Text>
                  <Text style={{ color: palette.text }}><Text style={{ fontWeight: 'bold' }}>Thème :</Text> {themePref}</Text>
                  <Text style={{ color: palette.text }}><Text style={{ fontWeight: 'bold' }}>Autres infos santé :</Text> {autresInfos || 'Aucune'}</Text>
                </View>
                <Text style={{ color: palette.primary, fontWeight: 'bold', marginBottom: 10 }}>Tu pourras modifier toutes ces informations plus tard dans les paramètres.</Text>
                {saveError && <Text style={{ color: 'red', marginBottom: 8 }}>{saveError}</Text>}
                {saveSuccess && <Text style={{ color: 'green', marginBottom: 8 }}>Onboarding terminé avec succès !</Text>}
                <TouchableOpacity style={[styles.btn, { backgroundColor: palette.primary, marginTop: 10, opacity: loading ? 0.6 : 1 }]} onPress={handleFinish} accessibilityLabel="Valider l'onboarding" disabled={loading}>
                  <Text style={[styles.btnText, { color: palette.secondary }]}>{loading ? 'Enregistrement...' : 'Valider et terminer'}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          {/* Boutons */}
          <View style={styles.btnRow}>
            {step > 0 && (
              <TouchableOpacity style={[styles.btn, { backgroundColor: palette.secondary, borderColor: palette.primary, borderWidth: 1, shadowColor: '#FF4F8B', shadowOpacity: 0.10, shadowRadius: 8, boxShadow: '0 2px 12px rgba(255,79,139,0.10)' }]} onPress={handlePrev} accessibilityLabel="Étape précédente">
                <Text style={[styles.btnText, { color: palette.primary }]}>Précédent</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.btn, { backgroundColor: palette.secondary, borderColor: palette.primary, borderWidth: 1, marginRight: 8 }]} onPress={handleSkip} accessibilityLabel="Passer cette étape">
              <Text style={[styles.btnText, { color: palette.primary }]}>Passer</Text>
            </TouchableOpacity>
            {step < steps.length - 1 ? (
              <TouchableOpacity style={[styles.btn, { backgroundColor: palette.primary, shadowColor: '#FF4F8B', shadowOpacity: 0.15, shadowRadius: 10, boxShadow: '0 4px 16px rgba(255,79,139,0.15)' }]} onPress={handleNext} accessibilityLabel="Étape suivante">
                <Text style={[styles.btnText, { color: palette.secondary }]}>Suivant</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.btn, { backgroundColor: palette.primary, shadowColor: '#FF4F8B', shadowOpacity: 0.15, shadowRadius: 10, boxShadow: '0 4px 16px rgba(255,79,139,0.15)' }]} onPress={handleFinish} accessibilityLabel="Terminer l'onboarding">
                <Text style={[styles.btnText, { color: palette.secondary }]}>Terminer</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 1,
  },
  input: {
    width: 280,
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 14,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginHorizontal: 6,
  },
  btnText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  toggle: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginHorizontal: 4,
    marginBottom: 4,
  },
}); 