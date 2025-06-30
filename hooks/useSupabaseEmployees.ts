import { useState, useEffect, useCallback } from 'react';
import { Employee, Partner } from '@/types/employee';
import { partenaireService, employeService } from '@/services/partenaireService';

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
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
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

  // Calculer le nombre total de pages
  const totalPages = Math.ceil((filteredEmployees?.length || 0) / itemsPerPage);

  // Charger tous les employés
  const loadEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Charger tous les partenaires d'abord
      const partnersData = await partenaireService.getAll();
      setPartners(partnersData || []);
      
      // Charger tous les employés de tous les partenaires
      const allEmployees: Employee[] = [];
      for (const partner of partnersData || []) {
        try {
          const partnerEmployees = await employeService.getByPartnerId(partner.id);
          allEmployees.push(...partnerEmployees);
        } catch (err) {
          console.error(`Erreur lors du chargement des employés du partenaire ${partner.id}:`, err);
        }
      }
      
      setEmployees(allEmployees);
      setFilteredEmployees(allEmployees);
    } catch (err) {
      console.error('Erreur lors du chargement des employés:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des employés');
      setEmployees([]);
      setFilteredEmployees([]);
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
        const partnerName = partners.find(p => p.id === employee.partner_id)?.nom || 'Inconnu';
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

  // Filtrer les employés
  useEffect(() => {
    let filtered = [...employees];
    
    // Filtrage par terme de recherche
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(employee => 
        (employee.nom?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (employee.prenom?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (employee.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (employee.telephone?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (employee.poste?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (employee.role?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filtrage par partenaire
    if (partnerFilter !== 'tous') {
      filtered = filtered.filter(employee => employee.partner_id === partnerFilter);
    }
    
    setFilteredEmployees(filtered);
    setCurrentPage(1); // Réinitialiser à la première page après filtrage
  }, [searchTerm, partnerFilter, employees]);

  // Créer un employé
  const createEmployee = useCallback(async (employeeData: Partial<Employee>): Promise<Employee> => {
    try {
      const result = await employeService.create(employeeData as any);
      const newEmployee = result.employe;
      
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
      const updatedEmployee = await employeService.update(id, employeeData);
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
      await employeService.delete(id);
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
      const results = await employeService.search(query);
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