import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { Employee } from '@/types/employee';

interface ModaleSuppressionUtilisateurProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  utilisateur: Employee;
}

const ModaleSuppressionUtilisateur: React.FC<ModaleSuppressionUtilisateurProps> = ({
  isOpen,
  onClose,
  onConfirm,
  utilisateur
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center p-5 border-b border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Supprimer l'employé</h3>
          <button 
            onClick={onClose}
            disabled={isDeleting}
            className="text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-[var(--zalama-warning)]" />
            <div>
              <h4 className="text-sm font-medium text-[var(--zalama-text)]">Êtes-vous sûr de vouloir supprimer cet employé ?</h4>
              <p className="text-xs text-[var(--zalama-text-secondary)] mt-1">Cette action est irréversible.</p>
            </div>
          </div>
          
          <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4 mb-4">
            <div className="text-sm text-[var(--zalama-text)]">
              <strong>Nom :</strong> {utilisateur.prenom} {utilisateur.nom}
            </div>
            <div className="text-sm text-[var(--zalama-text)]">
              <strong>Email :</strong> {utilisateur.email}
            </div>
            <div className="text-sm text-[var(--zalama-text)]">
              <strong>Poste :</strong> {utilisateur.poste}
            </div>
            <div className="text-sm text-[var(--zalama-text)]">
              <strong>Téléphone :</strong> {utilisateur.telephone}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 border border-[var(--zalama-border)] text-[var(--zalama-text)] rounded-lg hover:bg-[var(--zalama-bg-lighter)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-[var(--zalama-danger)] text-white rounded-lg hover:bg-[var(--zalama-danger-accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModaleSuppressionUtilisateur;
