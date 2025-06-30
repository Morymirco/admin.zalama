import { createClient } from '@supabase/supabase-js';
import { generatePassword, validateEmail } from '@/lib/utils';
import smsService from './smsService';
import emailService from './emailService';
import { Employe } from '@/types/partenaire';
import { Employee } from '@/types/employee';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Fonction utilitaire pour convertir les données de la DB vers l'interface
const convertFromDB = (dbEmployee: any): Employee => {
  return {
    id: dbEmployee.id,
    partner_id: dbEmployee.partner_id,
    nom: dbEmployee.nom,
    prenom: dbEmployee.prenom,
    genre: dbEmployee.genre,
    email: dbEmployee.email,
    telephone: dbEmployee.telephone,
    adresse: dbEmployee.adresse,
    poste: dbEmployee.poste,
    role: dbEmployee.role,
    type_contrat: dbEmployee.type_contrat,
    salaire_net: dbEmployee.salaire_net,
    date_embauche: dbEmployee.date_embauche,
    actif: dbEmployee.actif ?? true,
    created_at: dbEmployee.created_at,
    updated_at: dbEmployee.updated_at,
    user_id: dbEmployee.user_id
  };
};

// Fonction utilitaire pour convertir les données vers la DB
const convertToDB = (employeeData: Partial<Employee>): any => {
  const dbData: any = {};
  
  if (employeeData.partner_id !== undefined) dbData.partner_id = employeeData.partner_id;
  if (employeeData.nom !== undefined) dbData.nom = employeeData.nom;
  if (employeeData.prenom !== undefined) dbData.prenom = employeeData.prenom;
  if (employeeData.genre !== undefined) dbData.genre = employeeData.genre;
  if (employeeData.email !== undefined) dbData.email = employeeData.email;
  if (employeeData.telephone !== undefined) dbData.telephone = employeeData.telephone;
  if (employeeData.adresse !== undefined) dbData.adresse = employeeData.adresse;
  if (employeeData.poste !== undefined) dbData.poste = employeeData.poste;
  if (employeeData.role !== undefined) dbData.role = employeeData.role;
  if (employeeData.type_contrat !== undefined) dbData.type_contrat = employeeData.type_contrat;
  if (employeeData.salaire_net !== undefined) dbData.salaire_net = employeeData.salaire_net;
  if (employeeData.date_embauche !== undefined) dbData.date_embauche = employeeData.date_embauche;
  if (employeeData.actif !== undefined) dbData.actif = employeeData.actif;
  if (employeeData.user_id !== undefined) dbData.user_id = employeeData.user_id;
  
  return dbData;
};

class EmployeeService {
  // Récupérer tous les employés
  async getAll(): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('nom', { ascending: true });

      if (error) throw error;
      return (data || []).map(convertFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des employés:', error);
      throw error;
    }
      }

  // Récupérer un employé par ID
  async getById(id: string): Promise<Employee | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? convertFromDB(data) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'employé:', error);
      throw error;
    }
  }

  // Récupérer les employés par partenaire
  async getByPartner(partnerId: string): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('partner_id', partnerId)
        .order('nom', { ascending: true });

      if (error) throw error;
      return (data || []).map(convertFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des employés du partenaire:', error);
      throw error;
    }
  }

  // Créer un nouvel employé
  async create(employeeData: Partial<Employee>): Promise<Employee> {
    try {
      const dbData = convertToDB(employeeData);
      dbData.actif = employeeData.actif ?? true;

      const { data, error } = await supabase
        .from('employees')
        .insert([dbData])
        .select()
        .single();

      if (error) throw error;
      return convertFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la création de l\'employé:', error);
      throw error;
    }
  }

  // Mettre à jour un employé
  async update(id: string, employeeData: Partial<Employee>): Promise<Employee> {
    try {
      const dbData = convertToDB(employeeData);
      dbData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('employees')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return convertFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'employé:', error);
      throw error;
    }
  }

  // Supprimer un employé
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'employé:', error);
      throw error;
    }
  }

  // Rechercher des employés
  async search(query: string): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .or(`nom.ilike.%${query}%,prenom.ilike.%${query}%,email.ilike.%${query}%,telephone.ilike.%${query}%`)
        .order('nom', { ascending: true });

      if (error) throw error;
      return (data || []).map(convertFromDB);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'employés:', error);
      throw error;
    }
  }

  // Obtenir les statistiques des employés
  async getStats(): Promise<{
    total: number;
    actifs: number;
    inactifs: number;
    parGenre: Record<string, number>;
    parContrat: Record<string, number>;
    salaireMoyen: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*');

      if (error) throw error;

      const employees = (data || []).map(convertFromDB);
      
      const total = employees.length;
      const actifs = employees.filter(emp => emp.actif).length;
      const inactifs = total - actifs;
      
      const parGenre = employees.reduce((acc, emp) => {
        acc[emp.genre] = (acc[emp.genre] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const parContrat = employees.reduce((acc, emp) => {
        acc[emp.type_contrat] = (acc[emp.type_contrat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const salaires = employees
        .filter(emp => emp.salaire_net && emp.salaire_net > 0)
        .map(emp => emp.salaire_net!);
      
      const salaireMoyen = salaires.length > 0 
        ? salaires.reduce((sum, salaire) => sum + salaire, 0) / salaires.length 
        : 0;

      return {
        total,
        actifs,
        inactifs,
        parGenre,
        parContrat,
        salaireMoyen
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques des employés:', error);
      throw error;
    }
  }

  // Obtenir les employés actifs
  async getActive(): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('actif', true)
        .order('nom', { ascending: true });

      if (error) throw error;
      return (data || []).map(convertFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des employés actifs:', error);
        throw error;
      }
  }

  // Obtenir les nouveaux employés du mois
  async getNewThisMonth(): Promise<Employee[]> {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .gte('created_at', firstDayOfMonth)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des nouveaux employés:', error);
      throw error;
    }
  }
}

export const employeeService = new EmployeeService(); 