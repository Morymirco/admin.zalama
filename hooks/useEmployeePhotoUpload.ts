import { useState } from 'react';
import { employeePhotoService } from '@/services/employeePhotoService';

interface UseEmployeePhotoUploadReturn {
  uploadPhoto: (file: File, employeeId?: string) => Promise<string>;
  deletePhoto: (photoUrl: string, employeeId?: string) => Promise<void>;
  isUploading: boolean;
  isDeleting: boolean;
  error: string | null;
  clearError: () => void;
}

export const useEmployeePhotoUpload = (): UseEmployeePhotoUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPhoto = async (file: File, employeeId?: string): Promise<string> => {
    setIsUploading(true);
    setError(null);
    
    try {
      // Si pas d'employeeId fourni (cas du modal d'ajout), générer un ID temporaire
      const tempEmployeeId = employeeId || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Utiliser l'API route pour l'upload (sans mise à jour de la base de données)
      const photoUrl = await employeePhotoService.uploadPhotoViaAPI(file, tempEmployeeId, false);
      return photoUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload de la photo';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const deletePhoto = async (photoUrl: string, employeeId?: string): Promise<void> => {
    setIsDeleting(true);
    setError(null);
    
    try {
      // Utiliser l'API route pour la suppression
      const params = new URLSearchParams({ photoUrl });
      if (employeeId) {
        params.append('employeeId', employeeId);
      }
      
      const response = await fetch(`/api/upload-employee-photo?${params}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de la photo';
      setError(errorMessage);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    uploadPhoto,
    deletePhoto,
    isUploading,
    isDeleting,
    error,
    clearError,
  };
}; 