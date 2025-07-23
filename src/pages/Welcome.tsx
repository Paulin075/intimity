import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { useTheme } from '../hooks/use-theme';

const slides = [
  {
    icon: 'heart',
    title: 'Bienvenue sur Intimity !',
    text: 'Votre espace bien-être, moderne et rassurant pour le suivi du cycle menstruel.'
  },
  {
    icon: 'shield',
    title: 'Confidentialité & Sécurité',
    text: 'Vos données sont privées, chiffrées et jamais revendues. Conforme RGPD.'
  },
  {
    icon: 'calendar',
    title: 'Suivi personnalisé',
    text: 'Un suivi doux, intelligent et adapté à votre rythme, pour mieux comprendre votre corps.'
  },
  {
    icon: 'feather',
    title: 'Conseils bien-être',
    text: 'Des contenus bien-être, des conseils et des rappels doux pour chaque moment du cycle.'
  },
  {
    icon: 'bell',
    title: 'Notifications rassurantes',
    text: 'Recevez des rappels utiles, jamais intrusifs, pour prendre soin de vous.'
  }
];

export default function WelcomeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [current, setCurrent] = useState(0);

  const palette = {
    light: {
      background: '#FFEDF3',
      primary: '#FF4F8B',
      text: '#1C1C1C',
      textSecondary: '#A3B4FF',
      card: '#FFF',
    },
    dark: {
      background: '#1C1C1C',
      primary: '#FF4F8B',
      text: '#FFEDF3',
      textSecondary: '#A3B4FF',
      card: '#23232B',
    }
  }[theme === 'dark' ? 'dark' : 'light'];

  const handleNext = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else navigation.navigate('Auth', { tab: 'signup' });
  };
  const handlePrev = () => { if (current > 0) setCurrent(current - 1); };

  const slide = slides[current];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}> 
      <View style={[styles.container, { backgroundColor: palette.background }]}> 
        <View style={styles.iconCircle}>
          <Feather name={slide.icon as any} size={48} color={palette.primary} />
        </View>
        <Text style={[styles.title, { color: palette.primary }]}>{slide.title}</Text>
        <Text style={[styles.text, { color: palette.text }]}>{slide.text}</Text>
        <View style={styles.progressRow}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === current ? palette.primary : palette.card }]} />
          ))}
        </View>
        <View style={styles.btnRow}>
          {current > 0 && (
            <TouchableOpacity
              accessibilityLabel="Étape précédente"
              accessible={true}
              onPress={handlePrev}
              style={[styles.btn, { backgroundColor: palette.card, borderColor: palette.primary, borderWidth: 1 }]}
            >
              <Text style={[styles.btnText, { color: palette.primary }]}>Précédent</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            accessibilityLabel="Étape suivante"
            accessible={true}
            onPress={handleNext}
            style={[styles.btn, { backgroundColor: palette.primary }]}
          >
            <Text style={[styles.btnText, { color: palette.card }]}> {current < slides.length - 1 ? 'Suivant' : 'Commencer'} </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#FF4F8B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    boxShadow: '0 4px 24px rgba(255,79,139,0.12)',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 1,
  },
  text: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
    maxWidth: 340,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 16,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
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
}); 