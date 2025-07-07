import React, { useState } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { Employe } from '@/types/partenaire';

interface ModaleSuppressionEmployeProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  employe: Employe | null;
}

const ModaleSuppressionEmploye: React.FC<ModaleSuppressionEmployeProps> = ({
  isOpen,
  onClose,
  onConfirm,
  employe
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !employe) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm(employe.id);
      onClose();
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
          <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Confirmer la suppression</h3>
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
            <div className="w-10 h-10 bg-[var(--zalama-danger)]/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-[var(--zalama-danger)]" />
            </div>
            <div>
              <h4 className="font-medium text-[var(--zalama-text)]">Supprimer l'employé</h4>
              <p className="text-sm text-[var(--zalama-text-secondary)]">Cette action est irréversible</p>
            </div>
          </div>
          
          <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4 mb-6">
            <p className="text-[var(--zalama-text)] mb-2">
              Êtes-vous sûr de vouloir supprimer l'employé :
            </p>
            <div className="font-medium text-[var(--zalama-text)]">
              {employe.prenom} {employe.nom}
            </div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">
              {employe.poste} • {employe.type_contrat}
            </div>
          </div>
          
          <div className="text-sm text-[var(--zalama-text-secondary)] mb-6">
            <p className="mb-2">Cette action va :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Supprimer définitivement l'employé de la base de données</li>
              <li>Supprimer son compte utilisateur associé (s'il existe)</li>
              <li>Supprimer toutes ses données liées</li>
            </ul>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 border border-[var(--zalama-border)] rounded-lg text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-[var(--zalama-danger)] hover:bg-[var(--zalama-danger-accent)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

export default ModaleSuppressionEmploye; 