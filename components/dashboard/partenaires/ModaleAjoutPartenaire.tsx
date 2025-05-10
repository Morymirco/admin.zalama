import React, { useState, useRef } from 'react';
import { X, Upload, Wand2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { toast } from 'react-hot-toast';

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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Références aux champs du formulaire
  const formRef = useRef<HTMLFormElement>(null);

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

  // Gestion du clic sur le bouton de téléchargement
  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };
  
  // Fonction pour préremplir les champs avec des données fictives
  const handlePreFill = () => {
    if (!formRef.current) return;
    
    const form = formRef.current;
    const secteurs = ['Finance', 'Télécommunications', 'Éducation', 'Santé', 'Mines', 'Agriculture'];
    const secteurAleatoire = secteurs[Math.floor(Math.random() * secteurs.length)];
    const typeAleatoire = types[Math.floor(Math.random() * types.length)];
    
    // Préremplir les champs
    (form.querySelector('#nom') as HTMLInputElement).value = `Entreprise ${secteurAleatoire}`;
    (form.querySelector('#type') as HTMLSelectElement).value = typeAleatoire;
    (form.querySelector('#domaine') as HTMLInputElement).value = secteurAleatoire;
    (form.querySelector('#description') as HTMLTextAreaElement).value = `Description détaillée de l'entreprise spécialisée dans le secteur ${secteurAleatoire}.`;
    
    // Représentant
    (form.querySelector('#nomRepresentant') as HTMLInputElement).value = 'Amadou Diallo';
    (form.querySelector('#emailRepresentant') as HTMLInputElement).value = `amadou.diallo@${secteurAleatoire.toLowerCase().replace(' ', '')}.gn`;
    (form.querySelector('#telephoneRepresentant') as HTMLInputElement).value = '+224 628 123 456';
    
    // RH
    (form.querySelector('#nomRH') as HTMLInputElement).value = 'Mariama Camara';
    (form.querySelector('#emailRH') as HTMLInputElement).value = `mariama.camara@${secteurAleatoire.toLowerCase().replace(' ', '')}.gn`;
    (form.querySelector('#telephoneRH') as HTMLInputElement).value = '+224 622 987 654';
    
    // Informations légales
    (form.querySelector('#rccm') as HTMLInputElement).value = `RCCM/GN/2023/B/${Math.floor(Math.random() * 10000)}`;
    (form.querySelector('#nif') as HTMLInputElement).value = `NIF${Math.floor(Math.random() * 1000000000)}`;
    
    // Contact
    (form.querySelector('#email') as HTMLInputElement).value = `contact@${secteurAleatoire.toLowerCase().replace(' ', '')}.gn`;
    (form.querySelector('#telephone') as HTMLInputElement).value = '+224 625 789 123';
    (form.querySelector('#adresse') as HTMLInputElement).value = 'Quartier Almamya, Commune de Kaloum, Conakry, Guinée';
    (form.querySelector('#siteWeb') as HTMLInputElement).value = `www.${secteurAleatoire.toLowerCase().replace(' ', '')}.gn`;
    
    // Autres
    const dateActuelle = new Date();
    const dateAdhesion = new Date(dateActuelle.getFullYear(), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    (form.querySelector('#dateAdhesion') as HTMLInputElement).value = dateAdhesion.toISOString().split('T')[0];
    (form.querySelector('#actif') as HTMLInputElement).checked = true;
    
    toast.success('Formulaire prérempli avec des données fictives');
  };

  // Gestion de la soumission du formulaire
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      // Collecte des données du formulaire
      const form = e.currentTarget;
      
      // Upload du logo si présent
      let logoUrl = '/images/partners/default.png';
      
      if (logoFile) {
        try {
          const storageRef = ref(storage, `logos/${Date.now()}_${logoFile.name}`);
          
          // Afficher un toast pour l'upload
          const uploadToast = toast.loading('Upload du logo en cours...');
          
          await uploadBytes(storageRef, logoFile);
          logoUrl = await getDownloadURL(storageRef);
          
          // Remplacer le toast
          toast.dismiss(uploadToast);
          toast.success('Logo téléchargé avec succès');
        } catch (error) {
          console.error("Erreur lors de l'upload du logo:", error);
          toast.error("Erreur lors de l'upload du logo");
        }
      }
      
      // Structurer les données selon le format attendu par Firestore
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
        
        // Informations légales
        rccm: (form.querySelector('#rccm') as HTMLInputElement)?.value || '',
        nif: (form.querySelector('#nif') as HTMLInputElement)?.value || '',
        
        // Contact
        email: (form.querySelector('#email') as HTMLInputElement)?.value || '',
        telephone: (form.querySelector('#telephone') as HTMLInputElement)?.value || '',
        adresse: (form.querySelector('#adresse') as HTMLInputElement)?.value || '',
        siteWeb: (form.querySelector('#siteWeb') as HTMLInputElement)?.value || '',
        
        // Autres informations
        dateAdhesion: (form.querySelector('#dateAdhesion') as HTMLInputElement)?.value || '',
        actif: (form.querySelector('#actif') as HTMLInputElement)?.checked || false,
        
        // Logo
        logo: logoUrl,
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
    } finally {
      setUploading(false);
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
            <div className="space-y-6">
              {/* Section Logo et Nom */}
              <div className="flex gap-6">
                {/* Logo upload */}
                <div className="w-32">
                  <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">Logo</label>
                  <div 
                    onClick={handleLogoClick}
                    className="w-32 h-32 border-2 border-dashed border-[var(--zalama-border)] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--zalama-bg-lighter)] transition-colors overflow-hidden"
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-[var(--zalama-text-secondary)] mb-2" />
                        <span className="text-xs text-center text-[var(--zalama-text-secondary)]">
                          Cliquez pour télécharger
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      id="logo"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </div>
                </div>
                
                {/* Nom et type */}
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
                        {types.filter(type => type !== 'tous').map(type => (
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
                </div>
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
                      placeholder="Numéro de téléphone"
                    />
                  </div>
                </div>
              </div>
              
              {/* Section Informations légales */}
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
                  <label htmlFor="siteWeb" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Site Web</label>
                  <input
                    type="text"
                    id="siteWeb"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                    placeholder="www.exemple.com"
                  />
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
                      className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="actif"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="relative w-10 h-5 bg-[var(--zalama-bg-lighter)] rounded-full transition peer-checked:bg-[var(--zalama-success)]/20">
                        <div className="dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition peer-checked:left-5 peer-checked:bg-[var(--zalama-success)]"></div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-[var(--zalama-text)]">Actif</span>
                    </label>
                  </div>
                </div>
                
                <div className="mt-3">
                  <label htmlFor="description" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Description</label>
                  <textarea
                    id="description"
                    required
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                    placeholder="Objectifs, rôle, etc."
                  ></textarea>
                </div>
              </div>
              
              {/* Boutons de soumission */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-[var(--zalama-border)] rounded-lg text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)] transition-colors"
                  disabled={uploading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-70"
                  disabled={uploading}
                >
                  {uploading ? "Enregistrement..." : "Enregistrer le partenaire"}
                </button>
              </div>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ModaleAjoutPartenaire;
