import { createClient } from '@supabase/supabase-js';

// Configuration Supabase - Variables définies directement
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Service pour le storage Supabase
export const storageService = {
  // Upload d'un fichier
  async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: {
      cacheControl?: string;
      upsert?: boolean;
    }
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: options?.cacheControl || '3600',
          upsert: options?.upsert || false,
        });

      if (error) {
        console.error('Erreur lors de l\'upload:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erreur storageService.uploadFile:', error);
      return { data: null, error };
    }
  },

  // Obtenir l'URL publique d'un fichier
  async getPublicUrl(bucket: string, path: string): Promise<string> {
    try {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return data.publicUrl;
    } catch (error) {
      console.error('Erreur storageService.getPublicUrl:', error);
      throw error;
    }
  },

  // Supprimer un fichier
  async deleteFile(bucket: string, path: string): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erreur storageService.deleteFile:', error);
      return { data: null, error };
    }
  },

  // Lister les fichiers d'un bucket
  async listFiles(bucket: string, path?: string): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path || '');

      if (error) {
        console.error('Erreur lors du listing:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erreur storageService.listFiles:', error);
      return { data: null, error };
    }
  },

  // Upload d'un logo de partenaire
  async uploadPartnerLogo(file: File, partnerId: string): Promise<{ url: string; error: any }> {
    try {
      // Générer un nom de fichier unique
      const fileExtension = file.name.split('.').pop();
      const fileName = `partners/${partnerId}/logo.${fileExtension}`;
      
      // Upload du fichier
      const { data, error } = await this.uploadFile('logos', fileName, file, {
        upsert: true,
        cacheControl: '3600'
      });

      if (error) {
        return { url: '', error };
      }

      // Obtenir l'URL publique
      const publicUrl = await this.getPublicUrl('logos', fileName);
      
      return { url: publicUrl, error: null };
    } catch (error) {
      console.error('Erreur uploadPartnerLogo:', error);
      return { url: '', error };
    }
  },

  // Upload d'un logo de service
  async uploadServiceLogo(file: File, serviceId: string): Promise<{ url: string; error: any }> {
    try {
      // Générer un nom de fichier unique
      const fileExtension = file.name.split('.').pop();
      const fileName = `services/${serviceId}/logo.${fileExtension}`;
      
      // Upload du fichier
      const { data, error } = await this.uploadFile('logos', fileName, file, {
        upsert: true,
        cacheControl: '3600'
      });

      if (error) {
        return { url: '', error };
      }

      // Obtenir l'URL publique
      const publicUrl = await this.getPublicUrl('logos', fileName);
      
      return { url: publicUrl, error: null };
    } catch (error) {
      console.error('Erreur uploadServiceLogo:', error);
      return { url: '', error };
    }
  },

  // Upload d'une photo de profil utilisateur
  async uploadUserPhoto(file: File, userId: string): Promise<{ url: string; error: any }> {
    try {
      // Générer un nom de fichier unique
      const fileExtension = file.name.split('.').pop();
      const fileName = `users/${userId}/photo.${fileExtension}`;
      
      // Upload du fichier
      const { data, error } = await this.uploadFile('photos', fileName, file, {
        upsert: true,
        cacheControl: '3600'
      });

      if (error) {
        return { url: '', error };
      }

      // Obtenir l'URL publique
      const publicUrl = await this.getPublicUrl('photos', fileName);
      
      return { url: publicUrl, error: null };
    } catch (error) {
      console.error('Erreur uploadUserPhoto:', error);
      return { url: '', error };
    }
  },

  // Valider un fichier image
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Type de fichier non supporté. Utilisez JPEG, PNG, GIF ou WebP.'
      };
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Fichier trop volumineux. Taille maximum : 5MB.'
      };
    }

    return { valid: true };
  },

  // Redimensionner une image côté client (optionnel)
  async resizeImage(file: File, maxWidth: number = 800, maxHeight: number = 800): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculer les nouvelles dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Redimensionner
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir en blob
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            resolve(file);
          }
        }, file.type, 0.8);
      };

      img.src = URL.createObjectURL(file);
    });
  },

  // Upload d'un logo de partenaire via API
  async uploadPartnerLogoViaAPI(file: File, partnerId: string): Promise<{ url: string; error: any }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('partnerId', partnerId);
      formData.append('type', 'partner');

      const response = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        return { url: '', error: result.error || 'Erreur lors de l\'upload' };
      }

      return { url: result.url, error: null };
    } catch (error) {
      console.error('Erreur uploadPartnerLogoViaAPI:', error);
      return { url: '', error };
    }
  },

  // Upload d'un logo de service via API
  async uploadServiceLogoViaAPI(file: File, serviceId: string): Promise<{ url: string; error: any }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('partnerId', serviceId);
      formData.append('type', 'service');

      const response = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        return { url: '', error: result.error || 'Erreur lors de l\'upload' };
      }

      return { url: result.url, error: null };
    } catch (error) {
      console.error('Erreur uploadServiceLogoViaAPI:', error);
      return { url: '', error };
    }
  },
};

export default storageService; 