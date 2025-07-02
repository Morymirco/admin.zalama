import { createClient } from '@supabase/supabase-js';
import { User, Session, AuthError } from '@supabase/supabase-js';

// Configuration Supabase - Variables définies directement
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.6sIgEDZIP1fkUoxdPJYfzKHU1B_SfN6Hui6v_FV6yzw';

// Client pour les opérations côté client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client pour les opérations côté serveur (avec clé de service)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'user' | 'rh' | 'responsable';
  partenaireId?: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  role?: string;
  partenaireId?: string;
}

class AuthService {
  // Connexion
  async signIn(credentials: LoginCredentials): Promise<{ user: User; session: Session }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      // S'assurer que l'utilisateur existe dans la table admin_users
      if (data.user) {
        const profile = await this.getUserProfile(data.user.id);
        if (!profile) {
          console.log('Création automatique du profil utilisateur lors de la connexion...');
          await this.createUserRecordFromAuth(data.user.id);
        }
        
        // Mettre à jour la dernière connexion
        await this.updateLastLogin(data.user.id);
      }

      return data;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  }

  // Inscription
  async signUp(signUpData: SignUpData): Promise<{ user: User; session: Session | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            displayName: signUpData.displayName,
            role: signUpData.role || 'user',
            partenaireId: signUpData.partenaireId,
          }
        }
      });

      if (error) throw error;

      // Créer l'utilisateur dans la table admin_users si l'inscription réussit
      if (data.user) {
        await this.createUserRecord({
          id: data.user.id,
          email: signUpData.email,
          displayName: signUpData.displayName,
          role: (signUpData.role as any) || 'user',
          partenaireId: signUpData.partenaireId,
          active: true,
          createdAt: new Date().toISOString(),
        });
      }

      return data;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  }

  // Déconnexion
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    }
  }

  // Récupérer la session actuelle (optimisée)
  async getSession(): Promise<Session | null> {
    try {
      // Utiliser une promesse avec timeout pour éviter les blocages
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout session')), 5000)
      );
      
      const { data: { session }, error } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any;
      
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Erreur lors de la récupération de la session:', error);
      // Retourner null au lieu de throw pour éviter les blocages
      return null;
    }
  }

  // Récupérer l'utilisateur actuel (optimisée)
  async getCurrentUser(): Promise<User | null> {
    try {
      // Utiliser une promesse avec timeout pour éviter les blocages
      const userPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout user')), 5000)
      );
      
      const { data: { user }, error } = await Promise.race([
        userPromise,
        timeoutPromise
      ]) as any;
      
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      // Retourner null au lieu de throw pour éviter les blocages
      return null;
    }
  }

  // Réinitialiser le mot de passe
  async resetPassword(email: string, redirectTo?: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo || `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Erreur de réinitialisation du mot de passe:', error);
      throw error;
    }
  }

  // Mettre à jour le mot de passe
  async updatePassword(password: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      if (error) throw error;
    } catch (error) {
      console.error('Erreur de mise à jour du mot de passe:', error);
      throw error;
    }
  }

  // Créer un utilisateur admin (côté serveur)
  async createAdminUser(userData: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<AuthUser> {
    try {
      // Créer l'utilisateur dans Supabase Auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          displayName: userData.displayName,
          role: 'admin',
        },
      });

      if (authError) throw authError;
      if (!authUser.user) throw new Error('Erreur lors de la création de l\'utilisateur');

      // Créer l'enregistrement dans la table admin_users
      const userRecord = await this.createUserRecord({
        id: authUser.user.id,
        email: userData.email,
        displayName: userData.displayName,
        role: 'admin',
        active: true,
        createdAt: new Date().toISOString(),
      });

      return userRecord;
    } catch (error) {
      console.error('Erreur lors de la création de l\'admin:', error);
      throw error;
    }
  }

  // Créer un enregistrement utilisateur dans la table admin_users
  private async createUserRecord(userData: {
    id: string;
    email: string;
    displayName: string;
    role: string;
    partenaireId?: string;
    active: boolean;
    createdAt: string;
  }): Promise<AuthUser> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .insert([{
          id: userData.id,
          email: userData.email,
          display_name: userData.displayName,
          role: userData.role,
          partenaire_id: userData.partenaireId,
          active: userData.active,
          created_at: userData.createdAt,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'enregistrement utilisateur:', error);
      throw error;
    }
  }

  // Mettre à jour la dernière connexion
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        // Si l'utilisateur n'existe pas, ne pas faire échouer la connexion
        console.warn('Impossible de mettre à jour la dernière connexion:', error);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la dernière connexion:', error);
      // Ne pas faire échouer la connexion pour cette erreur
    }
  }

  // Récupérer les informations utilisateur depuis la table admin_users
  async getUserProfile(userId: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Si l'utilisateur n'existe pas dans admin_users, le créer automatiquement
        if (error.code === 'PGRST116') {
          console.log('Utilisateur non trouvé dans admin_users, création automatique...');
          return await this.createUserRecordFromAuth(userId);
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil utilisateur:', error);
      return null;
    }
  }

  // Créer un enregistrement utilisateur à partir des données Supabase Auth
  private async createUserRecordFromAuth(userId: string): Promise<AuthUser | null> {
    try {
      // Récupérer les informations de l'utilisateur actuel depuis Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user || user.id !== userId) {
        console.error('Erreur lors de la récupération de l\'utilisateur Auth:', authError);
        return null;
      }

      // Créer l'enregistrement dans admin_users
      const userRecord = await this.createUserRecord({
        id: user.id,
        email: user.email || '',
        displayName: user.user_metadata?.displayName || user.email?.split('@')[0] || 'Utilisateur',
        role: user.user_metadata?.role || 'user',
        partenaireId: user.user_metadata?.partenaireId,
        active: true,
        createdAt: user.created_at,
      });

      return userRecord;
    } catch (error) {
      console.error('Erreur lors de la création automatique de l\'enregistrement utilisateur:', error);
      return null;
    }
  }

  // Vérifier si l'utilisateur est admin
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId);
      return profile?.role === 'admin';
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle admin:', error);
      return false;
    }
  }

  // Vérifier si l'utilisateur est actif
  async isUserActive(userId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId);
      return profile?.active || false;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut actif:', error);
      return false;
    }
  }

  // Écouter les changements d'authentification
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export default new AuthService(); 