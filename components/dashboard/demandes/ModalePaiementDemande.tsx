"use client";

import React, { useState } from 'react';
import { X, DollarSign, CreditCard, Phone, FileText, AlertCircle } from 'lucide-react';
import { UISalaryAdvanceRequest } from '@/types/salaryAdvanceRequest';
import { toast } from 'react-hot-toast';

interface ModalePaiementDemandeProps {
  isOpen: boolean;
  onClose: () => void;
  request: UISalaryAdvanceRequest | null;
  isLoading?: boolean;
  onPaymentSuccess?: () => void;
}

const ModalePaiementDemande: React.FC<ModalePaiementDemandeProps> = ({
  isOpen,
  onClose,
  request,
  isLoading = false,
  onPaymentSuccess
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');

  // Pré-remplir les champs quand le modal s'ouvre
  React.useEffect(() => {
    if (request && isOpen) {
      setDescription(`Avance sur salaire - ${request.employeNom || 'Employé'} - ${request.type_motif || 'Motif'}`);
      
      // Pré-remplir le numéro de téléphone de l'employé s'il existe
      if (request.employe?.telephone) {
        setPhoneNumber(request.employe.telephone);
      } else {
        setPhoneNumber('');
      }
    }
  }, [request, isOpen]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const validatePhoneNumber = (phone: string) => {
    // Normaliser le numéro (garder seulement les chiffres)
    const normalized = phone.replace(/[^0-9]/g, '');
    
    // Vérifier si c'est un numéro guinéen valide (9 chiffres)
    if (normalized.length === 9) {
      return true;
    }
    
    // Vérifier si c'est un numéro avec préfixe 224 (12 chiffres)
    if (normalized.length === 12 && normalized.startsWith('224')) {
      return true;
    }
    
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!request) return;

    // Validation
    if (!phoneNumber.trim()) {
      toast.error('Le numéro de téléphone est requis');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Numéro de téléphone invalide. Utilisez un numéro guinéen (9 chiffres ou 224 + 9 chiffres)');
      return;
    }

    if (!description.trim()) {
      toast.error('La description est requise');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('🚀 Début du paiement pour la demande:', request.id);
      console.log('📋 Données de paiement:', {
        amount: request.montant_total,
        phone: phoneNumber,
        description: description,
        partnerId: request.partenaire_id,
        requestId: request.id
      });

      const response = await fetch('/api/payments/lengo-cashin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: request.montant_total,
          phone: phoneNumber,
          description: description,
          partnerId: request.partenaire_id,
          employeId: request.employe_id,
          type_account: 'lp-om-gn', // Orange Money Guinée
          requestId: request.id
        }),
      });

      const result = await response.json();
      console.log('✅ Réponse du paiement:', result);

      if (result.success) {
        toast.success(`Paiement initié avec succès! ID: ${result.pay_id}`);
        
        // Vérifier le statut du paiement après un délai
        setTimeout(async () => {
          try {
            const statusResponse = await fetch('/api/payments/lengo-status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                pay_id: result.pay_id
              })
            });
            
            if (statusResponse.ok) {
              const statusResult = await statusResponse.json();
              console.log('🔍 Statut du paiement vérifié:', statusResult);
              
              if (statusResult.db_status === 'PAYE') {
                toast.success('Paiement confirmé avec succès!');
              } else if (statusResult.db_status === 'ECHOUE') {
                toast.error('Le paiement a échoué');
              }
            }
          } catch (error) {
            console.error('Erreur lors de la vérification du statut:', error);
          }
        }, 5000); // Vérifier après 5 secondes
        
        onClose();
        // Appeler le callback de succès si fourni
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      } else {
        console.error('❌ Erreur de paiement:', result.error);
        toast.error(`Erreur de paiement: ${result.error}`);
      }
    } catch (error) {
      console.error('💥 Erreur lors du paiement:', error);
      toast.error('Erreur lors de l&apos;initialisation du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[var(--zalama-bg-light)] rounded-xl shadow-xl border border-[var(--zalama-border)] w-full max-w-md max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--zalama-border)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--zalama-success)]/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-[var(--zalama-success)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--zalama-text)]">
                Paiement de l&apos;avance
              </h2>
              <p className="text-sm text-[var(--zalama-text-secondary)]">
                Demande #{request.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] hover:bg-[var(--zalama-bg)] rounded-lg transition-colors"
            aria-label="Fermer le modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--zalama-blue)]"></div>
              <span className="ml-3 text-[var(--zalama-text-secondary)]">Chargement...</span>
            </div>
          ) : (
            <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Informations de la demande */}
              <div className="p-3 bg-[var(--zalama-bg-lighter)] rounded-lg">
                <h3 className="font-medium text-[var(--zalama-text)] mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--zalama-blue)]" />
                  Informations de la demande
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--zalama-text-secondary)]">Employé:</span>
                    <span className="font-medium text-[var(--zalama-text)]">{request.employeNom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--zalama-text-secondary)]">Partenaire:</span>
                    <span className="font-medium text-[var(--zalama-text)]">{request.partenaireNom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--zalama-text-secondary)]">Montant total:</span>
                    <span className="font-semibold text-[var(--zalama-success)]">
                      {formatCurrency(request.montant_total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Numéro de téléphone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[var(--zalama-text)] mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[var(--zalama-blue)]" />
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ex: 612345678 ou 224612345678"
                  className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] focus:border-transparent"
                  required
                  aria-describedby="phone-help"
                />
                <p id="phone-help" className="text-xs text-[var(--zalama-text-secondary)] mt-1">
                  Format: 9 chiffres ou 224 + 9 chiffres
                </p>
                {request.employe?.telephone && (
                  <p className="text-xs text-[var(--zalama-success)] mt-1">
                    ✅ Numéro pré-rempli depuis les données de l'employé
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-[var(--zalama-text)] mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--zalama-blue)]" />
                  Description du paiement
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] focus:border-transparent resize-none"
                  placeholder="Description du paiement..."
                  required
                />
              </div>

              {/* Méthode de paiement */}
              <div className="p-3 bg-[var(--zalama-bg-lighter)] rounded-lg">
                <h3 className="font-medium text-[var(--zalama-text)] mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[var(--zalama-blue)]" />
                  Méthode de paiement
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-[var(--zalama-text)]">Orange Money</span>
                  </div>
                  <span className="text-xs text-[var(--zalama-text-secondary)]">(Guinée)</span>
                </div>
              </div>

              {/* Avertissement */}
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Important:</p>
                    <p>Le paiement sera traité via Orange Money. Assurez-vous que le numéro de téléphone est correct.</p>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-4 border-t border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-[var(--zalama-text)] bg-[var(--zalama-bg-lighter)] hover:bg-[var(--zalama-bg)] rounded-lg transition-colors"
            disabled={isProcessing}
            aria-label="Annuler le paiement"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="payment-form"
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-[var(--zalama-success)] hover:bg-[var(--zalama-success-accent)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-label={`Payer ${formatCurrency(request.montant_total)}`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Traitement...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                Payer {formatCurrency(request.montant_total)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalePaiementDemande; 