import { supabase } from '../integrations/supabase/client';
import { Symptom, SymptomInput } from '../types';

export const symptomsService = {
  // Récupérer tous les symptômes d'une utilisatrice
  async getSymptoms(userId: string): Promise<Symptom[]> {
    try {
      const { data, error } = await supabase
        .from('symptomes')
        .select('*')
        .eq('utilisatrice_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des symptômes:', error);
        throw error;
      }

      return (data || [])
        .filter((s): s is Symptom => !!s.utilisatrice_id && s.intensite != null && s.notes !== undefined)
        .map(s => ({
          ...s,
          utilisatrice_id: s.utilisatrice_id ?? '',
          intensite: s.intensite ?? 0,
          notes: s.notes ?? null,
        }));
    } catch (error) {
      console.error('Erreur lors de la récupération des symptômes:', error);
      return [];
    }
  },

  // Ajouter un nouveau symptôme
  async addSymptom(userId: string, symptom: SymptomInput): Promise<Symptom | null> {
    try {
      const { data, error } = await supabase
        .from('symptomes')
        .insert({
          utilisatrice_id: userId,
          date: symptom.date,
          type: symptom.type,
          intensite: symptom.intensite,
          notes: symptom.notes ?? null,
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'ajout du symptôme:', error);
        throw error;
      }

      return data && data.utilisatrice_id && data.intensite != null
        ? {
            ...data,
            utilisatrice_id: data.utilisatrice_id ?? '',
            intensite: data.intensite ?? 0,
            notes: data.notes ?? null,
          }
        : null;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du symptôme:', error);
      return null;
    }
  },

  // Mettre à jour un symptôme
  async updateSymptom(symptomId: string, updates: Partial<SymptomInput>): Promise<Symptom | null> {
    try {
      const { data, error } = await supabase
        .from('symptomes')
        .update({
          ...updates,
          notes: updates.notes ?? null,
        })
        .eq('id', symptomId)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du symptôme:', error);
        throw error;
      }

      return data && data.utilisatrice_id && data.intensite != null
        ? {
            ...data,
            utilisatrice_id: data.utilisatrice_id ?? '',
            intensite: data.intensite ?? 0,
            notes: data.notes ?? null,
          }
        : null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du symptôme:', error);
      return null;
    }
  },

  // Supprimer un symptôme
  async deleteSymptom(symptomId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('symptomes')
        .delete()
        .eq('id', symptomId);

      if (error) {
        console.error('Erreur lors de la suppression du symptôme:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du symptôme:', error);
      return false;
    }
  },

  // Récupérer les symptômes par date
  async getSymptomsByDate(userId: string, date: string): Promise<Symptom[]> {
    try {
      const { data, error } = await supabase
        .from('symptomes')
        .select('*')
        .eq('utilisatrice_id', userId)
        .eq('date', date);

      if (error) {
        console.error('Erreur lors de la récupération des symptômes par date:', error);
        throw error;
      }

      return (data || [])
        .filter((s): s is Symptom => !!s.utilisatrice_id && s.intensite != null && s.notes !== undefined)
        .map(s => ({
          ...s,
          utilisatrice_id: s.utilisatrice_id ?? '',
          intensite: s.intensite ?? 0,
          notes: s.notes ?? null,
        }));
    } catch (error) {
      console.error('Erreur lors de la récupération des symptômes par date:', error);
      return [];
    }
  },

  // Récupérer les statistiques des symptômes
  async getSymptomStats(userId: string, startDate: string, endDate: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('symptomes')
        .select('*')
        .eq('utilisatrice_id', userId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        throw error;
      }

      // Analyser les données pour créer des statistiques
      const stats = {
        totalSymptoms: data?.length || 0,
        byType: {} as Record<string, number>,
        byIntensity: {
          low: 0,
          medium: 0,
          high: 0,
        },
        mostCommon: '',
      };

      if (data) {
        data.forEach(symptom => {
          // Compter par type
          stats.byType[symptom.type] = (stats.byType[symptom.type] || 0) + 1;

          // Compter par intensité
          if (symptom.intensite != null) {
            if (symptom.intensite <= 3) stats.byIntensity.low++;
            else if (symptom.intensite <= 7) stats.byIntensity.medium++;
            else stats.byIntensity.high++;
          }
        });

        // Trouver le symptôme le plus commun
        const types = Object.entries(stats.byType);
        if (types.length > 0) {
          stats.mostCommon = types.reduce((a, b) => a[1] > b[1] ? a : b)[0];
        }
      }

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        totalSymptoms: 0,
        byType: {},
        byIntensity: { low: 0, medium: 0, high: 0 },
        mostCommon: '',
      };
    }
  },
}; 