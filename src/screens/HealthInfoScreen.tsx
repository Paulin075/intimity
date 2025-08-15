import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { supabase } from '../services/supabase';

export const HealthInfoScreen = ({ navigation }) => {
  const [customWeight, setCustomWeight] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [showCustomInputs, setShowCustomInputs] = useState(false);

  const handleSubmit = async () => {
    try {
      const { user } = await supabase.auth.getUser();
      await supabase.from('user_measures').upsert({
        user_id: user.id,
        weight: parseFloat(customWeight),
        height: parseFloat(customHeight),
      });
      
      navigation.navigate('NextStep');
    } catch (error) {
      console.error('Error saving measures:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* ...existing select options... */}
      
      <TouchableOpacity
        onPress={() => setShowCustomInputs(true)}
        style={styles.customButton}
      >
        <Text>Entrer mes propres mesures</Text>
      </TouchableOpacity>

      {showCustomInputs && (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Poids (kg)"
            keyboardType="numeric"
            value={customWeight}
            onChangeText={setCustomWeight}
          />
          <TextInput
            style={styles.input}
            placeholder="Taille (cm)"
            keyboardType="numeric"
            value={customHeight}
            onChangeText={setCustomHeight}
          />
        </View>
      )}
    </View>
  );
};
