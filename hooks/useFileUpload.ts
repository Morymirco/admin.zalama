import { useState, useCallback } from 'react';
import { storageService } from '@/services/storageService';
import { toast } from 'react-hot-toast';

interface UseFileUploadReturn {
  uploading: boolean;
  uploadProgress: number;
  uploadFile: (file: File, bucket: string, path: string) => Promise<{ url: string; error: any }>;
  uploadPartnerLogo: (file: File, partnerId: string) => Promise<{ url: string; error: any }>;
  uploadServiceLogo: (file: File, serviceId: string) => Promise<{ url: string; error: any }>;
  uploadUserPhoto: (file: File, userId: string) => Promise<{ url: string; error: any }>;
  validateFile: (file: File) => { valid: boolean; error?: string };
  resizeImage: (file: File, maxWidth?: number, maxHeight?: number) => Promise<File>;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Upload générique
  const uploadFile = useCallback(async (
    file: File, 
    bucket: string, 
    path: string
  ): Promise<{ url: string; error: any }> => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Valider le fichier
      const validation = storageService.validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Fichier invalide');
        return { url: '', error: validation.error };
      }

      // Redimensionner l'image si nécessaire
      const resizedFile = await storageService.resizeImage(file, 800, 800);

      // Simuler le progrès
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload du fichier
      const { data, error } = await storageService.uploadFile(bucket, path, resizedFile, {
        upsert: true,
        cacheControl: '3600'
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) {
        toast.error('Erreur lors de l\'upload du fichier');
        return { url: '', error };
      }

      // Obtenir l'URL publique
      const publicUrl = await storageService.getPublicUrl(bucket, path);
      
      toast.success('Fichier uploadé avec succès');
      return { url: publicUrl, error: null };

    } catch (error) {
      console.error('Erreur uploadFile:', error);
      toast.error('Erreur lors de l\'upload');
      return { url: '', error };
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // Upload logo partenaire
  const uploadPartnerLogo = useCallback(async (
    file: File, 
    partnerId: string
  ): Promise<{ url: string; error: any }> => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Valider le fichier
      const validation = storageService.validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Fichier invalide');
        return { url: '', error: validation.error };
      }

      // Redimensionner l'image
      const resizedFile = await storageService.resizeImage(file, 400, 400);

      // Simuler le progrès
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload direct depuis le client (utilise la clé anonyme)
      const result = await storageService.uploadPartnerLogo(resizedFile, partnerId);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.error) {
        toast.error('Erreur lors de l\'upload du logo');
        return result;
      }

      toast.success('Logo uploadé avec succès');
      return result;

    } catch (error) {
      console.error('Erreur uploadPartnerLogo:', error);
      toast.error('Erreur lors de l\'upload du logo');
      return { url: '', error };
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // Upload logo service
  const uploadServiceLogo = useCallback(async (
    file: File, 
    serviceId: string
  ): Promise<{ url: string; error: any }> => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Valider le fichier
      const validation = storageService.validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Fichier invalide');
        return { url: '', error: validation.error };
      }

      // Redimensionner l'image
      const resizedFile = await storageService.resizeImage(file, 300, 300);

      // Simuler le progrès
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload avec le service spécialisé
      const result = await storageService.uploadServiceLogo(resizedFile, serviceId);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.error) {
        toast.error('Erreur lors de l\'upload du logo');
        return result;
      }

      toast.success('Logo uploadé avec succès');
      return result;

    } catch (error) {
      console.error('Erreur uploadServiceLogo:', error);
      toast.error('Erreur lors de l\'upload du logo');
      return { url: '', error };
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // Upload photo utilisateur
  const uploadUserPhoto = useCallback(async (
    file: File, 
    userId: string
  ): Promise<{ url: string; error: any }> => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Valider le fichier
      const validation = storageService.validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Fichier invalide');
        return { url: '', error: validation.error };
      }

      // Redimensionner l'image
      const resizedFile = await storageService.resizeImage(file, 200, 200);

      // Simuler le progrès
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload avec le service spécialisé
      const result = await storageService.uploadUserPhoto(resizedFile, userId);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.error) {
        toast.error('Erreur lors de l\'upload de la photo');
        return result;
      }

      toast.success('Photo uploadée avec succès');
      return result;

    } catch (error) {
      console.error('Erreur uploadUserPhoto:', error);
      toast.error('Erreur lors de l\'upload de la photo');
      return { url: '', error };
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // Valider un fichier
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    return storageService.validateImageFile(file);
  }, []);

  // Redimensionner une image
  const resizeImage = useCallback(async (
    file: File, 
    maxWidth: number = 800, 
    maxHeight: number = 800
  ): Promise<File> => {
    return storageService.resizeImage(file, maxWidth, maxHeight);
  }, []);

  return {
    uploading,
    uploadProgress,
    uploadFile,
    uploadPartnerLogo,
    uploadServiceLogo,
    uploadUserPhoto,
    validateFile,
    resizeImage
  };
}; 