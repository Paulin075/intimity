import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { userProfileService } from '../services/userProfile';

export const OnboardingScreen = () => {
  const [userData, setUserData] = useState({
    nom: '',
    prenom: '',
    taille: '',
    poids: '',
  });

  const handleSubmit = async () => {
    try {
      const { user } = await supabase.auth.getUser();
      await userProfileService.updateProfile(user.id, {
        nom: userData.nom,
        prenom: userData.prenom,
        taille: parseInt(userData.taille),
        poids: parseFloat(userData.poids),
      });

      // Mettre à jour les préférences utilisateur
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          onboarding_completed: true,
        });

      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Prénom"
        value={userData.prenom}
        onChangeText={(text) => setUserData(prev => ({ ...prev, prenom: text }))}
      />
      <TextInput
        placeholder="Nom"
        value={userData.nom}
        onChangeText={(text) => setUserData(prev => ({ ...prev, nom: text }))}
      />
      <TextInput
        placeholder="Taille (cm)"
        keyboardType="numeric"
        value={userData.taille}
        onChangeText={(text) => setUserData(prev => ({ ...prev, taille: text }))}
      />
      <TextInput
        placeholder="Poids (kg)"
        keyboardType="numeric"
        value={userData.poids}
        onChangeText={(text) => setUserData(prev => ({ ...prev, poids: text }))}
      />
      {/* ...rest of the component */}
    </View>
  );
};
