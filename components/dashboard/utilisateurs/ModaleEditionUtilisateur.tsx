import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Utilisateur } from '@/types/utilisateur';

interface ModaleEditionUtilisateurProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  utilisateur: Utilisateur | null;
}

const ModaleEditionUtilisateur: React.FC<ModaleEditionUtilisateurProps> = ({
  isOpen,
  onClose,
  onSubmit,
  utilisateur
}) => {
  const [typeUtilisateur, setTypeUtilisateur] = useState<string>('Étudiant');

  useEffect(() => {
    if (utilisateur) {
      setTypeUtilisateur(utilisateur.type);
    }
  }, [utilisateur]);

  if (!isOpen || !utilisateur) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Modifier l&apos;utilisateur</h3>
          <button 
            onClick={onClose}
            className="text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-5">
          <div className="space-y-4">
            {/* Type d'utilisateur */}
            <div>
              <label htmlFor="edit-type" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Type d&apos;utilisateur</label>
              <select
                id="edit-type"
                name="type"
                required
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                value={typeUtilisateur}
                onChange={(e) => setTypeUtilisateur(e.target.value)}
              >
                <option value="Étudiant">Étudiant</option>
                <option value="Salarié">Salarié</option>
                <option value="Entreprise">Entreprise</option>
              </select>
            </div>
            
            {/* Informations personnelles */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-prenom" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Prénom</label>
                <input
                  type="text"
                  id="edit-prenom"
                  name="prenom"
                  required
                  defaultValue={utilisateur.displayName.split(' ')[0]}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                />
              </div>
              
              <div>
                <label htmlFor="edit-nom" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nom</label>
                <input
                  type="text"
                  id="edit-nom"
                  name="nom"
                  required
                  defaultValue={utilisateur.displayName.split(' ')[1]}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                />
              </div>
            </div>
            
            {/* Coordonnées */}
            <div>
              <label htmlFor="edit-email" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Email</label>
              <input
                type="email"
                id="edit-email"
                name="email"
                required
                defaultValue={utilisateur.email}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              />
            </div>
            
            <div>
              <label htmlFor="edit-telephone" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Téléphone</label>
              <input
                type="tel"
                id="edit-telephone"
                name="telephone"
                required
                defaultValue={utilisateur.phoneNumber}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              />
            </div>
            
            <div>
              <label htmlFor="edit-adresse" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Adresse</label>
              <input
                type="text"
                id="edit-adresse"
                name="adresse"
                required
                defaultValue={utilisateur.address}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              />
            </div>
            
            {/* Champs spécifiques au type d'utilisateur */}
            {typeUtilisateur === 'Étudiant' && (
              <>
                <div>
                  <label htmlFor="edit-etablissement" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Établissement</label>
                  <input
                    type="text"
                    id="edit-etablissement"
                    name="etablissement"
                    required
                    defaultValue={utilisateur.etablissement}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-niveauEtudes" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Niveau d&apos;études</label>
                  <select
                    id="edit-niveauEtudes"
                    name="niveauEtudes"
                    required
                    defaultValue={utilisateur.niveauEtudes}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  >
                    <option value="">Sélectionner un niveau</option>
                    <option value="Licence 1">Licence 1</option>
                    <option value="Licence 2">Licence 2</option>
                    <option value="Licence 3">Licence 3</option>
                    <option value="Master 1">Master 1</option>
                    <option value="Master 2">Master 2</option>
                    <option value="Doctorat">Doctorat</option>
                  </select>
                </div>
              </>
            )}
            
            {typeUtilisateur === 'Salarié' && (
              <>
                <div>
                  <label htmlFor="edit-organisation" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Organisation</label>
                  <input
                    type="text"
                    id="edit-organisation"
                    name="organisation"
                    required
                    defaultValue={utilisateur.organization}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-poste" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Poste</label>
                  <input
                    type="text"
                    id="edit-poste"
                    name="poste"
                    required
                    defaultValue={utilisateur.poste}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  />
                </div>
              </>
            )}
            
            {typeUtilisateur === 'Entreprise' && (
              <>
                <div>
                  <label htmlFor="edit-organisation" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nom de l&apos;entreprise</label>
                  <input
                    type="text"
                    id="edit-organisation"
                    name="organisation"
                    required
                    defaultValue={utilisateur.organization}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-secteur" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Secteur d&apos;activité</label>
                  <input
                    type="text"
                    id="edit-secteur"
                    name="secteur"
                    required
                    defaultValue={utilisateur.poste}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  />
                </div>
              </>
            )}
            
            {/* Statut */}
            <div>
              <label htmlFor="edit-statut" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Statut</label>
              <select
                id="edit-statut"
                name="statut"
                required
                defaultValue={utilisateur.active ? "Actif" : "Inactif"}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
                <option value="En attente">En attente</option>
              </select>
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

export default ModaleEditionUtilisateur;
