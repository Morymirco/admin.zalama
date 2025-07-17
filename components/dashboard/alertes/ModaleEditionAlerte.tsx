import { X } from 'lucide-react';
import React from 'react';

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

interface ModaleEditionAlerteProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  alerte: Alerte | null;
  isLoading?: boolean;
}

const ModaleEditionAlerte: React.FC<ModaleEditionAlerteProps> = ({
  isOpen,
  onClose,
  onSubmit,
  alerte,
  isLoading = false
}) => {
  if (!isOpen || !alerte) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Modifier l&apos;alerte</h3>
          <button 
            onClick={onClose}
            className="text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-5">
          <div className="space-y-4">
            {/* Titre */}
            <div>
              <label htmlFor="edit-titre" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Titre</label>
              <input
                type="text"
                id="edit-titre"
                name="titre"
                required
                defaultValue={alerte.titre}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              />
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Description</label>
              <textarea
                id="edit-description"
                name="description"
                required
                rows={4}
                defaultValue={alerte.description}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              ></textarea>
            </div>
            
            {/* Type */}
            <div>
              <label htmlFor="edit-type" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Type</label>
              <select
                id="edit-type"
                name="type"
                required
                defaultValue={alerte.type}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              >
                <option value="Critique">Critique</option>
                <option value="Importante">Importante</option>
                <option value="Information">Information</option>
              </select>
            </div>
            
            {/* Statut */}
            <div>
              <label htmlFor="edit-statut" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Statut</label>
              <select
                id="edit-statut"
                name="statut"
                required
                defaultValue={alerte.statut}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              >
                <option value="Nouvelle">Nouvelle</option>
                <option value="En cours">En cours</option>
                <option value="Résolue">Résolue</option>
              </select>
            </div>
            
            {/* Source */}
            <div>
              <label htmlFor="edit-source" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Source</label>
              <input
                type="text"
                id="edit-source"
                name="source"
                required
                defaultValue={alerte.source}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              />
            </div>
            
            {/* Assigné à */}
            <div>
              <label htmlFor="edit-assigneA" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Assigné à (optionnel)</label>
              <input
                type="text"
                id="edit-assigneA"
                name="assigneA"
                defaultValue={alerte.assigneA}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-[var(--zalama-border)] rounded-lg text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModaleEditionAlerte;
