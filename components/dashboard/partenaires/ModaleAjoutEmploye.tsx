import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Employe } from './types';
import toast from 'react-hot-toast';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ModaleAjoutEmployeProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employe: Employe) => void;
  partenaireId: string;
}

const ModaleAjoutEmploye: React.FC<ModaleAjoutEmployeProps> = ({
  isOpen,
  onClose,
  onSubmit,
  partenaireId
}) => {
  // États pour les données de l'employé
  const [formData, setFormData] = useState<Partial<Employe>>({
    id: '',
    nom: '',
    prenom: '',
    genre: 'Homme',
    email: '',
    telephone: '',
    adresse: '',
    poste: '',
    role: '',
    typeContrat: 'CDI',
    salaireNet: 0,
    dateEmbauche: new Date().toISOString().split('T')[0]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gestion des changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    
    // Convertir la valeur en nombre pour le salaire
    if (id === 'salaireNet') {
      setFormData({
        ...formData,
        [id]: parseInt(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [id]: value
      });
    }
  };
  
  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Afficher un toast de chargement
      const loadingToast = toast.loading('Ajout de l\'employé en cours...');
      
      // Préparer les données de l'employé
      const employeData = {
        ...formData,
        partenaireId: partenaireId,
        dateCreation: serverTimestamp(),
        nomComplet: `${formData.prenom} ${formData.nom}`
      };
      
      // Ajouter l'employé à Firestore
      const employesRef = collection(db, 'employes');
      const docRef = await addDoc(employesRef, employeData);
      
      // Ajouter l'ID du document à l'objet employé
      const newEmploye: Employe = {
        ...employeData as Employe,
        id: docRef.id
      };
      
      // Créer un compte utilisateur pour l'employé
      if (formData.email) {
        try {
          const response = await fetch('/api/auth/create-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              displayName: `${formData.prenom} ${formData.nom}`,
              role: 'employe',
              partenaireId: partenaireId,
            }),
          });
          
          const data = await response.json();
          
          if (data.success) {
            // Mettre à jour l'employé avec l'ID utilisateur
            await updateDoc(doc(db, 'employes', docRef.id), {
              userId: data.userId,
            });
            
            toast.success('Un email d\'invitation a été envoyé à l\'employé');
          } else {
            console.error('Erreur lors de la création du compte:', data.error);
            toast.error('Impossible de créer un compte pour cet employé');
          }
        } catch (authError) {
          console.error('Erreur lors de la création du compte:', authError);
          toast.error('Impossible de créer un compte pour cet employé');
        }
      }
      
      // Fermer le toast de chargement
      toast.dismiss(loadingToast);
      toast.success('Employé ajouté avec succès!');
      
      // Appel de la fonction onSubmit passée en props
      onSubmit(newEmploye);
      
      // Réinitialiser le formulaire et fermer la modale
      setFormData({
        id: '',
        nom: '',
        prenom: '',
        genre: 'Homme',
        email: '',
        telephone: '',
        adresse: '',
        poste: '',
        role: '',
        typeContrat: 'CDI',
        salaireNet: 0,
        dateEmbauche: new Date().toISOString().split('T')[0]
      });
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'employé:', error);
      toast.error('Une erreur est survenue lors de l\'ajout de l\'employé');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Ajouter un nouvel employé</h3>
          <button 
            type="button" 
            onClick={onClose}
            className="text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-6">
            {/* Informations personnelles */}
            <div>
              <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3">Informations personnelles</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nom</label>
                  <input
                    type="text"
                    id="nom"
                    required
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                    placeholder="Nom de famille"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Prénom</label>
                  <input
                    type="text"
                    id="prenom"
                    required
                    value={formData.prenom}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                    placeholder="Prénom"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="genre" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Genre</label>
                  <select
                    id="genre"
                    required
                    value={formData.genre}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                    disabled={isSubmitting}
                  >
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="adresse" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Adresse</label>
                  <input
                    type="text"
                    id="adresse"
                    required
                    value={formData.adresse}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                    placeholder="Adresse"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
            
            {/* Informations de contact */}
            <div>
              <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3">Informations de contact</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                    placeholder="Email"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="telephone" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Téléphone</label>
                  <input
                    type="tel"
                    id="telephone"
                    required
                    value={formData.telephone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                    placeholder="Numéro de téléphone"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
            
            {/* Informations professionnelles */}
            <div>
              <h4 className="text-md font-semibold text-[var(--zalama-text)] mb-3">Informations professionnelles</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="poste" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Poste</label>
                  <input
                    type="text"
                    id="poste"
                    required
                    value={formData.poste}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                    placeholder="Poste occupé"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Rôle</label>
                  <input
                    type="text"
                    id="role"
                    required
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                    placeholder="Rôle dans l'entreprise"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="typeContrat" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Type de contrat</label>
                  <select
                    id="typeContrat"
                    required
                    value={formData.typeContrat}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                    disabled={isSubmitting}
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                    <option value="Consultant">Consultant</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="salaireNet" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Salaire net (GNF)</label>
                  <input
                    type="number"
                    id="salaireNet"
                    required
                    value={formData.salaireNet}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                    placeholder="Salaire mensuel net"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="dateEmbauche" className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Date d'embauche</label>
                  <input
                    type="date"
                    id="dateEmbauche"
                    required
                    value={formData.dateEmbauche}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--zalama-border)] rounded-lg text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)] transition-colors"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Ajout en cours..." : "Ajouter l'employé"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModaleAjoutEmploye;
