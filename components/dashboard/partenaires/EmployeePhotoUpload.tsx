import React, { useState, useRef } from 'react';
import { Upload, X, User, Camera } from 'lucide-react';
import { useEmployeePhotoUpload } from '@/hooks/useEmployeePhotoUpload';
import Image from 'next/image';

interface EmployeePhotoUploadProps {
  employeeId?: string;
  currentPhotoUrl?: string | null;
  onPhotoChange?: (photoUrl: string) => void;
  onPhotoDelete?: () => void;
  className?: string;
}

const EmployeePhotoUpload: React.FC<EmployeePhotoUploadProps> = ({
  employeeId,
  currentPhotoUrl,
  onPhotoChange,
  onPhotoDelete,
  className = ''
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadPhoto, deletePhoto, isUploading, isDeleting, error, clearError } = useEmployeePhotoUpload();

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Type de fichier non autorisé. Utilisez JPEG, PNG ou WebP');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Fichier trop volumineux. Taille maximale: 5MB');
      return;
    }

    try {
      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload de la photo (sans employeeId pour le modal d'ajout)
      const photoUrl = await uploadPhoto(file, employeeId);
      onPhotoChange?.(photoUrl);
      clearError();
    } catch (err) {
      console.error('Erreur lors de l\'upload:', err);
      setPreviewUrl(currentPhotoUrl);
    }
  };

  const handleDeletePhoto = async () => {
    if (!currentPhotoUrl) return;

    try {
      await deletePhoto(currentPhotoUrl, employeeId);
      setPreviewUrl(null);
      onPhotoDelete?.();
      clearError();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Zone d'upload */}
      <div
        className={`
          relative w-32 h-32 rounded-full border-2 border-dashed cursor-pointer
          transition-all duration-200 ease-in-out
          ${dragActive 
            ? 'border-[var(--zalama-blue)] bg-[var(--zalama-blue-light)]' 
            : 'border-[var(--zalama-border)] hover:border-[var(--zalama-blue)]'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {/* Photo actuelle ou aperçu */}
        {previewUrl ? (
          <div className="w-full h-full rounded-full overflow-hidden">
            <Image
              src={previewUrl}
              alt="Photo de l'employé"
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <User className="w-8 h-8 text-[var(--zalama-text-secondary)] mb-2" />
            <span className="text-xs text-[var(--zalama-text-secondary)] text-center">
              Cliquez ou glissez une photo
            </span>
          </div>
        )}

        {/* Indicateur de chargement */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}

        {/* Bouton d'upload */}
        <div className="absolute bottom-0 right-0 bg-[var(--zalama-blue)] rounded-full p-1 shadow-lg">
          <Camera className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Bouton de suppression */}
      {previewUrl && !isUploading && (
        <button
          onClick={handleDeletePhoto}
          disabled={isDeleting}
          className="absolute -top-2 -right-2 bg-[var(--zalama-danger)] text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {isDeleting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <X className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />

      {/* Message d'erreur */}
      {error && (
        <div className="mt-2 text-sm text-[var(--zalama-danger)] bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-2 text-xs text-[var(--zalama-text-secondary)] text-center">
        Formats acceptés: JPEG, PNG, WebP<br />
        Taille max: 5MB
      </div>
    </div>
  );
};

export default EmployeePhotoUpload; 