import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { supabase } from '../../services/supabase';

export const PersonalInfoForm = ({ onComplete }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = async () => {
    try {
      const { user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          first_name: firstName,
          last_name: lastName,
        });
      
      if (error) throw error;
      onComplete();
    } catch (error) {
      console.error('Error saving personal info:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Prénom"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Nom"
        value={lastName}
        onChangeText={setLastName}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
    borderRadius: 8,
  },
});
