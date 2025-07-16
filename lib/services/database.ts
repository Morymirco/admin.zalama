import { createClient } from '@supabase/supabase-js';

// Configuration Supabase - Utiliser les mêmes clés que les autres services qui fonctionnent
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types définis localement
interface User {
  id: string;
  email: string;
  nom?: string;
  prenom?: string;
  role: string;
  created_at: string;
  updated_at?: string;
}

interface Partner {
  id: string;
  nom: string;
  type: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  nombre_employes?: number;
  created_at: string;
  updated_at?: string;
}

interface Employee {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  poste?: string;
  role?: string;
  partner_id?: string;
  actif: boolean;
  created_at: string;
  updated_at?: string;
}

interface Service {
  id: string;
  nom: string;
  description?: string;
  prix?: number;
  duree?: number;
  actif: boolean;
  created_at: string;
  updated_at?: string;
}

interface Alert {
  id: string;
  titre: string;
  message: string;
  type: string;
  priorite: string;
  statut: string;
  created_at: string;
  updated_at?: string;
}

interface FinancialTransaction {
  id: string;
  montant: number;
  type: string;
  description?: string;
  statut: string;
  created_at: string;
  updated_at?: string;
}

interface PerformanceMetric {
  id: string;
  nom: string;
  valeur: number;
  unite?: string;
  date_mesure: string;
  created_at: string;
  updated_at?: string;
}

interface Notification {
  id: string;
  user_id: string;
  titre: string;
  message: string;
  lu: boolean;
  created_at: string;
  updated_at?: string;
}

// =====================================================
// SERVICE UTILISATEURS
// =====================================================

export const userService = {
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createUser(userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// =====================================================
// SERVICE PARTENAIRES
// =====================================================

export const partnerService = {
  async getAllPartners(): Promise<Partner[]> {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPartnerById(id: string): Promise<Partner | null> {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createPartner(partnerData: Partial<Partner>): Promise<Partner> {
    const { data, error } = await supabase
      .from('partners')
      .insert([partnerData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePartner(id: string, partnerData: Partial<Partner>): Promise<Partner> {
    const { data, error } = await supabase
      .from('partners')
      .update(partnerData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePartner(id: string): Promise<void> {
    const { error } = await supabase
      .from('partners')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getPartnersByType(type: string): Promise<Partner[]> {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// =====================================================
// SERVICE EMPLOYÉS
// =====================================================

export const employeeService = {
  async getAllEmployees(): Promise<(Employee & { partners: Partner })[]> {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        partners (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getEmployeesByPartner(partnerId: string): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createEmployee(employeeData: Partial<Employee>): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .insert([employeeData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateEmployee(id: string, employeeData: Partial<Employee>): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .update(employeeData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteEmployee(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// =====================================================
// SERVICE SERVICES
// =====================================================

export const serviceService = {
  async getAllServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createService(serviceData: Partial<Service>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .insert([serviceData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateService(id: string, serviceData: Partial<Service>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .update(serviceData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteService(id: string): Promise<void> {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// =====================================================
// SERVICE ALERTES
// =====================================================

export const alertService = {
  async getAllAlerts(): Promise<Alert[]> {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createAlert(alertData: Partial<Alert>): Promise<Alert> {
    const { data, error } = await supabase
      .from('alerts')
      .insert([alertData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAlert(id: string, alertData: Partial<Alert>): Promise<Alert> {
    const { data, error } = await supabase
      .from('alerts')
      .update(alertData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAlert(id: string): Promise<void> {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// =====================================================
// SERVICE FINANCIER
// =====================================================

export const financialService = {
  async getAllTransactions(): Promise<FinancialTransaction[]> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .order('date_transaction', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTransaction(transactionData: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .insert([transactionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPerformanceMetrics(): Promise<PerformanceMetric[]> {
    const { data, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .order('date_mesure', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// =====================================================
// SERVICE PERFORMANCE
// =====================================================

export const performanceService = {
  async getAllMetrics(): Promise<PerformanceMetric[]> {
    const { data, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .order('date_mesure', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createMetric(metricData: Partial<PerformanceMetric>): Promise<PerformanceMetric> {
    const { data, error } = await supabase
      .from('performance_metrics')
      .insert([metricData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// =====================================================
// SERVICE NOTIFICATIONS
// =====================================================

export const notificationService = {
  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('date_creation', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ lu: true, date_lecture: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  async createNotification(notificationData: Partial<Notification>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}; 