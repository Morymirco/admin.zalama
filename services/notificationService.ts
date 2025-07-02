import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Notification {
  id: string;
  user_id: string;
  titre: string;
  message: string;
  type: 'Information' | 'Alerte' | 'Succès' | 'Erreur';
  lu: boolean;
  date_creation: string;
  date_lecture?: string;
}

export interface NotificationStats {
  total: number;
  non_lues: number;
  par_type: Record<string, number>;
  recentes: number; // dernières 24h
}

class NotificationService {
  // Récupérer toutes les notifications d'un utilisateur
  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('date_creation', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  }

  // Récupérer les notifications non lues d'un utilisateur
  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('lu', false)
        .order('date_creation', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications non lues:', error);
      throw error;
    }
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('mark_notification_as_read', {
          p_notification_id: notificationId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      throw error;
    }
  }

  // Marquer toutes les notifications d'un utilisateur comme lues
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('mark_all_notifications_as_read', {
          p_user_id: userId
        });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      throw error;
    }
  }

  // Créer une notification manuellement
  async createNotification(
    userId: string,
    titre: string,
    message: string,
    type: Notification['type'] = 'Information'
  ): Promise<Notification> {
    try {
      const { data, error } = await supabase
        .rpc('create_notification', {
          p_user_id: userId,
          p_titre: titre,
          p_message: message,
          p_type: type
        });

      if (error) throw error;
      
      // Récupérer la notification créée
      const { data: notification, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError) throw fetchError;
      return notification;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  }

  // Récupérer les statistiques des notifications d'un utilisateur
  async getNotificationStats(userId: string): Promise<NotificationStats> {
    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const stats: NotificationStats = {
        total: notifications?.length || 0,
        non_lues: notifications?.filter(n => !n.lu).length || 0,
        par_type: {},
        recentes: notifications?.filter(n => new Date(n.date_creation) > yesterday).length || 0
      };

      // Compter par type
      notifications?.forEach(notification => {
        stats.par_type[notification.type] = (stats.par_type[notification.type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // Supprimer une notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      throw error;
    }
  }

  // Nettoyer les anciennes notifications (appelé périodiquement)
  async cleanupOldNotifications(): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('cleanup_old_notifications');

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Erreur lors du nettoyage des notifications:', error);
      throw error;
    }
  }

  // S'abonner aux changements de notifications en temps réel
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();
  }

  // Se désabonner des notifications
  unsubscribeFromNotifications(userId: string) {
    supabase.channel(`notifications:${userId}`).unsubscribe();
  }

  // Notifications spécialisées pour différents événements
  async notifySalaryAdvanceRequest(employeeId: string, amount: number): Promise<void> {
    try {
      // Récupérer les informations de l'employé
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('nom, prenom, partner_id')
        .eq('id', employeeId)
        .single();

      if (employeeError) throw employeeError;

      // Récupérer le nom du partenaire
      const { data: partner, error: partnerError } = await supabase
        .from('partners')
        .select('nom')
        .eq('id', employee.partner_id)
        .single();

      if (partnerError) throw partnerError;

      // Notifier tous les admins
      const { data: admins, error: adminsError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('active', true);

      if (adminsError) throw adminsError;

      // Créer les notifications pour chaque admin
      for (const admin of admins || []) {
        await this.createNotification(
          admin.id,
          'Nouvelle demande d\'avance de salaire',
          `L'employé ${employee.nom} ${employee.prenom} du partenaire ${partner.nom} a soumis une demande d'avance de ${amount.toLocaleString()} GNF.`,
          'Demande'
        );
      }
    } catch (error) {
      console.error('Erreur lors de la notification de demande d\'avance:', error);
      throw error;
    }
  }

  async notifyFinancialTransaction(amount: number, type: string): Promise<void> {
    try {
      // Notifier seulement pour les transactions importantes
      if (amount > 1000000) {
        const { data: admins, error } = await supabase
          .from('admin_users')
          .select('id')
          .eq('active', true);

        if (error) throw error;

        for (const admin of admins || []) {
          await this.createNotification(
            admin.id,
            'Nouvelle transaction importante',
            `Une transaction de ${amount.toLocaleString()} GNF a été enregistrée (Type: ${type}).`,
            'Transaction'
          );
        }
      }
    } catch (error) {
      console.error('Erreur lors de la notification de transaction:', error);
      throw error;
    }
  }

  async notifySecurityEvent(eventType: string, riskScore: number): Promise<void> {
    try {
      // Notifier seulement pour les événements à haut risque
      if (riskScore >= 7) {
        const { data: admins, error } = await supabase
          .from('admin_users')
          .select('id')
          .eq('active', true);

        if (error) throw error;

        for (const admin of admins || []) {
          await this.createNotification(
            admin.id,
            'Événement de sécurité à haut risque',
            `Un événement de sécurité de niveau ${riskScore} a été détecté (Type: ${eventType}).`,
            'Sécurité'
          );
        }
      }
    } catch (error) {
      console.error('Erreur lors de la notification d\'événement de sécurité:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService(); 