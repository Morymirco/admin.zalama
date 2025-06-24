import { supabase } from '@/lib/supabase';
import type { User, Partner, Employee, Service, Alert, FinancialTransaction, PerformanceMetric, Notification } from '@/lib/supabase';

// =====================================================
// SERVICES UTILISATEURS
// =====================================================

export const userService = {
  // Récupérer tous les utilisateurs
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as User[];
  },

  // Récupérer un utilisateur par ID
  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as User;
  },

  // Créer un utilisateur
  async createUser(userData: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  },

  // Mettre à jour un utilisateur
  async updateUser(id: string, userData: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  },

  // Supprimer un utilisateur
  async deleteUser(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Récupérer les statistiques des utilisateurs
  async getUserStatistics() {
    const { data, error } = await supabase
      .rpc('get_dashboard_stats');
    
    if (error) throw error;
    return data;
  }
};

// =====================================================
// SERVICES PARTENAIRES
// =====================================================

export const partnerService = {
  // Récupérer tous les partenaires
  async getAllPartners() {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Partner[];
  },

  // Récupérer un partenaire par ID
  async getPartnerById(id: string) {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Partner;
  },

  // Créer un partenaire
  async createPartner(partnerData: Partial<Partner>) {
    const { data, error } = await supabase
      .from('partners')
      .insert([partnerData])
      .select()
      .single();
    
    if (error) throw error;
    return data as Partner;
  },

  // Mettre à jour un partenaire
  async updatePartner(id: string, partnerData: Partial<Partner>) {
    const { data, error } = await supabase
      .from('partners')
      .update(partnerData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Partner;
  },

  // Supprimer un partenaire
  async deletePartner(id: string) {
    const { error } = await supabase
      .from('partners')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Récupérer les employés d'un partenaire
  async getPartnerEmployees(partnerId: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Employee[];
  }
};

// =====================================================
// SERVICES EMPLOYÉS
// =====================================================

export const employeeService = {
  // Récupérer tous les employés
  async getAllEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        partners (
          id,
          nom,
          type
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as (Employee & { partners: Partner })[];
  },

  // Créer un employé
  async createEmployee(employeeData: Partial<Employee>) {
    const { data, error } = await supabase
      .from('employees')
      .insert([employeeData])
      .select()
      .single();
    
    if (error) throw error;
    return data as Employee;
  },

  // Mettre à jour un employé
  async updateEmployee(id: string, employeeData: Partial<Employee>) {
    const { data, error } = await supabase
      .from('employees')
      .update(employeeData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Employee;
  },

  // Supprimer un employé
  async deleteEmployee(id: string) {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// =====================================================
// SERVICES SERVICES
// =====================================================

export const serviceService = {
  // Récupérer tous les services
  async getAllServices() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Service[];
  },

  // Créer un service
  async createService(serviceData: Partial<Service>) {
    const { data, error } = await supabase
      .from('services')
      .insert([serviceData])
      .select()
      .single();
    
    if (error) throw error;
    return data as Service;
  },

  // Mettre à jour un service
  async updateService(id: string, serviceData: Partial<Service>) {
    const { data, error } = await supabase
      .from('services')
      .update(serviceData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Service;
  },

  // Supprimer un service
  async deleteService(id: string) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// =====================================================
// SERVICES ALERTES
// =====================================================

export const alertService = {
  // Récupérer toutes les alertes
  async getAllAlerts() {
    const { data, error } = await supabase
      .from('alerts')
      .select(`
        *,
        users (
          id,
          nom,
          prenom
        )
      `)
      .order('date_creation', { ascending: false });
    
    if (error) throw error;
    return data as (Alert & { users: User })[];
  },

  // Récupérer les alertes actives
  async getActiveAlerts() {
    const { data, error } = await supabase
      .from('active_alerts')
      .select('*')
      .order('date_creation', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Créer une alerte
  async createAlert(alertData: Partial<Alert>) {
    const { data, error } = await supabase
      .from('alerts')
      .insert([alertData])
      .select()
      .single();
    
    if (error) throw error;
    return data as Alert;
  },

  // Mettre à jour une alerte
  async updateAlert(id: string, alertData: Partial<Alert>) {
    const { data, error } = await supabase
      .from('alerts')
      .update(alertData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Alert;
  },

  // Supprimer une alerte
  async deleteAlert(id: string) {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// =====================================================
// SERVICES TRANSACTIONS FINANCIÈRES
// =====================================================

export const financialService = {
  // Récupérer toutes les transactions
  async getAllTransactions() {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select(`
        *,
        partners (
          id,
          nom
        ),
        users (
          id,
          nom,
          prenom
        ),
        services (
          id,
          nom
        )
      `)
      .order('date_transaction', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Récupérer les performances financières
  async getFinancialPerformance() {
    const { data, error } = await supabase
      .from('financial_performance')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  // Créer une transaction
  async createTransaction(transactionData: Partial<FinancialTransaction>) {
    const { data, error } = await supabase
      .from('financial_transactions')
      .insert([transactionData])
      .select()
      .single();
    
    if (error) throw error;
    return data as FinancialTransaction;
  }
};

// =====================================================
// SERVICES MÉTRIQUES DE PERFORMANCE
// =====================================================

export const performanceService = {
  // Récupérer les métriques de performance
  async getPerformanceMetrics(categorie?: string, periode?: string) {
    let query = supabase
      .from('performance_metrics')
      .select('*')
      .order('date_mesure', { ascending: false });

    if (categorie) {
      query = query.eq('categorie', categorie);
    }

    if (periode) {
      query = query.eq('periode', periode);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data as PerformanceMetric[];
  },

  // Créer une métrique
  async createMetric(metricData: Partial<PerformanceMetric>) {
    const { data, error } = await supabase
      .from('performance_metrics')
      .insert([metricData])
      .select()
      .single();
    
    if (error) throw error;
    return data as PerformanceMetric;
  }
};

// =====================================================
// SERVICES NOTIFICATIONS
// =====================================================

export const notificationService = {
  // Récupérer les notifications d'un utilisateur
  async getUserNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('date_creation', { ascending: false });
    
    if (error) throw error;
    return data as Notification[];
  },

  // Marquer une notification comme lue
  async markAsRead(id: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ lu: true, date_lecture: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Notification;
  },

  // Créer une notification
  async createNotification(notificationData: Partial<Notification>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();
    
    if (error) throw error;
    return data as Notification;
  }
};
