import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../hooks/use-theme';
import { palettes } from '../theme/palette';

const { width } = Dimensions.get('window');

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate: Date;
  title: string;
  subtitle: string;
}

export default function DatePickerModal({
  visible,
  onClose,
  onConfirm,
  initialDate,
  title,
  subtitle,
}: DatePickerModalProps) {
  const { theme } = useTheme();
  const palette = theme === 'dark' ? palettes.dark : palettes.light;
  
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [tempDate, setTempDate] = useState(initialDate);

  const handleConfirm = () => {
    onConfirm(selectedDate);
    onClose();
  };

  const handleCancel = () => {
    setTempDate(initialDate);
    setSelectedDate(initialDate);
    onClose();
  };

  const quickDates = [
    { label: 'Aujourd\'hui', date: new Date() },
    { label: 'Hier', date: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { label: 'Il y a 2 jours', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { label: 'Il y a 3 jours', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { label: 'Il y a 1 semaine', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    { label: 'Il y a 2 semaines', date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
  ];

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  };

  const isQuickDateSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: palette.border,
        }}>
          <TouchableOpacity onPress={handleCancel} style={{ padding: 8 }}>
            <Text style={{ color: palette.primary, fontSize: 16, fontWeight: '500' }}>
              Annuler
            </Text>
          </TouchableOpacity>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: palette.text,
            }}>
              {title}
            </Text>
            <Text style={{
              fontSize: 14,
              color: palette.textSecondary,
              marginTop: 2,
            }}>
              {subtitle}
            </Text>
          </View>
          
                     <TouchableOpacity onPress={handleConfirm} style={{ 
             padding: 8,
             minWidth: 80,
             alignItems: 'center',
           }}>
             <Text style={{ color: palette.primary, fontSize: 16, fontWeight: 'bold' }}>
               Confirmer
             </Text>
           </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Date sélectionnée */}
          <View style={{
            alignItems: 'center',
            paddingVertical: 32,
            paddingHorizontal: 20,
          }}>
            <View style={{
              backgroundColor: palette.primary + '20',
              borderRadius: 20,
              padding: 24,
              alignItems: 'center',
              minWidth: 200,
            }}>
              <Feather name="calendar" size={32} color={palette.primary} style={{ marginBottom: 12 }} />
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: palette.primary,
                textAlign: 'center',
              }}>
                {formatDate(selectedDate)}
              </Text>
              <Text style={{
                fontSize: 14,
                color: palette.textSecondary,
                marginTop: 4,
              }}>
                {selectedDate.toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>

          {/* Sélection rapide */}
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: palette.text,
              marginBottom: 16,
            }}>
              Sélection rapide
            </Text>
            
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
            }}>
              {quickDates.map((quickDate, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedDate(quickDate.date);
                    setTempDate(quickDate.date);
                  }}
                  style={{
                    backgroundColor: isQuickDateSelected(quickDate.date) 
                      ? palette.primary 
                      : palette.secondary,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderWidth: 2,
                    borderColor: isQuickDateSelected(quickDate.date) 
                      ? palette.primary 
                      : 'transparent',
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: isQuickDateSelected(quickDate.date) 
                      ? '#fff' 
                      : palette.text,
                  }}>
                    {quickDate.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sélecteur de date natif */}
          <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: palette.text,
              marginBottom: 16,
            }}>
              Choisir une date spécifique
            </Text>
            
            <View style={{
              backgroundColor: palette.secondary,
              borderRadius: 16,
              padding: 20,
              alignItems: 'center',
            }}>
                             {Platform.OS === 'android' ? (
                 <TouchableOpacity
                   onPress={() => {
                     // Sur Android, on affiche le picker natif
                     const picker = (
                       <DateTimePicker
                         value={tempDate}
                         mode="date"
                         display="default"
                         onChange={(event, date) => {
                           if (date) {
                             setTempDate(date);
                             setSelectedDate(date);
                           }
                         }}
                         maximumDate={new Date()}
                         minimumDate={new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)}
                       />
                     );
                     // Force l'affichage du picker
                     setTempDate(new Date(tempDate));
                   }}
                   style={{
                     backgroundColor: palette.primary,
                     borderRadius: 12,
                     paddingVertical: 12,
                     paddingHorizontal: 24,
                     alignItems: 'center',
                   }}
                 >
                   <Text style={{
                     color: '#fff',
                     fontSize: 16,
                     fontWeight: 'bold',
                   }}>
                     Ouvrir le calendrier
                   </Text>
                 </TouchableOpacity>
               ) : (
                 <DateTimePicker
                   value={tempDate}
                   mode="date"
                   display="spinner"
                   onChange={(event, date) => {
                     if (date) {
                       setTempDate(date);
                       setSelectedDate(date);
                     }
                   }}
                   maximumDate={new Date()}
                   minimumDate={new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)}
                   style={{
                     width: width - 80,
                   }}
                 />
               )}
            </View>
          </View>

          {/* Informations supplémentaires */}
          <View style={{
            backgroundColor: palette.secondary,
            marginHorizontal: 20,
            borderRadius: 16,
            padding: 20,
            marginBottom: 32,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Feather name="info" size={20} color={palette.primary} style={{ marginRight: 8 }} />
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: palette.text,
              }}>
                Conseils
              </Text>
            </View>
            <Text style={{
              fontSize: 14,
              color: palette.textSecondary,
              lineHeight: 20,
            }}>
              • Sélectionne le premier jour de tes règles{'\n'}
              • Cette date nous aide à calculer ton cycle{'\n'}
              • Tu pourras toujours la modifier plus tard
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
