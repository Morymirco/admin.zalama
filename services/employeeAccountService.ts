import { generatePassword, sendSMS } from '@/lib/utils';

interface EmployeeAccountData {
  email: string;
  password: string;
  display_name: string;
  role: 'user' | 'rh' | 'responsable';
  partenaire_id: string;
  employee_id: string;
}

class EmployeeAccountService {
  // Créer un compte employé avec mot de passe généré
  async createEmployeeAccount(employeeData: any): Promise<{ success: boolean; account?: any; error?: string }> {
    try {
      // Appeler l'API route pour créer le compte
      const response = await fetch('/api/auth/create-employee-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeData: {
            ...employeeData,
            id: employeeData.id,
            partner_id: employeeData.partner_id
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { 
        success: true, 
        account: result.account
      };

    } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
      return { success: false, error: `Erreur création compte: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  // Supprimer un compte employé
  async deleteEmployeeAccount(employeeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/delete-employee-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      return { success: result.success, error: result.error };

    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      return { success: false, error: `Erreur lors de la suppression du compte: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  // Désactiver/activer un compte employé
  async toggleEmployeeAccount(employeeId: string, active: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/toggle-employee-account', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId, active }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      return { success: result.success, error: result.error };

    } catch (error) {
      console.error('Erreur lors de la modification du compte:', error);
      return { success: false, error: `Erreur lors de la modification du compte: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  // Réinitialiser le mot de passe d'un employé
  async resetEmployeePassword(employeeId: string): Promise<{ success: boolean; password?: string; error?: string }> {
    try {
      const response = await fetch('/api/auth/reset-employee-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      return { success: result.success, password: result.password, error: result.error };

    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      return { success: false, error: `Erreur lors de la réinitialisation du mot de passe: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
}

export default new EmployeeAccountService(); 