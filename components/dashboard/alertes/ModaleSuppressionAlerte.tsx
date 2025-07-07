import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface Alerte {
  id: string;
  titre: string;
  description: string;
  type: 'Critique' | 'Importante' | 'Information';
  statut: 'Résolue' | 'En cours' | 'Nouvelle';
  dateCreation: string;
  dateResolution?: string;
  source: string;
  assigneA?: string;
}

interface ModaleSuppressionAlerteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  alerte: Alerte | null;
}

const ModaleSuppressionAlerte: React.FC<ModaleSuppressionAlerteProps> = ({
  isOpen,
  onClose,
  onConfirm,
  alerte
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !alerte) return null;

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
          <p className="text-[var(--zalama-text)] mb-4">
            Êtes-vous sûr de vouloir supprimer l&apos;alerte <span className="font-semibold">&ldquo;{alerte.titre}&rdquo;</span> ? Cette action est irréversible.
          </p>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 border border-[var(--zalama-border)] rounded-lg text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
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

export default ModaleSuppressionAlerte;
