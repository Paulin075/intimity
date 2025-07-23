import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/use-theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(width * 0.7, 260);
const STROKE_WIDTH = 12;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

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
const lightColors = {
  background: '#fff',
  surface: '#fff4f7',
  elevated: '#fff',
  primary: '#e11d48',
  secondary: '#fbcfe8',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  accentFertility: '#059669',
  accentRules: '#e11d48',
  overlay: '#fff4f7',
};

interface CyclePredictionProps {
  cycleLength: number;
  currentDay: number;
  nextPeriod: number;
  nextOvulation: number;
  fertilityLevel: 'Faible' | 'Moyenne' | 'Élevée';
  progression: number;
}

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

const getFertilityColor = (level: string, theme: string) => {
  if (level === 'Élevée') return theme === 'dark' ? darkColors.accentFertility : lightColors.accentFertility;
  if (level === 'Moyenne') return theme === 'dark' ? darkColors.primary : lightColors.primary;
  return theme === 'dark' ? darkColors.textSecondary : lightColors.textSecondary;
};

const getFertilityLabel = (level: string) => {
  if (level === 'Élevée') return 'Période d’ovulation';
  if (level === 'Moyenne') return 'Fenêtre fertile';
  return 'Phase basse';
};

const CyclePrediction: React.FC<CyclePredictionProps> = ({
  cycleLength,
  currentDay,
  nextPeriod,
  nextOvulation,
  fertilityLevel,
  progression,
}) => {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const progress = isNaN(currentDay / cycleLength) ? 0 : Math.max(0, Math.min(currentDay / cycleLength, 1));
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const progressionPercent = isNaN(progress) ? '--' : Math.round(progress * 100) + '%';
  const joursRestants = isNaN(cycleLength - currentDay) || (cycleLength - currentDay) < 0 ? '--' : cycleLength - currentDay;
  const conseilJour = conseils[(currentDay % conseils.length) || 0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Cercle de progression amélioré */}
      <View style={[styles.circleContainer, {
        backgroundColor: theme === 'dark' ? 'rgba(30,30,30,0.7)' : 'rgba(255,244,247,0.7)',
        overflow: 'hidden',
        shadowColor: theme === 'dark' ? darkColors.primary : lightColors.primary,
        shadowOpacity: 0.18,
        shadowRadius: 18,
        elevation: 8,
      }]}> 
        {/* Effet glassmorphism */}
        <LinearGradient
          colors={theme === 'dark' ? ['rgba(30,30,30,0.7)', 'rgba(60,60,60,0.5)'] : ['rgba(255,244,247,0.7)', 'rgba(255,255,255,0.5)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.9, y: 0.9 }}
        />
        {/* Cercle SVG avec dégradé */}
        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
          <Defs>
            <SvgGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={theme === 'dark' ? darkColors.primary : lightColors.primary} stopOpacity="1" />
              <Stop offset="100%" stopColor={theme === 'dark' ? darkColors.accentFertility : lightColors.accentFertility} stopOpacity="0.8" />
            </SvgGradient>
          </Defs>
          <Circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            stroke={theme === 'dark' ? darkColors.secondary : lightColors.secondary}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <Circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            stroke="url(#progressGradient)"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE},${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
          {/* Repères visuels pour règles, ovulation, fertile */}
          {/* Règles (début) */}
          <Circle
            cx={CIRCLE_SIZE / 2}
            cy={STROKE_WIDTH / 2 + 4}
            r={6}
            fill={theme === 'dark' ? darkColors.accentRules : lightColors.primary}
            opacity={0.8}
          />
          {/* Ovulation (milieu) */}
          <Circle
            cx={CIRCLE_SIZE / 2 + RADIUS * Math.cos(Math.PI / 2)}
            cy={CIRCLE_SIZE / 2 + RADIUS * Math.sin(Math.PI / 2)}
            r={6}
            fill={theme === 'dark' ? darkColors.accentFertility : lightColors.accentFertility}
            opacity={0.8}
          />
          {/* Fertile (3/4) */}
          <Circle
            cx={CIRCLE_SIZE / 2 + RADIUS * Math.cos(Math.PI * 1.2)}
            cy={CIRCLE_SIZE / 2 + RADIUS * Math.sin(Math.PI * 1.2)}
            r={5}
            fill={theme === 'dark' ? darkColors.primary : lightColors.primary}
            opacity={0.5}
          />
        </Svg>
        {/* Halo/Glow autour du centre */}
        <View style={{
          position: 'absolute',
          top: CIRCLE_SIZE / 2 - 38,
          left: CIRCLE_SIZE / 2 - 38,
          width: 76,
          height: 76,
          borderRadius: 38,
          backgroundColor: theme === 'dark' ? 'rgba(255,143,163,0.18)' : 'rgba(225,29,72,0.12)',
          shadowColor: theme === 'dark' ? darkColors.primary : lightColors.primary,
          shadowOpacity: 0.18,
          shadowRadius: 18,
          elevation: 8,
        }} />
        {/* Centre vivant (icône + badge) */}
        <View style={[styles.circleContent, { zIndex: 2 }]}> 
          <MaterialCommunityIcons name="target" size={38} color={theme === 'dark' ? darkColors.primary : lightColors.primary} style={{ marginBottom: 2 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Text style={[styles.dayNumber, { color: colors.primary }]}>{currentDay}</Text>
            {fertilityLevel === 'Élevée' && (
              <View style={{ marginLeft: 6, backgroundColor: theme === 'dark' ? darkColors.accentFertility : lightColors.accentFertility, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Fertile</Text>
              </View>
            )}
            {fertilityLevel === 'Moyenne' && (
              <View style={{ marginLeft: 6, backgroundColor: theme === 'dark' ? darkColors.primary : lightColors.primary, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Fertile</Text>
              </View>
            )}
            {fertilityLevel === 'Faible' && (
              <View style={{ marginLeft: 6, backgroundColor: theme === 'dark' ? darkColors.secondary : lightColors.secondary, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ color: theme === 'dark' ? darkColors.text : lightColors.primary, fontWeight: 'bold', fontSize: 13 }}>Repos</Text>
              </View>
            )}
          </View>
          <Text style={[styles.dayLabel, { color: colors.primary }]}>Jour {currentDay}/{cycleLength}</Text>
          <Text style={[styles.ovulationLabel, { color: colors.primary }]}>{fertilityLevel === 'Élevée' ? 'Ovulation' : fertilityLevel === 'Moyenne' ? 'Période fertile' : 'Phase basse'}</Text>
        </View>
      </View>
      {/* Cartes prédictives */}
      <View style={styles.cardsGrid}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}> 
          <Feather name="droplet" size={22} color={colors.primary} style={{ marginBottom: 2 }} />
          <Text style={[styles.cardTitle, { color: colors.primary }]}>Prochaines règles</Text>
          <Text style={[styles.cardValue, { color: colors.primary }]}>{nextPeriod}</Text>
          <Text style={styles.cardUnit}>jours</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface }]}> 
          <Feather name="trending-up" size={22} color={colors.primary} style={{ marginBottom: 2 }} />
          <Text style={[styles.cardTitle, { color: colors.primary }]}>Progression</Text>
          <Text style={[styles.cardValue, { color: colors.primary }]}>{progressionPercent}</Text>
          <Text style={styles.cardUnit}>accompli</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface }]}> 
          <Feather name="calendar" size={22} color={colors.accentFertility} style={{ marginBottom: 2 }} />
          <Text style={[styles.cardTitle, { color: colors.accentFertility }]}>Jours restants</Text>
          <Text style={[styles.cardValue, { color: colors.accentFertility }]}>{joursRestants}</Text>
          <Text style={styles.cardUnit}>jours</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface }]}> 
          <Feather name="heart" size={22} color={getFertilityColor(fertilityLevel, theme)} style={{ marginBottom: 2 }} />
          <Text style={[styles.cardTitle, { color: getFertilityColor(fertilityLevel, theme) }]}>Fertilité</Text>
          <Text style={[styles.cardValue, { color: getFertilityColor(fertilityLevel, theme) }]}>{fertilityLevel}</Text>
          <Text style={styles.cardUnit}>{getFertilityLabel(fertilityLevel)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderRadius: CIRCLE_SIZE / 2,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
  },
  circleContent: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontSize: 38,
    fontWeight: 'bold',
  },
  dayLabel: {
    fontSize: 15,
    marginBottom: 2,
  },
  ovulationLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
    rowGap: 10,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    width: '47%',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  cardUnit: {
    fontSize: 13,
    color: '#a1a1aa',
  },
  messageBox: {
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 15,
    fontWeight: '500',
  },
});

export default CyclePrediction; 