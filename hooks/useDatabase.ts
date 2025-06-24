"use client";

import { useState, useEffect } from 'react';
import { userService, partnerService, employeeService, serviceService, alertService, financialService, performanceService, notificationService } from '@/lib/services/database';
import type { User, Partner, Employee, Service, Alert, FinancialTransaction, PerformanceMetric, Notification } from '@/lib/supabase';

// =====================================================
// HOOKS UTILISATEURS
// =====================================================

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: Partial<User>) => {
    try {
      const newUser = await userService.createUser(userData);
      setUsers(prev => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'utilisateur');
      throw err;
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      const updatedUser = await userService.updateUser(id, userData);
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'utilisateur');
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await userService.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'utilisateur');
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
};

// =====================================================
// HOOKS PARTENAIRES
// =====================================================

export const usePartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await partnerService.getAllPartners();
      setPartners(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des partenaires');
    } finally {
      setLoading(false);
    }
  };

  const createPartner = async (partnerData: Partial<Partner>) => {
    try {
      const newPartner = await partnerService.createPartner(partnerData);
      setPartners(prev => [newPartner, ...prev]);
      return newPartner;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du partenaire');
      throw err;
    }
  };

  const updatePartner = async (id: string, partnerData: Partial<Partner>) => {
    try {
      const updatedPartner = await partnerService.updatePartner(id, partnerData);
      setPartners(prev => prev.map(partner => partner.id === id ? updatedPartner : partner));
      return updatedPartner;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du partenaire');
      throw err;
    }
  };

  const deletePartner = async (id: string) => {
    try {
      await partnerService.deletePartner(id);
      setPartners(prev => prev.filter(partner => partner.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du partenaire');
      throw err;
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  return {
    partners,
    loading,
    error,
    fetchPartners,
    createPartner,
    updatePartner,
    deletePartner
  };
};

// =====================================================
// HOOKS EMPLOYÉS
// =====================================================

export const useEmployees = () => {
  const [employees, setEmployees] = useState<(Employee & { partners: Partner })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des employés');
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employeeData: Partial<Employee>) => {
    try {
      const newEmployee = await employeeService.createEmployee(employeeData);
      // Recharger la liste pour avoir les données du partenaire
      await fetchEmployees();
      return newEmployee;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'employé');
      throw err;
    }
  };

  const updateEmployee = async (id: string, employeeData: Partial<Employee>) => {
    try {
      const updatedEmployee = await employeeService.updateEmployee(id, employeeData);
      setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updatedEmployee } : emp));
      return updatedEmployee;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'employé');
      throw err;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await employeeService.deleteEmployee(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'employé');
      throw err;
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
  };
};

// =====================================================
// HOOKS SERVICES
// =====================================================

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await serviceService.getAllServices();
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: Partial<Service>) => {
    try {
      const newService = await serviceService.createService(serviceData);
      setServices(prev => [newService, ...prev]);
      return newService;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du service');
      throw err;
    }
  };

  const updateService = async (id: string, serviceData: Partial<Service>) => {
    try {
      const updatedService = await serviceService.updateService(id, serviceData);
      setServices(prev => prev.map(service => service.id === id ? updatedService : service));
      return updatedService;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du service');
      throw err;
    }
  };

  const deleteService = async (id: string) => {
    try {
      await serviceService.deleteService(id);
      setServices(prev => prev.filter(service => service.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du service');
      throw err;
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService
  };
};

// =====================================================
// HOOKS ALERTES
// =====================================================

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<(Alert & { users: User })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await alertService.getAllAlerts();
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des alertes');
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (alertData: Partial<Alert>) => {
    try {
      const newAlert = await alertService.createAlert(alertData);
      // Recharger la liste pour avoir les données de l'utilisateur assigné
      await fetchAlerts();
      return newAlert;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'alerte');
      throw err;
    }
  };

  const updateAlert = async (id: string, alertData: Partial<Alert>) => {
    try {
      const updatedAlert = await alertService.updateAlert(id, alertData);
      setAlerts(prev => prev.map(alert => alert.id === id ? { ...alert, ...updatedAlert } : alert));
      return updatedAlert;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'alerte');
      throw err;
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      await alertService.deleteAlert(id);
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'alerte');
      throw err;
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return {
    alerts,
    loading,
    error,
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert
  };
};

// =====================================================
// HOOKS FINANCIERS
// =====================================================

export const useFinancialData = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financialService.getAllTransactions();
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformance = async () => {
    try {
      const data = await financialService.getFinancialPerformance();
      setPerformance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des performances');
    }
  };

  const createTransaction = async (transactionData: Partial<FinancialTransaction>) => {
    try {
      const newTransaction = await financialService.createTransaction(transactionData);
      setTransactions(prev => [newTransaction, ...prev]);
      // Recharger les performances
      await fetchPerformance();
      return newTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la transaction');
      throw err;
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchPerformance();
  }, []);

  return {
    transactions,
    performance,
    loading,
    error,
    fetchTransactions,
    fetchPerformance,
    createTransaction
  };
};

// =====================================================
// HOOKS MÉTRIQUES DE PERFORMANCE
// =====================================================

export const usePerformanceMetrics = (categorie?: string, periode?: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await performanceService.getPerformanceMetrics(categorie, periode);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des métriques');
    } finally {
      setLoading(false);
    }
  };

  const createMetric = async (metricData: Partial<PerformanceMetric>) => {
    try {
      const newMetric = await performanceService.createMetric(metricData);
      setMetrics(prev => [newMetric, ...prev]);
      return newMetric;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la métrique');
      throw err;
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [categorie, periode]);

  return {
    metrics,
    loading,
    error,
    fetchMetrics,
    createMetric
  };
};

// =====================================================
// HOOKS NOTIFICATIONS
// =====================================================

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getUserNotifications(userId);
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const updatedNotification = await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(notif => notif.id === id ? updatedNotification : notif));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du marquage comme lu');
      throw err;
    }
  };

  const createNotification = async (notificationData: Partial<Notification>) => {
    try {
      const newNotification = await notificationService.createNotification(notificationData);
      setNotifications(prev => [newNotification, ...prev]);
      return newNotification;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la notification');
      throw err;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    createNotification
  };
}; 