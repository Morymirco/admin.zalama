import React from 'react';
import { X } from 'lucide-react';
import { Service } from '@/types/service';

interface ModaleAjoutServiceProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const ModaleAjoutService: React.FC<ModaleAjoutServiceProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Ajouter un nouveau service</h3>
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
              <label htmlFor="nom" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nom du service</label>
              <input
                type="text"
                id="add-nom"
                name="nom"
                required
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="Nom du service"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Description</label>
              <textarea
                id="add-description"
                name="description"
                required
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="Description du service"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="categorie" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Catégorie</label>
                <input
                  type="text"
                  id="add-categorie"
                  name="categorie"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  placeholder="Catégorie"
                />
              </div>
              
              <div>
                <label htmlFor="pourcentage" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Pourcentage (%)</label>
                <input
                  type="number"
                  id="add-pourcentage"
                  name="pourcentage"
                  required
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  placeholder="Pourcentage des frais"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="duree" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Durée</label>
                <input
                  type="text"
                  id="add-duree"
                  name="duree"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  placeholder="Ex: 1 heure"
                />
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="add-disponible"
                    name="disponible"
                    className="h-4 w-4 rounded border-[var(--zalama-border)] text-[var(--zalama-blue)]"
                  />
                  
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
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModaleAjoutService;
