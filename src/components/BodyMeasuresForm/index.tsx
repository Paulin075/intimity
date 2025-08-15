import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { supabase } from '../../services/supabase';

export const BodyMeasuresForm = ({ onComplete }) => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const handleSubmit = async () => {
    try {
      const { data, error } = await supabase
        .from('user_measures')
        .upsert({
          weight: parseFloat(weight),
          height: parseFloat(height),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      onComplete();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder vos mesures');
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Poids (kg)"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />
      <TextInput
        placeholder="Taille (cm)"
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
      />
      <Button title="Enregistrer" onPress={handleSubmit} />
    </View>
  );
};
