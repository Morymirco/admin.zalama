import React, { useState, useRef } from 'react';
import { X, Upload, Wand2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useFileUpload } from '@/hooks/useFileUpload';

interface ModaleAjoutPartenaireProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  types: string[];
}

const ModaleAjoutPartenaire: React.FC<ModaleAjoutPartenaireProps> = ({
  isOpen,
  onClose,
  onSubmit,
  types
}) => {
  // États pour le logo
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Références aux champs du formulaire
  const formRef = useRef<HTMLFormElement>(null);

  // Hook pour l'upload de fichiers
  const { uploading, uploadProgress, uploadPartnerLogo, validateFile } = useFileUpload();

  // Gestion du téléchargement du logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Valider le fichier
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Fichier invalide');
        return;
      }
      
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

  // Gestion du clic sur le bouton de téléchargement
  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  // Fonction pour nettoyer les numéros de téléphone
  const cleanPhoneNumber = (phone: string): string => {
    // Enlever tous les espaces, tirets et parenthèses
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // S'assurer que le numéro commence par +224
    if (!cleaned.startsWith('+224')) {
      if (cleaned.startsWith('224')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.startsWith('0')) {
        cleaned = '+224' + cleaned.substring(1);
      } else {
        cleaned = '+224' + cleaned;
      }
    }
    
    return cleaned;
  };

  // Fonction de préremplissage automatique
  const handlePreFill = () => {
    const form = formRef.current;
    if (!form) return;

    // Préremplir avec des données de test
    (form.querySelector('#nom') as HTMLInputElement).value = 'Nouvelle Entreprise';
    (form.querySelector('#type') as HTMLSelectElement).value = 'Entreprise';
    (form.querySelector('#domaine') as HTMLInputElement).value = 'Technologie';
    (form.querySelector('#description') as HTMLTextAreaElement).value = 'Description de l\'entreprise...';
    (form.querySelector('#nomRepresentant') as HTMLInputElement).value = 'John Doe';
    (form.querySelector('#emailRepresentant') as HTMLInputElement).value = 'john.doe@entreprise.com';
    (form.querySelector('#telephoneRepresentant') as HTMLInputElement).value = '+224623456789';
    (form.querySelector('#nomRH') as HTMLInputElement).value = 'Jane Smith';
    (form.querySelector('#emailRH') as HTMLInputElement).value = 'jane.smith@entreprise.com';
    (form.querySelector('#telephoneRH') as HTMLInputElement).value = '+224623456790';
    (form.querySelector('#rccm') as HTMLInputElement).value = 'RC/2024/001';
    (form.querySelector('#nif') as HTMLInputElement).value = 'NIF2024001';
    (form.querySelector('#email') as HTMLInputElement).value = 'contact@entreprise.com';
    (form.querySelector('#telephone') as HTMLInputElement).value = '+224623456788';
    (form.querySelector('#adresse') as HTMLInputElement).value = '123 Rue Principale, Conakry';
    (form.querySelector('#siteWeb') as HTMLInputElement).value = 'https://entreprise.com';
    (form.querySelector('#dateAdhesion') as HTMLInputElement).value = new Date().toISOString().split('T')[0];
    (form.querySelector('#actif') as HTMLInputElement).checked = true;

    toast.success('Formulaire prérempli avec des données de test');
  };

  // Gestion de la soumission du formulaire
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const form = e.currentTarget;
      
      // Upload du logo
      let logoUrl = '';

      // Upload du logo si un fichier est sélectionné
      if (logoFile) {
        // Générer un ID temporaire pour le partenaire
        const tempPartnerId = `temp_${Date.now()}`;
        
        const uploadResult = await uploadPartnerLogo(logoFile, tempPartnerId);
        if (uploadResult.error) {
          toast.error('Erreur lors de l\'upload du logo');
          return;
        }
        logoUrl = uploadResult.url;
      }
      
      // Structurer les données selon le format attendu par Supabase
      const formData = {
        // Informations sur l'entreprise
        nom: (form.querySelector('#nom') as HTMLInputElement)?.value || '',
        type: (form.querySelector('#type') as HTMLSelectElement)?.value || '',
        secteur: (form.querySelector('#domaine') as HTMLInputElement)?.value || '',
        description: (form.querySelector('#description') as HTMLTextAreaElement)?.value || '',
        
        // Représentant
        nom_representant: (form.querySelector('#nomRepresentant') as HTMLInputElement)?.value || '',
        email_representant: (form.querySelector('#emailRepresentant') as HTMLInputElement)?.value || '',
        telephone_representant: cleanPhoneNumber((form.querySelector('#telephoneRepresentant') as HTMLInputElement)?.value || ''),
        
        // Responsable RH
        nom_rh: (form.querySelector('#nomRH') as HTMLInputElement)?.value || '',
        email_rh: (form.querySelector('#emailRH') as HTMLInputElement)?.value || '',
        telephone_rh: cleanPhoneNumber((form.querySelector('#telephoneRH') as HTMLInputElement)?.value || ''),
        
        // Informations légales
        rccm: (form.querySelector('#rccm') as HTMLInputElement)?.value || '',
        nif: (form.querySelector('#nif') as HTMLInputElement)?.value || '',
        
        // Contact
        email: (form.querySelector('#email') as HTMLInputElement)?.value || '',
        telephone: cleanPhoneNumber((form.querySelector('#telephone') as HTMLInputElement)?.value || ''),
        adresse: (form.querySelector('#adresse') as HTMLInputElement)?.value || '',
        site_web: (form.querySelector('#siteWeb') as HTMLInputElement)?.value || '',
        
        // Autres informations
        logo_url: logoUrl,
        actif: (form.querySelector('#actif') as HTMLInputElement)?.checked || false,
        nombre_employes: 0,
        salaire_net_total: 0
      };
      
      // Stockage temporaire des données
      (window as any).formData = formData;
      
      // Appel de la fonction onSubmit passée en props
      onSubmit(e);
      
      // Fermer la modale après soumission
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      toast.error('Une erreur est survenue lors de la soumission du formulaire');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Ajouter un nouveau partenaire</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePreFill}
              className="flex items-center gap-1 text-[var(--zalama-blue)] hover:text-[var(--zalama-blue-accent)] transition-colors"
              type="button"
            >
              <Wand2 className="h-4 w-4" />
              <span className="text-sm">Préremplir</span>
            </button>
            <button 
              onClick={onClose}
              className="text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <form ref={formRef} onSubmit={handleFormSubmit} className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section Logo */}
            <div className="lg:col-span-1">
              <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3">Logo de l'entreprise</h4>
              
              <div className="space-y-4">
                <div 
                  onClick={handleLogoClick}
                  className="relative w-full h-48 border-2 border-dashed border-[var(--zalama-border)] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[var(--zalama-blue)] transition-colors"
                >
                  {logoPreview ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={logoPreview} 
                        alt="Aperçu du logo" 
                        className="w-full h-full object-contain rounded-lg"
                      />
                      {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <div className="text-white text-center">
                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <div className="text-sm">Upload en cours... {uploadProgress}%</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-[var(--zalama-text-secondary)] mx-auto mb-2" />
                      <p className="text-sm text-[var(--zalama-text-secondary)]">
                        Cliquez pour télécharger un logo
                      </p>
                      <p className="text-xs text-[var(--zalama-text-secondary)] mt-1">
                        PNG, JPG, GIF jusqu'à 5MB
                      </p>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </div>
                
                {logoFile && (
                  <div className="text-xs text-[var(--zalama-text-secondary)]">
                    <p>Fichier sélectionné : {logoFile.name}</p>
                    <p>Taille : {(logoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Section Informations */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Informations de base */}
                <div>
                  <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3">Informations de base</h4>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <label htmlFor="nom" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nom de l'entreprise</label>
                      <input
                        type="text"
                        id="nom"
                        required
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
                          className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                        >
                          <option value="">Sélectionner un type</option>
                          {types.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="domaine" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Domaine d'activité</label>
                        <input
                          type="text"
                          id="domaine"
                          required
                          className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                          placeholder="Domaine d'activité"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Description</label>
                      <textarea
                        id="description"
                        required
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                        placeholder="Description de l'entreprise"
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                {/* Représentant */}
                <div>
                  <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3">Représentant</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="nomRepresentant" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nom complet</label>
                      <input
                        type="text"
                        id="nomRepresentant"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                        placeholder="Nom du représentant"
                      />
                    </div>
                    <div>
                      <label htmlFor="emailRepresentant" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Email</label>
                      <input
                        type="email"
                        id="emailRepresentant"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                        placeholder="Email du représentant"
                      />
                    </div>
                    <div>
                      <label htmlFor="telephoneRepresentant" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Téléphone</label>
                      <input
                        type="tel"
                        id="telephoneRepresentant"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                        placeholder="Téléphone du représentant"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Responsable RH */}
                <div>
                  <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3">Responsable RH</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="nomRH" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nom complet</label>
                      <input
                        type="text"
                        id="nomRH"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                        placeholder="Nom du responsable RH"
                      />
                    </div>
                    <div>
                      <label htmlFor="emailRH" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Email</label>
                      <input
                        type="email"
                        id="emailRH"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                        placeholder="Email du responsable RH"
                      />
                    </div>
                    <div>
                      <label htmlFor="telephoneRH" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Téléphone</label>
                      <input
                        type="tel"
                        id="telephoneRH"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                        placeholder="Téléphone du responsable RH"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Informations légales et contact */}
                <div>
                  <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3">Informations légales et contact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="rccm" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">RCCM</label>
                      <input
                        type="text"
                        id="rccm"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                        placeholder="Numéro RCCM"
                      />
                    </div>
                    <div>
                      <label htmlFor="nif" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">NIF</label>
                      <input
                        type="text"
                        id="nif"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                        placeholder="Numéro NIF"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Email professionnel</label>
                      <input
                        type="email"
                        id="email"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                        placeholder="Email de contact"
                      />
                    </div>
                    <div>
                      <label htmlFor="telephone" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Téléphone</label>
                      <input
                        type="tel"
                        id="telephone"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                        placeholder="Numéro de téléphone"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <label htmlFor="adresse" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Adresse</label>
                    <input
                      type="text"
                      id="adresse"
                      required
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                      placeholder="Adresse complète"
                    />
                  </div>
                  
                  <div className="mt-3">
                    <label htmlFor="siteWeb" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Site web</label>
                    <input
                      type="url"
                      id="siteWeb"
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                      placeholder="https://www.entreprise.com"
                    />
                  </div>
                </div>
                
                {/* Autres informations */}
                <div>
                  <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3">Autres informations</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="dateAdhesion" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Date d'adhésion</label>
                      <input
                        type="date"
                        id="dateAdhesion"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="actif"
                        defaultChecked={true}
                        className="h-4 w-4 rounded border-[var(--zalama-border)] text-[var(--zalama-blue)] focus:ring-[var(--zalama-blue)]"
                      />
                      <label htmlFor="actif" className="ml-2 block text-sm text-[var(--zalama-text)]">
                        Partenaire actif
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Boutons de soumission */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--zalama-border)] rounded-lg text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)] transition-colors"
              // disabled={uploading} // DÉSACTIVÉ TEMPORAIREMENT
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-70"
              // disabled={uploading} // DÉSACTIVÉ TEMPORAIREMENT
            >
              {/* {uploading ? "Enregistrement..." : "Enregistrer le partenaire"} */}
              Enregistrer le partenaire
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModaleAjoutPartenaire;
