import React from 'react';
import { X } from 'lucide-react';
import { Service } from '@/types/service';
interface ModaleEditionServiceProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  service: Service | null;
}

const ModaleEditionService: React.FC<ModaleEditionServiceProps> = ({
  isOpen,
  onClose,
  onSubmit,
  service
}) => {
  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Modifier le service</h3>
          <button 
            onClick={onClose}
            className="text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-nom" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nom du service</label>
              <input
                type="text"
                id="edit-nom"
                required
                defaultValue={service.nom}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              />
            </div>
            
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Description</label>
              <textarea
                id="edit-description"
                required
                rows={3}
                defaultValue={service.description}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-categorie" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Catégorie</label>
                <input
                  type="text"
                  id="edit-categorie"
                  required
                  defaultValue={service.categorie}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                />
              </div>
              
              <div>
                <label htmlFor="edit-frais" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Frais attribués (FG)</label>
                <input
                  type="number"
                  id="edit-frais"
                  required
                  min="0"
                  defaultValue={service.fraisAttribues || 0}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-pourcentage" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Pourcentage (%)</label>
                <input
                  type="number"
                  id="edit-pourcentage"
                  required
                  min="0"
                  defaultValue={service.pourcentageMax}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                />
              </div>
              
              <div>
                <label htmlFor="edit-duree" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Durée</label>
                <input
                  type="text"
                  id="edit-duree"
                  required
                  defaultValue={service.duree}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="edit-disponible"
                    className="sr-only peer"
                    defaultChecked={service.disponible}
                  />
                  <div className="relative w-10 h-5 bg-[var(--zalama-bg-lighter)] rounded-full transition peer-checked:bg-[var(--zalama-success)]/20">
                    <div className="dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition peer-checked:left-5 peer-checked:bg-[var(--zalama-success)]"></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-[var(--zalama-text)]">Disponible</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--zalama-border)] rounded-lg text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModaleEditionService;
