import { supabase } from './supabase';

export const userProfileService = {
  async updateProfile(userId: string, data: {
    nom?: string;
    prenom?: string;
    taille?: number;
    poids?: number;
  }) {
    return await supabase
      .from('utilisatrices')
      .update(data)
      .eq('id', userId)
      .single();
  },

  async getProfile(userId: string) {
    return await supabase
      .from('utilisatrices')
      .select('*')
      .eq('id', userId)
      .single();
  }
};
