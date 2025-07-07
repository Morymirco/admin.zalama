import { useState, useEffect, useCallback, useMemo } from 'react';
import { Employee, Partner } from '@/types/employee';
import { partenaireService } from '@/services/partenaireService';
import employeeService from '@/services/employeeService';

interface UseSupabaseEmployeesReturn {
  employees: Employee[];
  filteredEmployees: Employee[];
  partners: Partner[];
  isLoading: boolean;
  error: string | null;
  stats: {
    total: number;
    actifs: number;
    inactifs: number;
    parPartenaire: Record<string, number>;
    parPoste: Record<string, number>;
  } | null;
  statsLoading: boolean;
  searchTerm: string;
  partnerFilter: string;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  // Actions
  setSearchTerm: (term: string) => void;
  setPartnerFilter: (partnerId: string) => void;
  setCurrentPage: (page: number) => void;
  refreshEmployees: () => Promise<void>;
  createEmployee: (employeeData: Partial<Employee>) => Promise<Employee>;
  updateEmployee: (id: string, employeeData: Partial<Employee>) => Promise<Employee>;
  deleteEmployee: (id: string) => Promise<void>;
  searchEmployees: (query: string) => Promise<Employee[]>;
}

export const useSupabaseEmployees = (itemsPerPage: number = 10): UseSupabaseEmployeesReturn => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    actifs: number;
    inactifs: number;
    parPartenaire: Record<string, number>;
    parPoste: Record<string, number>;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('tous');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrer les employés avec optimisation (déplacer avant totalPages)
  const filteredEmployees = useMemo(() => {
    let filtered = [...employees];
    
    // Filtrage par terme de recherche
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(employee => 
        (employee.nom?.toLowerCase().includes(searchLower)) ||
        (employee.prenom?.toLowerCase().includes(searchLower)) ||
        (employee.email?.toLowerCase().includes(searchLower)) ||
        (employee.telephone?.toLowerCase().includes(searchLower)) ||
        (employee.poste?.toLowerCase().includes(searchLower)) ||
        (employee.role?.toLowerCase().includes(searchLower))
      );
    }
    
    // Filtrage par partenaire
    if (partnerFilter !== 'tous') {
      filtered = filtered.filter(employee => employee.partner_id === partnerFilter);
    }
    
    return filtered;
  }, [searchTerm, partnerFilter, employees]);

  // Calculer le nombre total de pages avec optimisation
  const totalPages = useMemo(() => 
    Math.ceil((filteredEmployees?.length || 0) / itemsPerPage), 
    [filteredEmployees, itemsPerPage]
  );

  // Charger tous les employés avec priorisation
  const loadEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Charger tous les partenaires d'abord (priorité haute)
      const partnersData = await partenaireService.getAll();
      setPartners(partnersData || []);
      
      // Charger tous les employés en une seule requête
      const allEmployees = await employeeService.getAll();
      setEmployees(allEmployees);
    } catch (err) {
      console.error('Erreur lors du chargement des employés:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des employés');
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les statistiques
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      
      const total = employees.length;
      const actifs = employees.filter(emp => emp.actif).length;
      const inactifs = total - actifs;
      
      // Statistiques par partenaire
      const parPartenaire: Record<string, number> = {};
      for (const employee of employees) {
        const partner = partners.find(p => p.id === employee.partner_id);
        const partnerName = partner?.nom || 'Inconnu';
        parPartenaire[partnerName] = (parPartenaire[partnerName] || 0) + 1;
      }
      
      // Statistiques par poste
      const parPoste: Record<string, number> = {};
      for (const employee of employees) {
        const poste = employee.poste || 'Non défini';
        parPoste[poste] = (parPoste[poste] || 0) + 1;
      }
      
      setStats({
        total,
        actifs,
        inactifs,
        parPartenaire,
        parPoste
      });
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [employees, partners]);

  // Charger les données au montage
  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Charger les statistiques quand les employés changent
  useEffect(() => {
    if (employees.length > 0) {
      loadStats();
    }
  }, [employees, loadStats]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, partnerFilter]);

  // Créer un employé
  const createEmployee = useCallback(async (employeeData: Partial<Employee>): Promise<Employee> => {
    try {
      const result = await employeeService.create(employeeData as any);
      const newEmployee = result.employee;
      
      setEmployees(prev => [...prev, newEmployee]);
      await loadStats(); // Recharger les statistiques
      return newEmployee;
    } catch (err) {
      console.error('Erreur lors de la création de l\'employé:', err);
      throw err;
    }
  }, [loadStats]);

  // Mettre à jour un employé
  const updateEmployee = useCallback(async (id: string, employeeData: Partial<Employee>): Promise<Employee> => {
    try {
      const updatedEmployee = await employeeService.update(id, employeeData);
      setEmployees(prev => prev.map(employee => employee.id === id ? updatedEmployee : employee));
      await loadStats(); // Recharger les statistiques
      return updatedEmployee;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'employé:', err);
      throw err;
    }
  }, [loadStats]);

  // Supprimer un employé
  const deleteEmployee = useCallback(async (id: string): Promise<void> => {
    try {
      await employeeService.delete(id);
      setEmployees(prev => prev.filter(employee => employee.id !== id));
      await loadStats(); // Recharger les statistiques
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'employé:', err);
      throw err;
    }
  }, [loadStats]);

  // Rechercher des employés
  const searchEmployees = useCallback(async (query: string): Promise<Employee[]> => {
    try {
      const results = await employeeService.search(query);
      return results;
    } catch (err) {
      console.error('Erreur lors de la recherche d\'employés:', err);
      return [];
    }
  }, []);

  // Rafraîchir les employés
  const refreshEmployees = useCallback(async () => {
    await loadEmployees();
  }, [loadEmployees]);

  return {
    employees,
    filteredEmployees,
    partners,
    isLoading,
    error,
    stats,
    statsLoading,
    searchTerm,
    partnerFilter,
    currentPage,
    totalPages,
    itemsPerPage,
    setSearchTerm,
    setPartnerFilter,
    setCurrentPage,
    refreshEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    searchEmployees
  };
}; 