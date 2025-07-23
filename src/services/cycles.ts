import { supabase } from '../integrations/supabase/client';

export interface Cycle {
  id: string;
  utilisatrice_id: string;
  debut: string;
  fin?: string | null;
  duree?: number | null;
  date_ovulation?: string | null;
  notes?: string | null;
}

export interface CycleInput {
  debut: string;
  fin?: string | null;
  duree?: number | null;
  date_ovulation?: string | null;
  notes?: string | null;
}

export const cyclesService = {
  // Récupérer tous les cycles d'une utilisatrice
  async getCycles(userId: string): Promise<Cycle[]> {
    try {
      const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .eq('utilisatrice_id', userId)
        .order('debut', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des cycles:', error);
        throw error;
      }

      return (data || [])
        .filter(c => !!c.utilisatrice_id)
        .map(c => ({
          ...c,
          utilisatrice_id: c.utilisatrice_id ?? '',
          fin: c.fin ?? null,
          duree: c.duree ?? null,
          date_ovulation: typeof c.date_ovulation === 'undefined' ? null : c.date_ovulation,
          notes: typeof c.notes === 'undefined' ? null : c.notes,
        }));
    } catch (error) {
      console.error('Erreur lors de la récupération des cycles:', error);
      return [];
    }
  },

  // Ajouter un nouveau cycle
  async addCycle(userId: string, cycle: CycleInput): Promise<Cycle | null> {
    try {
      const { data, error } = await supabase
        .from('cycles')
        .insert({
          utilisatrice_id: userId,
          debut: cycle.debut,
          fin: cycle.fin ?? null,
          duree: cycle.duree ?? null,
          date_ovulation: cycle.date_ovulation ?? null,
          notes: cycle.notes ?? null,
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'ajout du cycle:', error);
        throw error;
      }

      return data && data.utilisatrice_id
        ? {
            ...data,
            utilisatrice_id: data.utilisatrice_id ?? '',
            fin: data.fin ?? null,
            duree: data.duree ?? null,
            date_ovulation: data.date_ovulation ?? null,
            notes: data.notes ?? null,
          }
        : null;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du cycle:', error);
      return null;
    }
  },

  // Mettre à jour un cycle
  async updateCycle(cycleId: string, updates: Partial<CycleInput>): Promise<Cycle | null> {
    try {
      const { data, error } = await supabase
        .from('cycles')
        .update({
          ...updates,
          fin: updates.fin ?? null,
          duree: updates.duree ?? null,
          date_ovulation: updates.date_ovulation ?? null,
          notes: updates.notes ?? null,
        })
        .eq('id', cycleId)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du cycle:', error);
        throw error;
      }

      return data && data.utilisatrice_id
        ? {
            ...data,
            utilisatrice_id: data.utilisatrice_id ?? '',
            fin: data.fin ?? null,
            duree: data.duree ?? null,
            date_ovulation: data.date_ovulation ?? null,
            notes: data.notes ?? null,
          }
        : null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du cycle:', error);
      return null;
    }
  },

  // Supprimer un cycle
  async deleteCycle(cycleId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cycles')
        .delete()
        .eq('id', cycleId);

      if (error) {
        console.error('Erreur lors de la suppression du cycle:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du cycle:', error);
      return false;
    }
  },

  // Récupérer le cycle actuel
  async getCurrentCycle(userId: string): Promise<Cycle | null> {
    try {
      const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .eq('utilisatrice_id', userId)
        .is('fin', null)
        .order('debut', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur lors de la récupération du cycle actuel:', error);
        throw error;
      }

      return data && data.utilisatrice_id
        ? {
            ...data,
            utilisatrice_id: data.utilisatrice_id ?? '',
            fin: data.fin ?? null,
            duree: data.duree ?? null,
            date_ovulation: data.date_ovulation ?? null,
            notes: data.notes ?? null,
          }
        : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du cycle actuel:', error);
      return null;
    }
  },

  // Calculer les prédictions
  async getPredictions(userId: string): Promise<any> {
    try {
      const cycles = await this.getCycles(userId);
      
      if (cycles.length === 0) {
        return {
          nextPeriod: null,
          nextOvulation: null,
          averageCycleLength: 28,
          averagePeriodLength: 5,
          currentDay: 0,
          fertilityLevel: 'Faible',
        };
      }

      // Calculer la durée moyenne du cycle
      const completedCycles = cycles.filter(c => c.fin && c.duree);
      const averageCycleLength = completedCycles.length > 0 
        ? completedCycles.reduce((sum, c) => sum + (c.duree || 0), 0) / completedCycles.length
        : 28;

      // Trouver le dernier cycle
      const lastCycle = cycles[0];
      const lastPeriodStart = new Date(lastCycle.debut);
      const today = new Date();
      // Calcul du jour du cycle
      const currentDay = Math.max(1, Math.min(Math.ceil((today.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1, Math.round(averageCycleLength)));
      
      // Prédire la prochaine période
      const nextPeriodStart = new Date(lastPeriodStart);
      nextPeriodStart.setDate(nextPeriodStart.getDate() + averageCycleLength);

      // Prédire l'ovulation (14 jours avant la prochaine période)
      const nextOvulation = new Date(nextPeriodStart);
      nextOvulation.setDate(nextOvulation.getDate() - 14);

      // Déterminer la fertilité
      let fertilityLevel: 'Faible' | 'Moyenne' | 'Élevée' = 'Faible';
      // Fenêtre fertile = ovulation +/- 2 jours
      const ovulationDay = Math.round(averageCycleLength) - 14;
      if (currentDay >= ovulationDay - 2 && currentDay <= ovulationDay + 2) {
        fertilityLevel = currentDay === ovulationDay ? 'Élevée' : 'Moyenne';
      }

      return {
        nextPeriod: nextPeriodStart.toISOString().split('T')[0],
        nextOvulation: nextOvulation.toISOString().split('T')[0],
        averageCycleLength: Math.round(averageCycleLength),
        averagePeriodLength: 5, // Valeur par défaut
        currentDay,
        fertilityLevel,
      };
    } catch (error) {
      console.error('Erreur lors du calcul des prédictions:', error);
      return {
        nextPeriod: null,
        nextOvulation: null,
        averageCycleLength: 28,
        averagePeriodLength: 5,
        currentDay: 0,
        fertilityLevel: 'Faible',
      };
    }
  },
}; 