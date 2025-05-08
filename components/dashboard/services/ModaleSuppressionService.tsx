import React from 'react';
import { X } from 'lucide-react';

interface Service {
  id: string;
  nom: string;
  description: string;
  categorie: string;
  prix: number;
  duree: string;
  disponible: boolean;
  dateCreation: string;
}

interface ModaleSuppressionServiceProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  service: Service | null;
}

const ModaleSuppressionService: React.FC<ModaleSuppressionServiceProps> = ({
  isOpen,
  onClose,
  onConfirm,
  service
}) => {
  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center p-5 border-b border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Confirmer la suppression</h3>
          <button 
            onClick={onClose}
            className="text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-5">
          <p className="text-[var(--zalama-text)] mb-4">
            Êtes-vous sûr de vouloir supprimer le service <span className="font-semibold">&ldquo;{service.nom}&rdquo;</span> ? Cette action est irréversible.
          </p>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[var(--zalama-border)] rounded-lg text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-[var(--zalama-danger)] hover:bg-[var(--zalama-danger-accent)] text-white rounded-lg transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModaleSuppressionService;
