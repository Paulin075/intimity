import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const pushNotificationsService = {
  // Demander les permissions
  async requestPermissions() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Permissions de notifications non accordées');
        return false;
      }
      
      return true;
    } else {
      console.log('Notifications non supportées sur l\'émulateur');
      return false;
    }
  },

  // Obtenir le token de notification
  async getExpoPushToken() {
    if (Device.isDevice) {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissions de notifications non accordées');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Remplacer par ton project ID
      });
      
      return token.data;
    }
    
    return null;
  },

  // Programmer une notification locale
  async scheduleLocalNotification(title: string, body: string, trigger: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });
  },

  // Programmer un rappel de règles
  async schedulePeriodReminder(date: Date) {
    const trigger = new Date(date);
    trigger.setDate(trigger.getDate() - 1); // 1 jour avant
    
    await this.scheduleLocalNotification(
      'Rappel de règles',
      'Vos règles devraient commencer demain. Préparez-vous !',
      trigger
    );
  },

  // Programmer un rappel d'ovulation
  async scheduleOvulationReminder(date: Date) {
    const trigger = new Date(date);
    trigger.setDate(trigger.getDate() - 2); // 2 jours avant
    
    await this.scheduleLocalNotification(
      'Période d\'ovulation',
      'Vous approchez de votre période d\'ovulation. Période fertile !',
      trigger
    );
  },

  // Programmer un rappel de symptômes
  async scheduleSymptomReminder() {
    const trigger = new Date();
    trigger.setDate(trigger.getDate() + 1);
    trigger.setHours(20, 0, 0, 0); // 20h00
    
    await this.scheduleLocalNotification(
      'Rappel journal',
      'N\'oubliez pas de noter vos symptômes aujourd\'hui !',
      trigger
    );
  },

  // Annuler toutes les notifications
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  // Configurer les listeners de notifications
  setupNotificationListeners() {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification reçue:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Réponse à la notification:', response);
      // Navigation vers l'écran approprié selon le type de notification
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  },
}; 