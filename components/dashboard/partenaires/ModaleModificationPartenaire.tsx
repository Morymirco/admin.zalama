import React, { useState, useRef, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

interface ModaleModificationPartenaireProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  types: string[];
  partenaire: any;
}

const ModaleModificationPartenaire: React.FC<ModaleModificationPartenaireProps> = ({
  isOpen,
  onClose,
  onSubmit,
  types,
  partenaire
}) => {
  // États pour le logo
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialiser le logo preview avec le logo existant
  useEffect(() => {
    if (partenaire && partenaire.logo) {
      setLogoPreview(partenaire.logo);
    }
  }, [partenaire]);

  // Gestion du téléchargement du logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Créer un aperçu du logo
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Clic sur le bouton de téléchargement du logo
  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };
  
  // Gestion de la soumission du formulaire
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // Collecte des données du formulaire
      const form = e.currentTarget;
      const formData = {
        // Informations sur l'entreprise
        nom: (form.querySelector('#nom') as HTMLInputElement)?.value || '',
        type: (form.querySelector('#type') as HTMLSelectElement)?.value || '',
        domaine: (form.querySelector('#domaine') as HTMLInputElement)?.value || '',
        description: (form.querySelector('#description') as HTMLTextAreaElement)?.value || '',
        
        // Représentant
        nomRepresentant: (form.querySelector('#nomRepresentant') as HTMLInputElement)?.value || '',
        emailRepresentant: (form.querySelector('#emailRepresentant') as HTMLInputElement)?.value || '',
        telephoneRepresentant: (form.querySelector('#telephoneRepresentant') as HTMLInputElement)?.value || '',
        
        // Responsable RH
        nomRH: (form.querySelector('#nomRH') as HTMLInputElement)?.value || '',
        emailRH: (form.querySelector('#emailRH') as HTMLInputElement)?.value || '',
        telephoneRH: (form.querySelector('#telephoneRH') as HTMLInputElement)?.value || '',
        
        // Informations légales et contact
        rccm: (form.querySelector('#rccm') as HTMLInputElement)?.value || '',
        nif: (form.querySelector('#nif') as HTMLInputElement)?.value || '',
        email: (form.querySelector('#email') as HTMLInputElement)?.value || '',
        telephone: (form.querySelector('#telephone') as HTMLInputElement)?.value || '',
        adresse: (form.querySelector('#adresse') as HTMLInputElement)?.value || '',
        siteWeb: (form.querySelector('#siteWeb') as HTMLInputElement)?.value || '',
        
        // Autres informations
        dateAdhesion: (form.querySelector('#dateAdhesion') as HTMLInputElement)?.value || '',
        actif: (form.querySelector('#actif') as HTMLInputElement)?.checked || false,
        
        // Logo
        logo: logoFile
      };
      
      // Stockage temporaire des données
      (window as any).formData = formData;
      
      // Appel de la fonction onSubmit passée en props
      onSubmit(e);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      toast.error('Une erreur est survenue lors de la soumission du formulaire. Veuillez réessayer.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Modifier le partenaire</h3>
          <button 
            type="button" 
            onClick={onClose}
            className="text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleFormSubmit} className="p-5">
            <div className="space-y-6">
              {/* Section Logo et Nom */}
              <div className="flex gap-6">
                <div>
                  <div 
                    onClick={handleLogoClick}
                    className="w-32 h-32 border-2 border-dashed border-[var(--zalama-border)] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--zalama-bg-lighter)] transition-colors"
                  >
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-[var(--zalama-text-secondary)] mb-2" />
                        <span className="text-sm text-[var(--zalama-text-secondary)]">Logo</span>
                      </>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nom de l'entreprise</label>
                    <input
                      type="text"
                      id="nom"
                      required
                      defaultValue={partenaire?.nom || ''}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                      placeholder="Nom de l'entreprise"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Type</label>
                      <select
                        id="type"
                        required
                        defaultValue={partenaire?.type || ''}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                      >
                        <option value="">Sélectionner un type</option>
                        {types.map((type, index) => (
                          <option key={index} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="domaine" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Secteur d'activité</label>
                      <input
                        type="text"
                        id="domaine"
                        required
                        defaultValue={partenaire?.secteur || ''}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                        placeholder="Secteur d'activité"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Description</label>
                <textarea
                  id="description"
                  rows={3}
                  defaultValue={partenaire?.description || ''}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  placeholder="Description de l'entreprise"
                ></textarea>
              </div>
              
              {/* Section Représentant */}
              <div>
                <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3">Représentant</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="nomRepresentant" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nom du représentant</label>
                    <input
                      type="text"
                      id="nomRepresentant"
                      required
                      defaultValue={partenaire?.nomRepresentant || ''}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                      placeholder="Nom complet"
                    />
                  </div>
                  <div>
                    <label htmlFor="emailRepresentant" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Email</label>
                    <input
                      type="email"
                      id="emailRepresentant"
                      required
                      defaultValue={partenaire?.emailRepresentant || ''}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <label htmlFor="telephoneRepresentant" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Téléphone</label>
                    <input
                      type="tel"
                      id="telephoneRepresentant"
                      required
                      defaultValue={partenaire?.telephoneRepresentant || ''}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                      placeholder="Numéro de téléphone"
                    />
                  </div>
                </div>
              </div>
              
              {/* Section Responsable RH */}
              <div>
                <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3">Responsable RH</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="nomRH" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nom du responsable RH</label>
                    <input
                      type="text"
                      id="nomRH"
                      required
                      defaultValue={partenaire?.nomRH || ''}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                      placeholder="Nom complet"
                    />
                  </div>
                  <div>
                    <label htmlFor="emailRH" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Email</label>
                    <input
                      type="email"
                      id="emailRH"
                      required
                      defaultValue={partenaire?.emailRH || ''}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <label htmlFor="telephoneRH" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Téléphone</label>
                    <input
                      type="tel"
                      id="telephoneRH"
                      required
                      defaultValue={partenaire?.telephoneRH || ''}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                      placeholder="Numéro de téléphone"
                    />
                  </div>
                </div>
              </div>
              
              {/* Section Informations légales et contact */}
              <div>
                <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3">Informations légales et contact</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="rccm" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">RCCM</label>
                    <input
                      type="text"
                      id="rccm"
                      defaultValue={partenaire?.rccm || ''}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                      placeholder="Numéro RCCM"
                    />
                  </div>
                  <div>
                    <label htmlFor="nif" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">NIF</label>
                    <input
                      type="text"
                      id="nif"
                      defaultValue={partenaire?.nif || ''}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                      placeholder="Numéro NIF"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      required
                      defaultValue={partenaire?.email || ''}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                      placeholder="Email de l'entreprise"
                    />
                  </div>
                  <div>
                    <label htmlFor="telephone" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Téléphone</label>
                    <input
                      type="tel"
                      id="telephone"
                      required
                      defaultValue={partenaire?.telephone || ''}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                      placeholder="Numéro de téléphone"
                    />
                  </div>
                  <div>
                    <label htmlFor="adresse" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Adresse</label>
                    <input
                      type="text"
                      id="adresse"
                      required
                      defaultValue={partenaire?.adresse || ''}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                      placeholder="Adresse"
                    />
                  </div>
                  <div>
                    <label htmlFor="siteWeb" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Site Web</label>
                    <input
                      type="url"
                      id="siteWeb"
                      defaultValue={partenaire?.siteWeb || ''}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                      placeholder="Site Web"
                    />
                  </div>
                </div>
              </div>
              
              {/* Section Autres informations */}
              <div>
                <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3">Autres informations</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dateAdhesion" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Date d'adhésion</label>
                    <input
                      type="date"
                      id="dateAdhesion"
                      required
                      defaultValue={partenaire?.dateAdhesion || ''}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="actif"
                      defaultChecked={partenaire?.actif || false}
                      className="h-4 w-4 rounded border-[var(--zalama-border)] text-[var(--zalama-blue)] focus:ring-[var(--zalama-blue)]"
                    />
                    <label htmlFor="actif" className="ml-2 block text-sm text-[var(--zalama-text)]">
                      Partenaire actif
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Boutons de soumission */}
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
                  Enregistrer les modifications
                </button>
              </div>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ModaleModificationPartenaire;
