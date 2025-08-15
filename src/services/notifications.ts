import { supabase } from '../integrations/supabase/client';

export interface Notification {
  id: string;
  utilisatrice_id: string | null;
  type: string;
  programme_le: string;
  active: boolean | null;
}

export interface NotificationInput {
  type: string;
  programme_le: string;
  active?: boolean;
}

export const notificationsService = {
  // Récupérer toutes les notifications d'une utilisatrice
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('utilisatrice_id', userId)
        .order('programme_le', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des notifications:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return [];
    }
  },

  // Ajouter une nouvelle notification
  async addNotification(userId: string, notification: NotificationInput): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          utilisatrice_id: userId,
          type: notification.type,
          programme_le: notification.programme_le,
          active: notification.active ?? true,
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'ajout de la notification:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la notification:', error);
      return null;
    }
  },

  // Mettre à jour une notification
  async updateNotification(notificationId: string, updates: Partial<NotificationInput>): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update(updates)
        .eq('id', notificationId)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour de la notification:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la notification:', error);
      return null;
    }
  },

  // Supprimer une notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Erreur lors de la suppression de la notification:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      return false;
    }
  },

  // Programmer une notification de règles
  async schedulePeriodNotification(userId: string, date: string): Promise<Notification | null> {
    const notificationDate = new Date(date);
    notificationDate.setDate(notificationDate.getDate() - 1); // 1 jour avant

    return this.addNotification(userId, {
      type: 'period_reminder',
      programme_le: notificationDate.toISOString(),
    });
  },

  // Programmer une notification d'ovulation
  async scheduleOvulationNotification(userId: string, date: string): Promise<Notification | null> {
    const notificationDate = new Date(date);
    notificationDate.setDate(notificationDate.getDate() - 2); // 2 jours avant

    return this.addNotification(userId, {
      type: 'ovulation_reminder',
      programme_le: notificationDate.toISOString(),
    });
  },

  // Programmer une notification de symptômes
  async scheduleSymptomReminder(userId: string): Promise<Notification | null> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(20, 0, 0, 0); // 20h00

    return this.addNotification(userId, {
      type: 'symptom_reminder',
      programme_le: tomorrow.toISOString(),
    });
  },

  // Désactiver toutes les notifications d'une utilisatrice
  async disableAllNotifications(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ active: false })
        .eq('utilisatrice_id', userId);

      if (error) {
        console.error('Erreur lors de la désactivation des notifications:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la désactivation des notifications:', error);
      return false;
    }
  },
}; 