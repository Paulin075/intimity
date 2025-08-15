import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { supabase } from '../services/supabase';
import { userProfileService } from '../services/userProfile';

export const DashboardScreen = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { user } = await supabase.auth.getUser();
    const { data } = await userProfileService.getProfile(user.id);
    if (data) {
      setProfile(data);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        Bonjour {profile?.prenom || ''}
      </Text>
      {/* ...rest of the dashboard */}
    </View>
  );
};
    <View style={styles.container}>
      <Text style={styles.greeting}>
        Bonjour {firstName ? firstName : ''}
      </Text>
      {/* ...existing dashboard content... */}
    </View>
  );
};
