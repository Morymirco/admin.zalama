"use client";

import ModaleAjoutEmploye from '@/components/dashboard/partenaires/ModaleAjoutEmploye';
import ModaleModificationPartenaire from '@/components/dashboard/partenaires/ModaleModificationPartenaire';
import { Employe } from '@/components/dashboard/partenaires/types';
import { db } from '@/lib/firebase';
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { ArrowLeft, Briefcase, Calendar, CheckCircle, CreditCard, DollarSign, Download, Edit, FileText, Mail, MapPin, Phone, Upload, UserPlus, Users, XCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// Types pour cette page
interface PartenaireDetail {
  id: string;
  // Informations sur l'entreprise
  nom: string;
  type: string;
  secteur: string;
  description: string;
  
  // Représentant
  nomRepresentant: string;
  emailRepresentant: string;
  telephoneRepresentant: string;
  
  // Responsable RH
  nomRH: string;
  emailRH: string;
  telephoneRH: string;
  
  // Informations légales et contact
  rccm: string;
  nif: string;
  email: string;
  telephone: string;
  adresse: string;
  siteWeb: string;
  
  // Autres informations
  logo: string;
  dateAdhesion: string;
  actif: boolean;
  
  // Informations sur les employés
  nombreEmployes: number;
  employes: Employe[];
  salaireNetTotal: number;
  contratsCounts: Record<string, number>;
}

// Type pour les demandes d'avance sur salaire
interface DemandeAvanceSalaire {
  id: string;
  employeId: string;
  employeNom: string;
  employePrenom: string;
  montantDemande: number;
  motif: string;
  dateDemande: string;
  statut: 'EN_ATTENTE' | 'APPROUVE' | 'REFUSE' | 'PAYE';
  commentaire?: string;
  dateTraitement?: string;
  numeroReception?: string;
}

// Type pour les transactions
interface Transaction {
  id?: string;
  demandeAvanceId: string;
  employeId: string;
  employeNom: string;
  employePrenom: string;
  employeEmail: string;
  entrepriseId: string;
  entrepriseNom: string;
  entrepriseEmailRH: string;
  montant: number;
  numeroTransaction: string;
  methodePaiement: string;
  numeroCompte: string;
  numeroReception?: string;
  dateTransaction: string;
  recu?: string; // URL du fichier reçu
  dateCreation: string;
  statut: 'EFFECTUEE' | 'ANNULEE';
}

// Fonction pour envoyer un email via l'API Resend
const envoyerEmail = async (to: string, subject: string, content: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html: content,
        from: 'contact@zalamagn.com'
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.details || result.error || `Erreur HTTP: ${response.status}`);
    }
    
    console.log('✅ Email envoyé avec succès via Resend:', result);
    return true;
    
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return false;
  }
};

// Fonction pour uploader un fichier vers Firebase Storage
const uploadReceiptToStorage = async (file: File, transactionId: string): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('transactionId', transactionId);

    const response = await fetch('/api/upload-receipt', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.details || result.error || `Erreur HTTP: ${response.status}`);
    }

    console.log('✅ Fichier uploadé avec succès:', result);
    return result.url;

  } catch (error) {
    console.error('❌ Erreur upload fichier:', error);
    return null;
  }
};

// Template HTML pour les emails
const genererTemplateEmail = (titre: string, contenu: string, entreprise: string): string => {
  const htmlTemplate = 
    '<!DOCTYPE html>' +
    '<html>' +
    '<head>' +
    '<meta charset="utf-8">' +
    '<style>' +
    'body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }' +
    '.container { max-width: 600px; margin: 0 auto; padding: 20px; }' +
    '.header { background: #2563eb; color: white; padding: 20px; text-align: center; }' +
    '.content { padding: 20px; background: #f9fafb; }' +
    '.footer { text-align: center; padding: 10px; font-size: 12px; color: #666; }' +
    '.highlight { background: #e5f3ff; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0; }' +
    '</style>' +
    '</head>' +
    '<body>' +
    '<div class="container">' +
    '<div class="header">' +
    '<h1>' + titre + '</h1>' +
    '</div>' +
    '<div class="content">' +
    contenu +
    '</div>' +
    '<div class="footer">' +
    '<p>Cet email a été envoyé automatiquement par le système Zalama.<br>' +
    'Entreprise: ' + entreprise + '</p>' +
    '</div>' +
    '</div>' +
    '</body>' +
    '</html>';
  
  return htmlTemplate;
};

export default function PartenaireDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [partenaire, setPartenaire] = useState<PartenaireDetail | null>(null);
  const [demandesAvance, setDemandesAvance] = useState<DemandeAvanceSalaire[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'infos' | 'employes' | 'avances' | 'transactions'>('infos');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showModificationModal, setShowModificationModal] = useState(false);
  const [showAjoutEmployeModal, setShowAjoutEmployeModal] = useState(false);
  
  // États pour les modales des demandes d'avance
  const [showApprobationModal, setShowApprobationModal] = useState(false);
  const [showRefusModal, setShowRefusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState<DemandeAvanceSalaire | null>(null);
  
  // États pour les modales des transactions
  const [showTransactionDetailsModal, setShowTransactionDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Récupération des données du partenaire
  useEffect(() => {
    const fetchPartenaire = async () => {
      setIsLoading(true);
      
      try {
        const partenaireId = params.id as string;
        
        // Récupérer le document du partenaire depuis Firestore
        const partenaireRef = doc(db, 'partenaires', partenaireId);
        const partenaireSnap = await getDoc(partenaireRef);
        
        if (!partenaireSnap.exists()) {
          toast.error('Partenaire non trouvé');
          router.push('/dashboard/partenaires');
          return;
        }
        
        const partenaireData = partenaireSnap.data();
        
        // Récupérer les employés du partenaire (si vous avez une collection d'employés)
        let employes: Employe[] = [];
        let salaireNetTotal = 0;
        let contratsCounts: Record<string, number> = {};
        
        try {
          // Supposons que vous avez une collection 'employes' avec un champ 'partenaireId'
          const employesRef = collection(db, 'employes');
          const employesQuery = query(employesRef, where('partenaireId', '==', partenaireId));
          const employesSnap = await getDocs(employesQuery);
          
          employes = employesSnap.docs.map(doc => {
            const data = doc.data() as Employe;
            // Calculer le salaire total
            salaireNetTotal += data.salaireNet || 0;
            
            // Compter les types de contrats
            const typeContrat = data.typeContrat || 'Autre';
            contratsCounts[typeContrat] = (contratsCounts[typeContrat] || 0) + 1;
            
            return {
              ...data
            };
          });
        } catch (error) {
          console.error('Erreur lors de la récupération des employés:', error);
          // Continuer même si la récupération des employés échoue
        }

        // Récupérer les demandes d'avance sur salaire
        try {
          // Étape 1 : Récupérer tous les documents de la collection employees
          const employeesRef = collection(db, 'employes'); // Nom de la collection (ajuster si nécessaire)
          const employeesSnap = await getDocs(employeesRef);
        
        
          // Extraire les ID des documents (employeId)
          const employeeIds = employeesSnap.docs.map(doc => doc.id);

          console.log(employeeIds);
        
          if (employeeIds.length > 0) {
            // Étape 2 : Rechercher les demandes d'avance pour tous les employeId
            const avancesRef = collection(db, 'salary_advance_requests');
            const avancesQuery = query(avancesRef, where('employeId', 'in', employeeIds)); // Utiliser 'in' pour interroger plusieurs IDs
            const avancesSnap = await getDocs(avancesQuery);
        
            
            const demandes = avancesSnap.docs.map(doc => {
              const data = doc.data();
              // Récupérer les données de l'employé correspondant pour nom et prénom
              const employeeDoc = employeesSnap.docs.find(emp => emp.id === data.employeId);
              return {
                id: doc.id,
                employeId: data.employeId,
                employeNom: employeeDoc?.data().nom || data.employeNom || '',
                employePrenom: employeeDoc?.data().prenom || data.employePrenom || '',
                montantDemande: data.montantDemande || 0,
                motif: data.motif || '',
                dateDemande: data.dateCreation || '',
                  statut: data.statut || 'EN_ATTENTE',
                commentaire: data.commentaire || '',
                dateTraitement: data.dateTraitement || '',
                numeroReception: data.numeroReception || '',
              } as DemandeAvanceSalaire;
            });
        
            setDemandesAvance(demandes);
          } else {
            console.log('Aucun employé trouvé dans la collection employees');
            setDemandesAvance([]);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des demandes d\'avance :', error);
        }

        // Récupérer les transactions du partenaire
        try {
          const transactionsRef = collection(db, 'transactions');
          const transactionsQuery = query(transactionsRef, where('entrepriseId', '==', partenaireId));
          const transactionsSnap = await getDocs(transactionsQuery);
          
          const transactionsList = transactionsSnap.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data
            } as Transaction;
          });
          
          // Trier par date de création (plus récent en premier)
          transactionsList.sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
          
          setTransactions(transactionsList);
        } catch (error) {
          console.error('Erreur lors de la récupération des transactions:', error);
          setTransactions([]);
        }
        
        // Construire l'objet partenaire complet
        const partenaireDetail: PartenaireDetail = {
          id: partenaireId,
          nom: partenaireData.nom || '',
          type: partenaireData.type || '',
          secteur: partenaireData.secteur || '',
          description: partenaireData.description || '',
          
          // Extraire les données du représentant
          nomRepresentant: partenaireData.representant?.nom || '',
          emailRepresentant: partenaireData.representant?.email || '',
          telephoneRepresentant: partenaireData.representant?.telephone || '',
          
          // Extraire les données RH
          nomRH: partenaireData.rh?.nom || '',
          emailRH: partenaireData.rh?.email || '',
          telephoneRH: partenaireData.rh?.telephone || '',
          
          // Extraire les informations légales
          rccm: partenaireData.infoLegales?.rccm || '',
          nif: partenaireData.infoLegales?.nif || '',
          
          // Informations de contact
          email: partenaireData.email || '',
          telephone: partenaireData.telephone || '',
          adresse: partenaireData.adresse || '',
          siteWeb: partenaireData.siteWeb || '',
          
          // Autres informations
          logo: partenaireData.logo || '/images/partners/default.png',
          dateAdhesion: partenaireData.datePartenariat || '',
          actif: partenaireData.actif || false,
          
          // Informations sur les employés
          nombreEmployes: employes.length,
          employes,
          salaireNetTotal,
          contratsCounts
        };
        
        setPartenaire(partenaireDetail);
      } catch (error) {
        console.error('Erreur lors de la récupération du partenaire:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (params.id) {
      fetchPartenaire();
    }
  }, [params.id, router]);

  // Gestion de l'affichage des détails d'une transaction
  const handleVoirDetailsTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetailsModal(true);
  };

  // Retour à la liste des partenaires
  const handleRetour = () => {
    router.push('/dashboard/partenaires');
  };

  // Gestion de l'import d'employés via Excel
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Afficher un toast de chargement
      const loadingToast = toast.loading('Importation des employés en cours...');
      
      // Simulation d'import (à remplacer par l'implémentation réelle)
      setTimeout(() => {
        // Remplacer le toast de chargement par un toast de succès
        toast.dismiss(loadingToast);
        toast.success('Employés importés avec succès!');
        setShowImportModal(false);
      }, 1000);
    }
  };

  // Export des données des employés au format Excel
  const handleExportExcel = () => {
    // Afficher un toast de chargement
    const loadingToast = toast.loading('Export des données des employés en cours...');
    
    // Simulation d'export (à remplacer par l'implémentation réelle)
    setTimeout(() => {
      // Remplacer le toast de chargement par un toast de succès
      toast.dismiss(loadingToast);
      toast.success('Données exportées avec succès!');
    }, 1500);
  };
  
  // Gestion de la modification du partenaire
  const handleModificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Récupération des données du formulaire
    const formData = (window as any).formData;
    
    if (!formData || !partenaire) {
      toast.error('Données du formulaire non disponibles');
      return;
    }
    
    // Afficher un toast de chargement
    const loadingToast = toast.loading('Mise à jour du partenaire en cours...');
    
    try {
      // Préparer les données à mettre à jour
      const partenaireUpdates = {
        nom: formData.nom,
        type: formData.type,
        secteur: formData.domaine,
        description: formData.description,
        adresse: formData.adresse,
        email: formData.email,
        telephone: formData.telephone,
        siteWeb: formData.siteWeb || '',
        datePartenariat: formData.dateAdhesion || '',
        actif: formData.actif,
        representant: {
          nom: formData.nomRepresentant || '',
          email: formData.emailRepresentant || '',
          telephone: formData.telephoneRepresentant || ''
        },
        rh: {
          nom: formData.nomRH || '',
          email: formData.emailRH || '',
          telephone: formData.telephoneRH || ''
        },
        infoLegales: {
          rccm: formData.rccm || '',
          nif: formData.nif || ''
        }
      };
      
      // Mettre à jour le document dans Firestore
      const partenaireRef = doc(db, 'partenaires', partenaire.id);
      await updateDoc(partenaireRef, partenaireUpdates);
      
      // Mettre à jour l'état local
      setPartenaire({
        ...partenaire,
        nom: formData.nom,
        type: formData.type,
        secteur: formData.domaine,
        description: formData.description,
        nomRepresentant: formData.nomRepresentant,
        emailRepresentant: formData.emailRepresentant,
        telephoneRepresentant: formData.telephoneRepresentant,
        nomRH: formData.nomRH,
        emailRH: formData.emailRH,
        telephoneRH: formData.telephoneRH,
        rccm: formData.rccm,
        nif: formData.nif,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        siteWeb: formData.siteWeb,
        dateAdhesion: formData.dateAdhesion,
        actif: formData.actif,
      });
      
      // Fermer la modale
      setShowModificationModal(false);
      
      // Remplacer le toast de chargement par un toast de succès
      toast.dismiss(loadingToast);
      toast.success('Partenaire modifié avec succès!');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du partenaire:', error);
      toast.dismiss(loadingToast);
      toast.error('Erreur lors de la mise à jour du partenaire');
    }
  };
  
  // Gestion de l'ajout d'un employé
  const handleAjoutEmploye = (employe: Employe) => {
    // Afficher un toast de chargement
    const loadingToast = toast.loading('Ajout de l\'employé en cours...');
    
    // Simulation d'ajout (à remplacer par l'implémentation réelle)
    setTimeout(() => {
      if (partenaire) {
        // Mise à jour des données locales
        const newEmployes = [...partenaire.employes, employe];
        const newSalaireTotal = partenaire.salaireNetTotal + employe.salaireNet;
        
        // Mise à jour des compteurs de contrats
        const newContratsCounts = { ...partenaire.contratsCounts };
        newContratsCounts[employe.typeContrat] = (newContratsCounts[employe.typeContrat] || 0) + 1;
        
        setPartenaire({
          ...partenaire,
          nombreEmployes: partenaire.nombreEmployes + 1,
          employes: newEmployes,
          salaireNetTotal: newSalaireTotal,
          contratsCounts: newContratsCounts
        });
      }
      
      // Remplacer le toast de chargement par un toast de succès
      toast.dismiss(loadingToast);
      toast.success('Employé ajouté avec succès!');
    }, 1000);
  };

  // Gestion de l'approbation d'une demande d'avance
  const handleApprouverDemande = (demande: DemandeAvanceSalaire) => {
    setSelectedDemande(demande);
    setShowApprobationModal(true);
  };

  // Gestion du refus d'une demande d'avance
  const handleRefuserDemande = (demande: DemandeAvanceSalaire) => {
    setSelectedDemande(demande);
    setShowRefusModal(true);
  };

  // Gestion de l'affichage des détails d'une demande
  const handleVoirDetails = (demande: DemandeAvanceSalaire) => {
    setSelectedDemande(demande);
    setShowDetailsModal(true);
  };

  // Traitement de l'approbation avec paiement
  const handleEffectuerTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedDemande || !partenaire) return;
    
    const formData = new FormData(e.currentTarget);
    const numeroTransaction = formData.get('numeroTransaction') as string;
    const methodePaiement = formData.get('methodePaiement') as string;
    const numeroCompte = formData.get('numeroCompte') as string;
    const dateTransaction = formData.get('dateTransaction') as string;
    const recuFile = formData.get('recu') as File;
    
    const loadingToast = toast.loading('Traitement de la transaction en cours...');
    
    try {
      // 1. Récupérer les informations détaillées de l'employé
      const employeRef = doc(db, 'employes', selectedDemande.employeId);
      const employeSnap = await getDoc(employeRef);
      
      if (!employeSnap.exists()) {
        throw new Error('Employé non trouvé');
      }
      
      const employeData = employeSnap.data();
      
      // 2. Créer d'abord la transaction pour avoir l'ID
      const transactionData: Omit<Transaction, 'id'> = {
        demandeAvanceId: selectedDemande.id,
        employeId: selectedDemande.employeId,
        employeNom: selectedDemande.employeNom,
        employePrenom: selectedDemande.employePrenom,
        employeEmail: employeData.email || '',
        entrepriseId: partenaire.id,
        entrepriseNom: partenaire.nom,
        entrepriseEmailRH: partenaire.emailRH,
        montant: selectedDemande.montantDemande,
        numeroTransaction,
        methodePaiement,
        numeroCompte,
        dateTransaction,
        dateCreation: new Date().toISOString(),
        statut: 'EFFECTUEE'
      };
      
      const transactionRef = await addDoc(collection(db, 'transactions'), transactionData);
      const transactionId = transactionRef.id;
      console.log('✅ Transaction créée avec ID:', transactionId);
      
      // 3. Upload du fichier reçu si présent
      let recuUrl: string | null = null;
      if (recuFile && recuFile.size > 0) {
        toast.loading('Upload du reçu en cours...', { id: loadingToast });
        recuUrl = await uploadReceiptToStorage(recuFile, transactionId);
        
        if (recuUrl) {
          // Mettre à jour la transaction avec l'URL du reçu
          await updateDoc(transactionRef, { recu: recuUrl });
          console.log('✅ Reçu uploadé et URL sauvegardée:', recuUrl);
        } else {
          console.warn('⚠️ Échec de l\'upload du reçu, mais la transaction continue');
        }
      }
      
      // 4. Mettre à jour la demande d'avance dans Firestore
      const demandeRef = doc(db, 'salary_advance_requests', selectedDemande.id);
      await updateDoc(demandeRef, {
        statut: 'APPROUVE',
        dateTraitement: new Date().toISOString(),
      });
      
      // 5. Envoyer les emails via l'API Resend
      toast.loading('Envoi des notifications par email...', { id: loadingToast });
      const emailPromises = [];
      
      // Email à l'employé avec template HTML
      if (employeData.email) {
        const employeEmailContent = `
          <h2>Votre avance sur salaire a été approuvée ✅</h2>
          <p>Bonjour <strong>${selectedDemande.employeNom} ${selectedDemande.employePrenom}</strong>,</p>
          <p>Nous avons le plaisir de vous informer que votre demande d'avance sur salaire a été approuvée et que la transaction a été effectuée avec succès.</p>
          
          <div class="highlight">
            <h3>📋 Détails de la transaction</h3>
            <ul>
              <li><strong>Montant :</strong> ${selectedDemande.montantDemande.toLocaleString()} GNF</li>
              <li><strong>Méthode de paiement :</strong> ${methodePaiement}</li>
              <li><strong>Numéro de transaction :</strong> ${numeroTransaction}</li>
              <li><strong>Compte de réception :</strong> ${numeroCompte}</li>
              <li><strong>Date de traitement :</strong> ${new Date(dateTransaction).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</li>
              <li><strong>Motif :</strong> ${selectedDemande.motif}</li>
            </ul>
          </div>
          
          <p>💰 <strong>L'argent devrait être disponible sur votre compte sous peu.</strong></p>
          
          ${recuUrl ? `<p>📄 <a href="${recuUrl}" target="_blank">Télécharger le reçu de transaction</a></p>` : ''}
          
          <p>Si vous avez des questions concernant cette transaction, n'hésitez pas à contacter votre service RH.</p>
          
          <p>Cordialement,<br>
          L'équipe RH</p>
        `;
        
        const employeEmailHTML = genererTemplateEmail(
          'Avance sur salaire approuvée',
          employeEmailContent,
          partenaire.nom
        );
        
        emailPromises.push(
          envoyerEmail(
            employeData.email,
            `✅ Avance sur salaire approuvée - ${selectedDemande.montantDemande.toLocaleString()} GNF`,
            employeEmailHTML
          )
        );
      }
      
      // Email au RH de l'entreprise avec template HTML
      if (partenaire.emailRH) {
        const rhEmailContent = `
          <h2>Transaction d'avance sur salaire effectuée 💳</h2>
          <p>Bonjour,</p>
          <p>Une transaction d'avance sur salaire a été effectuée avec succès pour un employé de votre entreprise.</p>
          
          <div class="highlight">
            <h3>👤 Informations de l'employé</h3>
            <ul>
              <li><strong>Nom complet :</strong> ${selectedDemande.employeNom} ${selectedDemande.employePrenom}</li>
              <li><strong>Email :</strong> ${employeData.email || 'Non renseigné'}</li>
              <li><strong>ID Employé :</strong> ${selectedDemande.employeId}</li>
            </ul>
          </div>
          
          <div class="highlight">
            <h3>💰 Détails de la transaction</h3>
            <ul>
              <li><strong>ID Transaction :</strong> ${transactionId}</li>
              <li><strong>Montant :</strong> ${selectedDemande.montantDemande.toLocaleString()} GNF</li>
              <li><strong>Méthode de paiement :</strong> ${methodePaiement}</li>
              <li><strong>Numéro de transaction :</strong> ${numeroTransaction}</li>
              <li><strong>Compte de réception :</strong> ${numeroCompte}</li>
              <li><strong>Date de traitement :</strong> ${new Date(dateTransaction).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</li>
              <li><strong>Motif de la demande :</strong> ${selectedDemande.motif}</li>
              <li><strong>Date de la demande :</strong> ${new Date(selectedDemande.dateDemande).toLocaleDateString('fr-FR')}</li>
            </ul>
          </div>
          
          ${recuUrl ? `<p>📄 <a href="${recuUrl}" target="_blank">Voir le reçu de transaction</a></p>` : ''}
          
          <p>Cette transaction a été automatiquement enregistrée dans le système. Vous pouvez consulter l'historique complet des transactions dans votre tableau de bord.</p>
          
          <p>Cordialement,<br>
          Système de gestion Zalama</p>
        `;
        
        const rhEmailHTML = genererTemplateEmail(
          'Transaction d\'avance effectuée',
          rhEmailContent,
          'Système Zalama'
        );
        
        emailPromises.push(
          envoyerEmail(
            partenaire.emailRH,
            `💳 Transaction d'avance effectuée - ${selectedDemande.employeNom} ${selectedDemande.employePrenom}`,
            rhEmailHTML
          )
        );
      }
      
      // 6. Attendre l'envoi des emails
      const emailResults = await Promise.allSettled(emailPromises);
      const emailsEnvoyes = emailResults.filter(result => result.status === 'fulfilled').length;
      const emailsEchoues = emailResults.filter(result => result.status === 'rejected').length;
      
      // 7. Mise à jour locale
      setDemandesAvance(prev => 
        prev.map(d => 
          d.id === selectedDemande.id 
            ? { ...d, statut: 'APPROUVE' as const, dateTraitement: new Date().toISOString() }
            : d
        )
      );
      
      setShowApprobationModal(false);
      setSelectedDemande(null);
      
      toast.dismiss(loadingToast);
      
      let successMessage = `Transaction effectuée avec succès! (ID: ${transactionId})`;
      if (recuUrl) successMessage += ' Reçu uploadé.';
      if (emailsEnvoyes > 0) successMessage += ` ${emailsEnvoyes} email(s) envoyé(s).`;
      if (emailsEchoues > 0) successMessage += ` ${emailsEchoues} email(s) échoué(s).`;
      
      toast.success(successMessage);
      
    } catch (error) {
      console.error('Erreur lors du traitement de la transaction:', error);
      toast.dismiss(loadingToast);
      toast.error('Erreur lors du traitement de la transaction: ' + (error as Error).message);
    }
  };

  // Traitement du refus
  const handleConfirmerRefus = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedDemande) return;
    
    const formData = new FormData(e.currentTarget);
    const commentaire = formData.get('commentaire') as string;
    
    const loadingToast = toast.loading('Refus de la demande en cours...');
    
    try {
      // TODO: Mettre à jour la demande dans Firestore
      // const demandeRef = doc(db, 'salary_advance_requests', selectedDemande.id);
      // await updateDoc(demandeRef, {
      //   statut: 'REFUSE',
      //   dateTraitement: new Date().toISOString(),
      //   commentaire
      // });
      
      // Mise à jour locale
      setDemandesAvance(prev => 
        prev.map(d => 
          d.id === selectedDemande.id 
            ? { ...d, statut: 'REFUSE' as const, dateTraitement: new Date().toISOString(), commentaire }
            : d
        )
      );
      
      setShowRefusModal(false);
      setSelectedDemande(null);
      
      toast.dismiss(loadingToast);
      toast.success('Demande refusée avec succès!');
    } catch (error) {
      console.error('Erreur lors du refus de la demande:', error);
      toast.dismiss(loadingToast);
      toast.error('Erreur lors du refus de la demande');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--zalama-blue)]"></div>
      </div>
    );
  }

  if (!partenaire) {
    return (
      <div className="p-6">
        <div className="bg-[var(--zalama-danger)]/10 text-[var(--zalama-danger)] p-4 rounded-lg">
          <h3 className="font-semibold">Partenaire non trouvé</h3>
          <p>Le partenaire que vous recherchez n'existe pas ou a été supprimé.</p>
          <button
            onClick={handleRetour}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-[var(--zalama-blue)] text-white rounded-lg hover:bg-[var(--zalama-blue-accent)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={handleRetour}
            className="p-2 rounded-full hover:bg-[var(--zalama-bg-lighter)] transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-[var(--zalama-text)]" />
          </button>
          <h2 className="text-2xl font-semibold text-[var(--zalama-text)]">{partenaire.nom}</h2>
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            partenaire.actif 
              ? 'bg-[var(--zalama-success)]/20 text-[var(--zalama-success)]' 
              : 'bg-[var(--zalama-danger)]/20 text-[var(--zalama-danger)]'
          }`}>
            {partenaire.actif ? 'Actif' : 'Inactif'}
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowModificationModal(true)}
            className="flex items-center gap-1 px-4 py-2 border border-[var(--zalama-border)] rounded-lg hover:bg-[var(--zalama-bg-lighter)] transition-colors text-[var(--zalama-text)]"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </button>
        </div>
      </div>
      
      {/* Carte d'informations principales */}
      <div className="flex gap-6 bg-[var(--zalama-card)] rounded-xl p-6 shadow-sm">
        <div className="w-32 h-32 rounded-lg overflow-hidden">
          <img 
            src={partenaire.logo} 
            alt={`Logo de ${partenaire.nom}`} 
            className="w-full h-full object-contain bg-white p-2"
          />
        </div>
        
        <div className="flex-1 grid grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Type</h3>
            <p className="font-medium text-[var(--zalama-text)]">{partenaire.type}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Secteur</h3>
            <p className="font-medium text-[var(--zalama-text)]">{partenaire.secteur}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Date d'adhésion</h3>
            <p className="font-medium text-[var(--zalama-text)]">
              {new Date(partenaire.dateAdhesion).toLocaleDateString('fr-FR')}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Email</h3>
            <p className="font-medium text-[var(--zalama-text)]">{partenaire.email}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Téléphone</h3>
            <p className="font-medium text-[var(--zalama-text)]">{partenaire.telephone}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Site Web</h3>
            <p className="font-medium text-[var(--zalama-text)]">{partenaire.siteWeb}</p>
          </div>
        </div>
      </div>
      
      {/* Statistiques des employés */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[var(--zalama-card)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--zalama-blue)]/10">
              <Users className="h-5 w-5 text-[var(--zalama-blue)]" />
            </div>
            <h3 className="text-[var(--zalama-text-secondary)]">Employés</h3>
          </div>
          <p className="text-2xl font-semibold text-[var(--zalama-text)]">{partenaire.nombreEmployes}</p>
        </div>
        
        <div className="bg-[var(--zalama-card)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--zalama-success)]/10">
              <CreditCard className="h-5 w-5 text-[var(--zalama-success)]" />
            </div>
            <h3 className="text-[var(--zalama-text-secondary)]">Salaire total</h3>
          </div>
          <p className="text-2xl font-semibold text-[var(--zalama-text)]">
            {partenaire.salaireNetTotal.toLocaleString()} GNF
          </p>
        </div>
        
        <div className="bg-[var(--zalama-card)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--zalama-warning)]/10">
              <Briefcase className="h-5 w-5 text-[var(--zalama-warning)]" />
            </div>
            <h3 className="text-[var(--zalama-text-secondary)]">CDI</h3>
          </div>
          <p className="text-2xl font-semibold text-[var(--zalama-text)]">
            {partenaire.contratsCounts['CDI'] || 0}
          </p>
        </div>
        
        <div className="bg-[var(--zalama-card)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--zalama-danger)]/10">
              <Calendar className="h-5 w-5 text-[var(--zalama-danger)]" />
            </div>
            <h3 className="text-[var(--zalama-text-secondary)]">CDD</h3>
          </div>
          <p className="text-2xl font-semibold text-[var(--zalama-text)]">
            {partenaire.contratsCounts['CDD'] || 0}
          </p>
        </div>
      </div>
      
      {/* Onglets */}
      <div className="flex border-b border-[var(--zalama-border)]">
        <button
          type="button"
          onClick={() => setActiveTab('infos')}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === 'infos' 
              ? 'text-[var(--zalama-blue)] border-b-2 border-[var(--zalama-blue)]' 
              : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]'
          }`}
        >
          Informations détaillées
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('employes')}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === 'employes' 
              ? 'text-[var(--zalama-blue)] border-b-2 border-[var(--zalama-blue)]' 
              : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]'
          }`}
        >
          Employés
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('avances')}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === 'avances' 
              ? 'text-[var(--zalama-blue)] border-b-2 border-[var(--zalama-blue)]' 
              : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]'
          }`}
        >
          Demandes d'avance salaire
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === 'transactions' 
              ? 'text-[var(--zalama-blue)] border-b-2 border-[var(--zalama-blue)]' 
              : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]'
          }`}
        >
          Transactions
        </button>
      </div>
      
      {/* Contenu des onglets */}
      {activeTab === 'infos' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Informations de l'entreprise */}
          <div className="bg-[var(--zalama-card)] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">Informations de l'entreprise</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Description</h4>
                <p className="text-[var(--zalama-text)]">{partenaire.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Adresse</h4>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[var(--zalama-text-secondary)] mt-0.5" />
                  <p className="text-[var(--zalama-text)]">{partenaire.adresse}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-[var(--zalama-text-secondary)] mb-1">RCCM</h4>
                  <p className="text-[var(--zalama-text)]">{partenaire.rccm}</p>
                </div>
                
                <div>
                  <h4 className="text-sm text-[var(--zalama-text-secondary)] mb-1">NIF</h4>
                  <p className="text-[var(--zalama-text)]">{partenaire.nif}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contacts */}
          <div className="space-y-6">
            {/* Représentant */}
            <div className="bg-[var(--zalama-card)] rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">Représentant</h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Nom</h4>
                  <p className="text-[var(--zalama-text)]">{partenaire.nomRepresentant}</p>
                </div>
                
                <div>
                  <h4 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Email</h4>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                    <p className="text-[var(--zalama-text)]">{partenaire.emailRepresentant}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Téléphone</h4>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                    <p className="text-[var(--zalama-text)]">{partenaire.telephoneRepresentant}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Responsable RH */}
            <div className="bg-[var(--zalama-card)] rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">Responsable RH</h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Nom</h4>
                  <p className="text-[var(--zalama-text)]">{partenaire.nomRH}</p>
                </div>
                
                <div>
                  <h4 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Email</h4>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                    <p className="text-[var(--zalama-text)]">{partenaire.emailRH}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Téléphone</h4>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                    <p className="text-[var(--zalama-text)]">{partenaire.telephoneRH}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Onglet Employés */}
      {activeTab === 'employes' && (
        <div>
          {/* Actions pour les employés */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Liste des employés</h3>
            
            <div className="flex gap-2">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1 px-3 py-1.5 border border-[var(--zalama-border)] rounded-lg hover:bg-[var(--zalama-bg-lighter)] transition-colors text-[var(--zalama-text)] text-sm"
              >
                <Download className="h-4 w-4" />
                Exporter Excel
              </button>
              
              <label
                htmlFor="import-excel"
                className="flex items-center gap-1 px-3 py-1.5 bg-[var(--zalama-success)] hover:bg-[var(--zalama-blue-accent)]  text-white rounded-lg transition-colors text-sm cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                Importer Excel
                <input
                  type="file"
                  id="import-excel"
                  accept=".xlsx, .xls"
                  onChange={handleImportExcel}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={() => setShowAjoutEmployeModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors text-sm"
              >
                <UserPlus className="h-4 w-4" />
                Ajouter un employé
              </button>
            </div>
          </div>
          
          {/* Tableau des employés */}
          <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--zalama-bg-lighter)]">
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--zalama-text)]">Nom & Prénom</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--zalama-text)]">Genre</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--zalama-text)]">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--zalama-text)]">Poste</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--zalama-text)]">Contrat</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[var(--zalama-text)]">Salaire Net</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-[var(--zalama-text)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--zalama-border)]">
                {partenaire.employes.map(employe => (
                  <tr key={employe.id} className="hover:bg-[var(--zalama-bg-lighter)]/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)]">
                      {employe.nom} {employe.prenom}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)]">{employe.genre}</td>
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)]">
                      <div className="flex flex-col">
                        <span>{employe.email}</span>
                        <span className="text-[var(--zalama-text-secondary)]">{employe.telephone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)]">
                      <div className="flex flex-col">
                        <span>{employe.poste}</span>
                        <span className="text-[var(--zalama-text-secondary)]">{employe.role}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        employe.typeContrat === 'CDI' 
                          ? 'bg-[var(--zalama-success)]/20 text-[var(--zalama-success)]' 
                          : 'bg-[var(--zalama-warning)]/20 text-[var(--zalama-warning)]'
                      }`}>
                        {employe.typeContrat}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)] text-right">
                      {employe.salaireNet.toLocaleString()} GNF
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <button
                        onClick={() => router.push(`/dashboard/partenaires/${partenaire.id}/employes/${employe.id}/edit`)}
                        className="text-[var(--zalama-blue)] hover:text-[var(--zalama-blue-accent)] transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Message si aucun employé */}
          {partenaire.employes.length === 0 && (
            <div className="bg-[var(--zalama-card)] rounded-xl p-8 text-center">
              <p className="text-[var(--zalama-text-secondary)]">
                Aucun employé n'a été ajouté pour ce partenaire.
              </p>
              <button
                onClick={() => router.push(`/dashboard/partenaires/${partenaire.id}/employes/ajouter`)}
                className="mt-4 px-4 py-2 bg-[var(--zalama-blue)] text-white rounded-lg hover:bg-[var(--zalama-blue-accent)] transition-colors"
              >
                Ajouter un employé
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Onglet Demandes d'avance salaire */}
      {activeTab === 'avances' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Demandes d'avance sur salaire</h3>
            
            <div className="flex gap-2">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--zalama-warning)]"></div>
                  <span className="text-[var(--zalama-text-secondary)]">En attente: {demandesAvance.filter(d => d.statut === 'EN_ATTENTE').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--zalama-success)]"></div>
                  <span className="text-[var(--zalama-text-secondary)]">Approuvées: {demandesAvance.filter(d => d.statut === 'APPROUVE').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--zalama-danger)]"></div>
                  <span className="text-[var(--zalama-text-secondary)]">Refusées: {demandesAvance.filter(d => d.statut === 'REFUSE').length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des demandes d'avance */}
          <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--zalama-bg-lighter)]">
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--zalama-text)]">Employé</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[var(--zalama-text)]">Montant demandé</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--zalama-text)]">Motif</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--zalama-text)]">Date demande</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-[var(--zalama-text)]">Statut</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[var(--zalama-text)]">Numéro de réception</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-[var(--zalama-text)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--zalama-border)]">
                {demandesAvance.map(demande => (
                  <tr key={demande.id} className="hover:bg-[var(--zalama-bg-lighter)]/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)]">
                      <div className="flex flex-col">
                        <span className="font-medium">{demande.employeNom} {demande.employePrenom}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)] text-right font-medium">
                      {demande.montantDemande.toLocaleString()} GNF
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)]">
                      <span className="max-w-xs truncate block" title={demande.motif}>
                        {demande.motif}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)]">
                      {new Date(demande.dateDemande).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        demande.statut === 'EN_ATTENTE' 
                          ? 'bg-[var(--zalama-warning)]/20 text-[var(--zalama-warning)]'
                          : demande.statut === 'APPROUVE'
                          ? 'bg-[var(--zalama-success)]/20 text-[var(--zalama-success)]'
                          : demande.statut === 'REFUSE'
                          ? 'bg-[var(--zalama-danger)]/20 text-[var(--zalama-danger)]'
                          : 'bg-[var(--zalama-blue)]/20 text-[var(--zalama-blue)]'
                      }`}>
                              {demande.statut === 'EN_ATTENTE' && 'En attente'}
                        {demande.statut === 'APPROUVE' && 'Approuvée'}
                        {demande.statut === 'REFUSE' && 'Refusée'}
                        {demande.statut === 'PAYE' && 'Payée'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)] text-right">
                      {demande.numeroReception ? (
                        <span className="font-medium">{demande.numeroReception}</span>
                      ) : (
                        <span className="text-[var(--zalama-text-secondary)]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        {demande.statut === 'EN_ATTENTE' && (
                          <>
                            <button
                              onClick={() => handleApprouverDemande(demande)}
                              className="text-[var(--zalama-success)] hover:text-[var(--zalama-success)]/80 transition-colors"
                              title="Approuver"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRefuserDemande(demande)}
                              className="text-[var(--zalama-danger)] hover:text-[var(--zalama-danger)]/80 transition-colors"
                              title="Refuser"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleVoirDetails(demande)}
                          className="text-[var(--zalama-blue)] hover:text-[var(--zalama-blue-accent)] transition-colors"
                          title="Voir détails"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Message si aucune demande */}
          {demandesAvance.length === 0 && (
            <div className="bg-[var(--zalama-card)] rounded-xl p-8 text-center">
              <DollarSign className="h-12 w-12 text-[var(--zalama-text-secondary)] mx-auto mb-4" />
              <p className="text-[var(--zalama-text-secondary)] text-lg mb-2">
                Aucune demande d'avance sur salaire
              </p>
              <p className="text-[var(--zalama-text-secondary)] text-sm">
                Les demandes d'avance sur salaire des employés de ce partenaire apparaîtront ici.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Onglet Transactions */}
      {activeTab === 'transactions' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Transactions</h3>
            
            <div className="flex gap-2">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--zalama-success)]"></div>
                  <span className="text-[var(--zalama-text-secondary)]">Effectuées: {transactions.filter(t => t.statut === 'EFFECTUEE').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--zalama-danger)]"></div>
                  <span className="text-[var(--zalama-text-secondary)]">Annulées: {transactions.filter(t => t.statut === 'ANNULEE').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--zalama-blue)]"></div>
                  <span className="text-[var(--zalama-text-secondary)]">Total: {transactions.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des transactions */}
          <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--zalama-bg-lighter)]">
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--zalama-text)]">Transaction</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[var(--zalama-text)]">Montant</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--zalama-text)]">Méthode de paiement</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--zalama-text)]">Numéro de transaction</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--zalama-text)]">Date de transaction</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-[var(--zalama-text)]">Statut</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[var(--zalama-text)]">Numéro de compte</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-[var(--zalama-text)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--zalama-border)]">
                {transactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-[var(--zalama-bg-lighter)]/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)]">
                      <div className="flex flex-col">
                        <span className="font-medium">{transaction.employeNom} {transaction.employePrenom}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)] text-right font-medium">
                      {transaction.montant.toLocaleString()} GNF
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)]">
                      {transaction.methodePaiement}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)]">
                      {transaction.numeroTransaction}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)]">
                      {new Date(transaction.dateTransaction).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        transaction.statut === 'EFFECTUEE' 
                          ? 'bg-[var(--zalama-success)]/20 text-[var(--zalama-success)]'
                          : 'bg-[var(--zalama-danger)]/20 text-[var(--zalama-danger)]'
                      }`}>
                        {transaction.statut === 'EFFECTUEE' && 'Effectuée'}
                        {transaction.statut === 'ANNULEE' && 'Annulée'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)] text-right">
                      {transaction.numeroCompte ? (
                        <span className="font-medium">{transaction.numeroCompte}</span>
                      ) : (
                        <span className="text-[var(--zalama-text-secondary)]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleVoirDetailsTransaction(transaction)}
                          className="text-[var(--zalama-blue)] hover:text-[var(--zalama-blue-accent)] transition-colors"
                          title="Voir détails"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Message si aucune transaction */}
          {transactions.length === 0 && (
            <div className="bg-[var(--zalama-card)] rounded-xl p-8 text-center">
              <p className="text-[var(--zalama-text-secondary)]">
                Aucune transaction enregistrée pour ce partenaire.
              </p>
            </div>
          )}
        </div>
      )}
    
    
    {/* Modale de modification du partenaire */}
    <ModaleModificationPartenaire
      isOpen={showModificationModal}
      onClose={() => setShowModificationModal(false)}
      onSubmit={handleModificationSubmit}
      types={['Entreprise', 'ONG', 'Institution', 'Association']}
      partenaire={partenaire}
    />
    
    {/* Modale d'ajout d'employé */}
    <ModaleAjoutEmploye
      isOpen={showAjoutEmployeModal}
      onClose={() => setShowAjoutEmployeModal(false)}
      onSubmit={handleAjoutEmploye}
      partenaireId={partenaire?.id || ''}
    />

    {/* Modale d'approbation d'une demande d'avance */}
    {showApprobationModal && selectedDemande && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[var(--zalama-card)] rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
          <h3 className="text-xl font-semibold text-[var(--zalama-text)] mb-6">
            Approuver la demande d'avance
          </h3>
          
          <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4 mb-6">
            <p className="text-sm text-[var(--zalama-text-secondary)] mb-1">Employé</p>
            <p className="font-medium text-[var(--zalama-text)]">
              {selectedDemande.employeNom} {selectedDemande.employePrenom}
            </p>
            <p className="text-sm text-[var(--zalama-text-secondary)] mt-2 mb-1">Montant demandé</p>
            <p className="font-medium text-[var(--zalama-text)]">
              {selectedDemande.montantDemande.toLocaleString()} GNF
            </p>
          </div>

          <form onSubmit={handleEffectuerTransaction} className="space-y-4">
            <div>
              <label htmlFor="numeroTransaction" className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Numéro de transaction *
              </label>
              <input
                type="text"
                id="numeroTransaction"
                name="numeroTransaction"
                required
                className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] focus:border-transparent"
                placeholder="Ex: TXN123456"
              />
            </div>

            <div>
              <label htmlFor="methodePaiement" className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Méthode de paiement *
              </label>
              <select
                id="methodePaiement"
                name="methodePaiement"
                required
                className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] focus:border-transparent"
              >
                <option value="">Sélectionner une méthode</option>
                <option value="Orange Money">Orange Money</option>
                <option value="MTN Mobile Money">MTN Mobile Money</option>
                <option value="Moov Money">Moov Money</option>
                <option value="Virement bancaire">Virement bancaire</option>
                <option value="Espèces">Espèces</option>
              </select>
            </div>

            <div>
              <label htmlFor="numeroCompte" className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Numéro de compte/téléphone *
              </label>
              <input
                type="text"
                id="numeroCompte"
                name="numeroCompte"
                required
                className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] focus:border-transparent"
                placeholder="Ex: +224 XXX XXX XXX"
              />
            </div>

            <div>
              <label htmlFor="recu" className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Reçu de transaction
              </label>
              <input
                type="file"
                id="recu"
                name="recu"
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] focus:border-transparent"
              />
              <p className="text-xs text-[var(--zalama-text-secondary)] mt-1">
                Formats acceptés: PDF, JPG, PNG
              </p>
            </div>

            <div>
              <label htmlFor="dateTransaction" className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Date de transaction *
              </label>
              <input
                type="datetime-local"
                id="dateTransaction"
                name="dateTransaction"
                required
                defaultValue={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowApprobationModal(false);
                  setSelectedDemande(null);
                }}
                className="flex-1 px-4 py-2 border border-[var(--zalama-border)] text-[var(--zalama-text)] rounded-lg hover:bg-[var(--zalama-bg-lighter)] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[var(--zalama-success)] text-white rounded-lg hover:bg-[var(--zalama-success)]/90 transition-colors"
              >
                Effectuer la transaction
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Modale de refus d'une demande d'avance */}
    {showRefusModal && selectedDemande && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[var(--zalama-card)] rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
          <h3 className="text-xl font-semibold text-[var(--zalama-text)] mb-6">
            Refuser la demande d'avance
          </h3>
          
          <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4 mb-6">
            <p className="text-sm text-[var(--zalama-text-secondary)] mb-1">Employé</p>
            <p className="font-medium text-[var(--zalama-text)]">
              {selectedDemande.employeNom} {selectedDemande.employePrenom}
            </p>
            <p className="text-sm text-[var(--zalama-text-secondary)] mt-2 mb-1">Montant demandé</p>
            <p className="font-medium text-[var(--zalama-text)]">
              {selectedDemande.montantDemande.toLocaleString()} GNF
            </p>
          </div>

          <form onSubmit={handleConfirmerRefus} className="space-y-4">
            <div>
              <label htmlFor="commentaireRefus" className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Motif du refus *
              </label>
              <textarea
                id="commentaireRefus"
                name="commentaire"
                required
                rows={4}
                className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] focus:border-transparent resize-none"
                placeholder="Expliquez les raisons du refus..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowRefusModal(false);
                  setSelectedDemande(null);
                }}
                className="flex-1 px-4 py-2 border border-[var(--zalama-border)] text-[var(--zalama-text)] rounded-lg hover:bg-[var(--zalama-bg-lighter)] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[var(--zalama-danger)] text-white rounded-lg hover:bg-[var(--zalama-danger)]/90 transition-colors"
              >
                Refuser la demande
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Modale de détails d'une demande d'avance */}
    {showDetailsModal && selectedDemande && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[var(--zalama-card)] rounded-xl p-6 w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-[var(--zalama-text)]">
              Détails de la demande d'avance
            </h3>
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedDemande(null);
              }}
              className="text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Informations de l'employé */}
            <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4">
              <h4 className="font-semibold text-[var(--zalama-text)] mb-3">Informations de l'employé</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[var(--zalama-text-secondary)]">Nom complet</p>
                  <p className="font-medium text-[var(--zalama-text)]">
                    {selectedDemande.employeNom} {selectedDemande.employePrenom}
                  </p>
                </div>
                {selectedDemande.numeroReception && (
                  <div>
                    <p className="text-sm text-[var(--zalama-text-secondary)]">Numéro de réception</p>
                    <p className="font-medium text-[var(--zalama-text)]">{selectedDemande.numeroReception}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Détails de la demande */}
            <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4">
              <h4 className="font-semibold text-[var(--zalama-text)] mb-3">Détails de la demande</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--zalama-text-secondary)]">Montant demandé</p>
                  <p className="font-semibold text-[var(--zalama-text)] text-lg">
                    {selectedDemande.montantDemande.toLocaleString()} GNF
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--zalama-text-secondary)]">Motif</p>
                  <p className="text-[var(--zalama-text)]">{selectedDemande.motif}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--zalama-text-secondary)]">Date de demande</p>
                  <p className="text-[var(--zalama-text)]">
                    {new Date(selectedDemande.dateDemande).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Statut et traitement */}
            <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4">
              <h4 className="font-semibold text-[var(--zalama-text)] mb-3">Statut et traitement</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--zalama-text-secondary)]">Statut actuel</p>
                  <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${
                    selectedDemande.statut === 'EN_ATTENTE' 
                      ? 'bg-[var(--zalama-warning)]/20 text-[var(--zalama-warning)]'
                      : selectedDemande.statut === 'APPROUVE'
                      ? 'bg-[var(--zalama-success)]/20 text-[var(--zalama-success)]'
                      : selectedDemande.statut === 'REFUSE'
                      ? 'bg-[var(--zalama-danger)]/20 text-[var(--zalama-danger)]'
                      : 'bg-[var(--zalama-blue)]/20 text-[var(--zalama-blue)]'
                  }`}>
                    {selectedDemande.statut === 'EN_ATTENTE' && 'En attente'}
                    {selectedDemande.statut === 'APPROUVE' && 'Approuvée'}
                    {selectedDemande.statut === 'REFUSE' && 'Refusée'}
                    {selectedDemande.statut === 'PAYE' && 'Payée'}
                  </span>
                </div>
                
                {selectedDemande.dateTraitement && (
                  <div>
                    <p className="text-sm text-[var(--zalama-text-secondary)]">Date de traitement</p>
                    <p className="text-[var(--zalama-text)]">
                      {new Date(selectedDemande.dateTraitement).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}

                {selectedDemande.commentaire && (
                  <div>
                    <p className="text-sm text-[var(--zalama-text-secondary)]">Commentaire</p>
                    <p className="text-[var(--zalama-text)]">{selectedDemande.commentaire}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions disponibles */}
            {selectedDemande.statut === 'EN_ATTENTE' && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleRefuserDemande(selectedDemande);
                  }}
                  className="flex-1 px-4 py-2 bg-[var(--zalama-danger)] text-white rounded-lg hover:bg-[var(--zalama-danger)]/90 transition-colors"
                >
                  Refuser
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleApprouverDemande(selectedDemande);
                  }}
                  className="flex-1 px-4 py-2 bg-[var(--zalama-success)] text-white rounded-lg hover:bg-[var(--zalama-success)]/90 transition-colors"
                >
                  Approuver
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Modale de détails d'une transaction */}
    {showTransactionDetailsModal && selectedTransaction && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[var(--zalama-card)] rounded-xl p-6 w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-[var(--zalama-text)]">
              Détails de la transaction
            </h3>
            <button
              onClick={() => {
                setShowTransactionDetailsModal(false);
                setSelectedTransaction(null);
              }}
              className="text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Informations de la transaction */}
            <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4">
              <h4 className="font-semibold text-[var(--zalama-text)] mb-3">Informations de la transaction</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[var(--zalama-text-secondary)]">ID Transaction</p>
                  <p className="font-medium text-[var(--zalama-text)]">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--zalama-text-secondary)]">Date de création</p>
                  <p className="font-medium text-[var(--zalama-text)]">
                    {new Date(selectedTransaction.dateCreation).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Détails de la transaction */}
            <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4">
              <h4 className="font-semibold text-[var(--zalama-text)] mb-3">Détails de la transaction</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--zalama-text-secondary)]">Montant</p>
                  <p className="font-semibold text-[var(--zalama-text)] text-lg">
                    {selectedTransaction.montant.toLocaleString()} GNF
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--zalama-text-secondary)]">Méthode de paiement</p>
                  <p className="text-[var(--zalama-text)]">{selectedTransaction.methodePaiement}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--zalama-text-secondary)]">Numéro de transaction</p>
                  <p className="text-[var(--zalama-text)]">{selectedTransaction.numeroTransaction}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--zalama-text-secondary)]">Date de transaction</p>
                  <p className="text-[var(--zalama-text)]">
                    {new Date(selectedTransaction.dateTransaction).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--zalama-text-secondary)]">Statut</p>
                  <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${
                    selectedTransaction.statut === 'EFFECTUEE' 
                      ? 'bg-[var(--zalama-success)]/20 text-[var(--zalama-success)]'
                      : 'bg-[var(--zalama-danger)]/20 text-[var(--zalama-danger)]'
                  }`}>
                    {selectedTransaction.statut === 'EFFECTUEE' && 'Effectuée'}
                    {selectedTransaction.statut === 'ANNULEE' && 'Annulée'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-[var(--zalama-text-secondary)]">Numéro de compte</p>
                  <p className="font-medium text-[var(--zalama-text)]">{selectedTransaction.numeroCompte}</p>
                </div>
              </div>
            </div>

            {/* Informations sur l'employé */}
            <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4">
              <h4 className="font-semibold text-[var(--zalama-text)] mb-3">Informations de l'employé</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[var(--zalama-text-secondary)]">Nom complet</p>
                  <p className="font-medium text-[var(--zalama-text)]">
                    {selectedTransaction.employeNom} {selectedTransaction.employePrenom}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--zalama-text-secondary)]">Email</p>
                  <p className="font-medium text-[var(--zalama-text)]">{selectedTransaction.employeEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--zalama-text-secondary)]">ID Employé</p>
                  <p className="font-medium text-[var(--zalama-text)]">{selectedTransaction.employeId}</p>
                </div>
              </div>
            </div>

            {/* Fichier reçu */}
            {selectedTransaction.recu && (
              <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4">
                <h4 className="font-semibold text-[var(--zalama-text)] mb-3">Reçu de transaction</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--zalama-blue)]/10">
                      <FileText className="h-5 w-5 text-[var(--zalama-blue)]" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--zalama-text)] font-medium">Reçu de transaction</p>
                      <p className="text-xs text-[var(--zalama-text-secondary)]">Fichier uploadé</p>
                    </div>
                  </div>
                  <a
                    href={selectedTransaction.recu}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-[var(--zalama-blue)] text-white rounded-lg hover:bg-[var(--zalama-blue-accent)] transition-colors text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </div>

  );
}