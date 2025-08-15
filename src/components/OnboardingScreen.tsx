import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import DatePickerModal from './DatePickerModal';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/use-auth';
import { useTheme } from '../hooks/use-theme';
import { palettes } from '../theme/palette';
import { commonStyles } from '../styles/common';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue sur Intimity',
    subtitle: 'Ton compagnon de confiance pour le suivi de ton cycle',
    icon: 'heart',
    color: '#FF4F8B',
  },
  {
    id: 'cycle',
    title: 'Durée de ton cycle',
    subtitle: 'Combien de jours dure généralement ton cycle ?',
    icon: 'calendar',
    color: '#FF4F8B',
  },
  {
    id: 'period',
    title: 'Durée de tes règles',
    subtitle: 'Combien de jours durent généralement tes règles ?',
    icon: 'droplet',
    color: '#FF4F8B',
  },
  {
    id: 'lastPeriod',
    title: 'Tes dernières règles',
    subtitle: 'Quand ont commencé tes dernières règles ?',
    icon: 'clock',
    color: '#FF4F8B',
  },
  {
    id: 'height',
    title: 'Ta taille',
    subtitle: 'Quelle est ta taille ? (pour des calculs plus précis)',
    icon: 'ruler',
    color: '#FF4F8B',
  },
  {
    id: 'weight',
    title: 'Ton poids',
    subtitle: 'Quel est ton poids ? (pour des calculs plus précis)',
    icon: 'activity',
    color: '#FF4F8B',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    subtitle: 'Veux-tu recevoir des rappels et notifications ?',
    icon: 'bell',
    color: '#FF4F8B',
  },
  {
    id: 'goal',
    title: 'Ton objectif',
    subtitle: 'Que souhaites-tu accomplir avec Intimity ?',
    icon: 'target',
    color: '#FF4F8B',
  },
  {
    id: 'complete',
    title: 'C\'est parti !',
    subtitle: 'Ton profil est configuré. Commençons l\'aventure !',
    icon: 'check-circle',
    color: '#FF4F8B',
  },
];

export default function OnboardingScreen() {
  const { updatePreferences, completeOnboarding } = useAuth();
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [lastPeriod, setLastPeriod] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [height, setHeight] = useState(165);
  const [weight, setWeight] = useState(60);
  const [notifications, setNotifications] = useState(true);
  const [goal, setGoal] = useState('Suivi du cycle');
  const [loading, setLoading] = useState(false);
  
  const slideAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(1);

  const goals = [
    { id: 'cycle', title: 'Suivi du cycle', icon: 'calendar', color: '#FF4F8B' },
    { id: 'conception', title: 'Conception', icon: 'heart', color: '#E91E63' },
    { id: 'wellness', title: 'Bien-être', icon: 'sun', color: '#FF9800' },
    { id: 'other', title: 'Autre', icon: 'more-horizontal', color: '#9C27B0' },
  ];

  const cycleOptions = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];
  const periodOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  const heightOptions = [140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200];
  const weightOptions = [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120];

  useEffect(() => {
    animateStep();
  }, [currentStep]);

  const animateStep = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await updatePreferences({
        cycleLength,
        periodLength,
        lastPeriod: lastPeriod.toISOString().split('T')[0],
        taille: height,
        poids: weight,
        notifications,
        reminders: notifications,
        onboardingCompleted: true,
        goal,
      });
      
      await completeOnboarding({
        cycleLength,
        periodLength,
        lastPeriod: lastPeriod.toISOString().split('T')[0],
        taille: height,
        poids: weight,
        notifications,
        reminders: notifications,
      });

      (navigation as any).reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder tes préférences');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    const step = onboardingSteps[currentStep];
    const palette = theme === 'dark' ? palettes.dark : palettes.light;

    switch (step.id) {
      case 'welcome':
        return (
          <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
            <View style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: step.color + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 32,
            }}>
              <Feather name={step.icon as any} size={48} color={step.color} />
            </View>
            <Text style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: palette.text,
              textAlign: 'center',
              marginBottom: 16,
            }}>
              {step.title}
            </Text>
            <Text style={{
              fontSize: 16,
              color: palette.textSecondary,
              textAlign: 'center',
              lineHeight: 24,
            }}>
              {step.subtitle}
            </Text>
          </View>
        );

      case 'cycle':
        return (
          <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: step.color + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <Feather name={step.icon as any} size={32} color={step.color} />
            </View>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: palette.text,
              textAlign: 'center',
              marginBottom: 8,
            }}>
              {step.title}
            </Text>
            <Text style={{
              fontSize: 14,
              color: palette.textSecondary,
              textAlign: 'center',
              marginBottom: 32,
            }}>
              {step.subtitle}
            </Text>
            
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 12,
              maxWidth: width - 80,
            }}>
              {cycleOptions.map((days) => (
                <TouchableOpacity
                  key={days}
                  onPress={() => setCycleLength(days)}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: cycleLength === days ? step.color : palette.secondary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: cycleLength === days ? step.color : 'transparent',
                  }}
                >
                  <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: cycleLength === days ? '#fff' : palette.text,
                  }}>
                    {days}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'period':
        return (
          <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: step.color + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <Feather name={step.icon as any} size={32} color={step.color} />
            </View>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: palette.text,
              textAlign: 'center',
              marginBottom: 8,
            }}>
              {step.title}
            </Text>
            <Text style={{
              fontSize: 14,
              color: palette.textSecondary,
              textAlign: 'center',
              marginBottom: 32,
            }}>
              {step.subtitle}
            </Text>
            
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 12,
              maxWidth: width - 80,
            }}>
              {periodOptions.map((days) => (
                <TouchableOpacity
                  key={days}
                  onPress={() => setPeriodLength(days)}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: periodLength === days ? step.color : palette.secondary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: periodLength === days ? step.color : 'transparent',
                  }}
                >
                  <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: periodLength === days ? '#fff' : palette.text,
                  }}>
                    {days}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'height':
        return (
          <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: step.color + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <Feather name={step.icon as any} size={32} color={step.color} />
            </View>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: palette.text,
              textAlign: 'center',
              marginBottom: 8,
            }}>
              {step.title}
            </Text>
            <Text style={{
              fontSize: 14,
              color: palette.textSecondary,
              textAlign: 'center',
              marginBottom: 32,
            }}>
              {step.subtitle}
            </Text>
            
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 12,
              maxWidth: width - 80,
            }}>
              {heightOptions.map((cm) => (
                <TouchableOpacity
                  key={cm}
                  onPress={() => setHeight(cm)}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: height === cm ? step.color : palette.secondary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: height === cm ? step.color : 'transparent',
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: height === cm ? '#fff' : palette.text,
                  }}>
                    {cm}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{
              fontSize: 14,
              color: palette.textSecondary,
              marginTop: 16,
            }}>
              cm
            </Text>
          </View>
        );

      case 'weight':
        return (
          <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: step.color + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <Feather name={step.icon as any} size={32} color={step.color} />
            </View>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: palette.text,
              textAlign: 'center',
              marginBottom: 8,
            }}>
              {step.title}
            </Text>
            <Text style={{
              fontSize: 14,
              color: palette.textSecondary,
              textAlign: 'center',
              marginBottom: 32,
            }}>
              {step.subtitle}
            </Text>
            
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 12,
              maxWidth: width - 80,
            }}>
              {weightOptions.map((kg) => (
                <TouchableOpacity
                  key={kg}
                  onPress={() => setWeight(kg)}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: weight === kg ? step.color : palette.secondary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: weight === kg ? step.color : 'transparent',
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: weight === kg ? '#fff' : palette.text,
                  }}>
                    {kg}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{
              fontSize: 14,
              color: palette.textSecondary,
              marginTop: 16,
            }}>
              kg
            </Text>
          </View>
        );

      case 'lastPeriod':
        return (
          <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: step.color + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <Feather name={step.icon as any} size={32} color={step.color} />
            </View>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: palette.text,
              textAlign: 'center',
              marginBottom: 8,
            }}>
              {step.title}
            </Text>
            <Text style={{
              fontSize: 14,
              color: palette.textSecondary,
              textAlign: 'center',
              marginBottom: 32,
            }}>
              {step.subtitle}
            </Text>
            
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                backgroundColor: palette.secondary,
                borderRadius: 16,
                padding: 20,
                alignItems: 'center',
                minWidth: 200,
                borderWidth: 2,
                borderColor: step.color + '40',
              }}
            >
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: step.color,
                marginBottom: 8,
              }}>
                {lastPeriod.toLocaleDateString('fr-FR', { 
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
              <Text style={{
                fontSize: 14,
                color: palette.textSecondary,
              }}>
                Appuie pour changer
              </Text>
            </TouchableOpacity>
            
            <DatePickerModal
              visible={showDatePicker}
              onClose={() => setShowDatePicker(false)}
              onConfirm={(date) => {
                setLastPeriod(date);
                setShowDatePicker(false);
              }}
              initialDate={lastPeriod}
              title="Tes dernières règles"
              subtitle="Quand ont commencé tes dernières règles ?"
            />
          </View>
        );

      case 'notifications':
        return (
          <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: step.color + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <Feather name={step.icon as any} size={32} color={step.color} />
            </View>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: palette.text,
              textAlign: 'center',
              marginBottom: 8,
            }}>
              {step.title}
            </Text>
            <Text style={{
              fontSize: 14,
              color: palette.textSecondary,
              textAlign: 'center',
              marginBottom: 32,
            }}>
              {step.subtitle}
            </Text>
            
            <View style={{ gap: 16, width: '100%', maxWidth: 280 }}>
              <TouchableOpacity
                onPress={() => setNotifications(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: notifications ? step.color : palette.secondary,
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 2,
                  borderColor: notifications ? step.color : 'transparent',
                }}
              >
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: notifications ? '#fff' : palette.border,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16,
                }}>
                  {notifications && (
                    <Feather name="check" size={16} color={step.color} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: notifications ? '#fff' : palette.text,
                  }}>
                    Oui, je veux des notifications
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: notifications ? '#fff' : palette.textSecondary,
                  }}>
                    Rappels pour tes règles et symptômes
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setNotifications(false)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: !notifications ? step.color : palette.secondary,
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 2,
                  borderColor: !notifications ? step.color : 'transparent',
                }}
              >
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: !notifications ? '#fff' : palette.border,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16,
                }}>
                  {!notifications && (
                    <Feather name="check" size={16} color={step.color} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: !notifications ? '#fff' : palette.text,
                  }}>
                    Non, pas maintenant
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: !notifications ? '#fff' : palette.textSecondary,
                  }}>
                    Tu pourras les activer plus tard
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'goal':
        return (
          <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: step.color + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <Feather name={step.icon as any} size={32} color={step.color} />
            </View>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: palette.text,
              textAlign: 'center',
              marginBottom: 8,
            }}>
              {step.title}
            </Text>
            <Text style={{
              fontSize: 14,
              color: palette.textSecondary,
              textAlign: 'center',
              marginBottom: 32,
            }}>
              {step.subtitle}
            </Text>
            
            <View style={{ gap: 12, width: '100%', maxWidth: 320 }}>
              {goals.map((goalOption) => (
                <TouchableOpacity
                  key={goalOption.id}
                  onPress={() => setGoal(goalOption.title)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: goal === goalOption.title ? goalOption.color : palette.secondary,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 2,
                    borderColor: goal === goalOption.title ? goalOption.color : 'transparent',
                  }}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: goal === goalOption.title ? '#fff' : goalOption.color + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16,
                  }}>
                    <Feather name={goalOption.icon as any} size={20} color={goal === goalOption.title ? goalOption.color : goalOption.color} />
                  </View>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: goal === goalOption.title ? '#fff' : palette.text,
                  }}>
                    {goalOption.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'complete':
        return (
          <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
            <View style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: step.color + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 32,
            }}>
              <Feather name={step.icon as any} size={48} color={step.color} />
            </View>
            <Text style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: palette.text,
              textAlign: 'center',
              marginBottom: 16,
            }}>
              {step.title}
            </Text>
            <Text style={{
              fontSize: 16,
              color: palette.textSecondary,
              textAlign: 'center',
              lineHeight: 24,
            }}>
              {step.subtitle}
            </Text>
            
            <View style={{
              backgroundColor: palette.secondary,
              borderRadius: 16,
              padding: 20,
              marginTop: 32,
              width: '100%',
              maxWidth: 300,
            }}>
              <Text style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: palette.text,
                marginBottom: 12,
              }}>
                Récapitulatif :
              </Text>
              <Text style={{ fontSize: 14, color: palette.textSecondary, marginBottom: 4 }}>
                • Cycle : {cycleLength} jours
              </Text>
              <Text style={{ fontSize: 14, color: palette.textSecondary, marginBottom: 4 }}>
                • Règles : {periodLength} jours
              </Text>
                             <Text style={{ fontSize: 14, color: palette.textSecondary, marginBottom: 4 }}>
                 • Dernières règles : {lastPeriod.toLocaleDateString('fr-FR')}
               </Text>
               <Text style={{ fontSize: 14, color: palette.textSecondary, marginBottom: 4 }}>
                 • Taille : {height} cm
               </Text>
               <Text style={{ fontSize: 14, color: palette.textSecondary, marginBottom: 4 }}>
                 • Poids : {weight} kg
               </Text>
               <Text style={{ fontSize: 14, color: palette.textSecondary, marginBottom: 4 }}>
                 • Notifications : {notifications ? 'Activées' : 'Désactivées'}
               </Text>
               <Text style={{ fontSize: 14, color: palette.textSecondary }}>
                 • Objectif : {goal}
               </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const palette = theme === 'dark' ? palettes.dark : palettes.light;
  const currentStepData = onboardingSteps[currentStep];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      {/* Header avec progression */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
      }}>
        {currentStep > 0 && (
          <TouchableOpacity onPress={handleBack} style={{ padding: 8 }}>
            <Feather name="chevron-left" size={24} color={palette.text} />
          </TouchableOpacity>
        )}
        
        <View style={{ flex: 1, marginHorizontal: 16 }}>
          <View style={{
            height: 4,
            backgroundColor: palette.secondary,
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <View style={{
              height: 4,
              backgroundColor: currentStepData.color,
              borderRadius: 2,
              width: `${((currentStep + 1) / onboardingSteps.length) * 100}%`,
            }} />
          </View>
        </View>
        
        <Text style={{
          fontSize: 14,
          color: palette.textSecondary,
          fontWeight: '500',
        }}>
          {currentStep + 1}/{onboardingSteps.length}
        </Text>
      </View>

      {/* Contenu principal */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {renderStepContent()}
        </Animated.View>
      </ScrollView>

      {/* Bouton de navigation */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: palette.background,
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: palette.border,
      }}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={loading}
          style={{
            backgroundColor: currentStepData.color,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          {loading ? (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
              Configuration...
            </Text>
          ) : (
            <>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                {currentStep === onboardingSteps.length - 1 ? 'Commencer' : 'Continuer'}
              </Text>
              <Feather 
                name={currentStep === onboardingSteps.length - 1 ? 'check' : 'chevron-right'} 
                size={20} 
                color="#fff" 
                style={{ marginLeft: 8 }}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
