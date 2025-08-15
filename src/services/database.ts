import { supabase } from './supabase';

export const userMeasuresService = {
  async saveUserMeasures(userId: string, measures: { weight: number, height: number }) {
    return await supabase
      .from('user_measures')
      .upsert({
        user_id: userId,
        ...measures,
        updated_at: new Date().toISOString(),
      });
  },

  async getUserMeasures(userId: string) {
    return await supabase
      .from('user_measures')
      .select('*')
      .eq('user_id', userId)
      .single();
  }
};
