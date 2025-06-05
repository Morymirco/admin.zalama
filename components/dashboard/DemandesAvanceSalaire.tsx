'use client';

import React, { useState } from 'react';
import { orderBy, limit, where } from 'firebase/firestore';
import { useFirebaseCollection } from '@/hooks/useFirebaseCollection';
import salaryAdvanceService from '@/services/salaryAdvanceService';
import { SalaryAdvanceRequest } from '@/types/salaryAdvanceRequest';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function DemandesAvanceSalaire() {
  const [filter, setFilter] = useState<SalaryAdvanceRequest['statut'] | 'toutes'>('en attente');
  
  // Préparer les contraintes de requête en fonction du filtre
  const constraints = filter !== 'toutes' 
    ? [where('statut', '==', filter), orderBy('dateCreation', 'desc'), limit(5)]
    : [orderBy('dateCreation', 'desc'), limit(5)];
  
  // Utiliser notre hook pour récupérer les demandes d'avance sur salaire
  const { data: demandes, loading, error } = useFirebaseCollection<SalaryAdvanceRequest>(
    salaryAdvanceService,
    constraints,
    true // Mode temps réel
  );

  // Fonction pour formater les montants
  const formatMontant = (montant: number, devise: string) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: devise || 'CDF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  };

  // Fonction pour formater les dates
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Date inconnue';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  };

  // Fonction pour déterminer l'icône et la couleur en fonction du statut
  const getStatusStyle = (statut: string) => {
    switch (statut) {
      case 'approuvée':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          textColor: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/20'
        };
      case 'rejetée':
        return {
          icon: <XCircle className="h-4 w-4 text-red-500" />,
          textColor: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/20'
        };
      case 'en attente':
        return {
          icon: <Clock className="h-4 w-4 text-yellow-500" />,
          textColor: 'text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4 text-gray-500" />,
          textColor: 'text-gray-500',
          bgColor: 'bg-gray-50 dark:bg-gray-800'
        };
    }
  };

  // État de chargement
  if (loading) {
    return (
      <div className="bg-white dark:bg-[var(--zalama-bg-light)] rounded-lg border border-gray-200 dark:border-[#2c5282] shadow-sm dark:shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Demandes d'avance sur salaire</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--zalama-primary)]"></div>
        </div>
      </div>
    );
  }

  // Gestion des erreurs
  if (error) {
    return (
      <div className="bg-white dark:bg-[var(--zalama-bg-light)] rounded-lg border border-gray-200 dark:border-[#2c5282] shadow-sm dark:shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Demandes d'avance sur salaire</h2>
        <div className="p-4 text-center bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            Erreur lors du chargement des demandes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[var(--zalama-bg-light)] rounded-lg border border-gray-200 dark:border-[#2c5282] shadow-sm dark:shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[var(--zalama-blue)]">Demandes d'avance sur salaire</h2>
        
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="toutes">Toutes</option>
            <option value="en attente">En attente</option>
            <option value="approuvée">Approuvées</option>
            <option value="rejetée">Rejetées</option>
          </select>
        </div>
      </div>
      
      {demandes.length === 0 ? (
        <div className="p-4 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-[var(--zalama-text-secondary)]">
            Aucune demande {filter !== 'toutes' ? filter : ''} trouvée
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {demandes.map((demande) => {
            const { icon, textColor, bgColor } = getStatusStyle(demande.statut);
            
            return (
              <div 
                key={demande.id} 
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 ${bgColor} rounded-full`}>
                    {icon}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--zalama-text)]">
                      Demande #{demande.id.slice(0, 6)}
                    </p>
                    <p className="text-xs text-[var(--zalama-text-secondary)]">
                      {formatDate(demande.dateCreation)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[var(--zalama-text)]">
                    {formatMontant(demande.montant, demande.devise)}
                  </p>
                  <p className={`text-xs ${textColor}`}>
                    {demande.statut}
                  </p>
                </div>
              </div>
            );
          })}
          
          <div className="pt-2">
            <button 
              className="w-full py-2 px-4 text-sm font-medium text-[var(--zalama-primary)] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              Voir toutes les demandes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
