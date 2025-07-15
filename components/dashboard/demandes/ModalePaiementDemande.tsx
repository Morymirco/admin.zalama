"use client";

import { UISalaryAdvanceRequest } from '@/types/salaryAdvanceRequest';
import { AlertCircle, CheckCircle, CreditCard, DollarSign, FileText, Phone, X, XCircle } from 'lucide-react';
import React, { useState } from 'react';
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
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  const [existingTransaction, setExistingTransaction] = useState<{
    id: string;
    numero_transaction: string;
    statut: string;
    date_creation: string;
    montant: number;
  } | null>(null);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);

  // Pré-remplir les champs quand le modal s'ouvre
  React.useEffect(() => {
    if (request && isOpen) {
      setDescription(`Avance sur salaire - ${request.employeNom || 'Employé'} - ${request.type_motif || 'Motif'}`);
      
      // Pré-remplir le numéro de téléphone depuis la demande (numero_reception)
      if (request.numero_reception) {
        setPhoneNumber(request.numero_reception);
      } else if (request.employe?.telephone) {
        // Fallback vers le numéro de l'employé si numero_reception n'existe pas
        setPhoneNumber(request.employe.telephone);
      } else {
        setPhoneNumber('');
      }
      
      // Réinitialiser le statut de paiement
      setPaymentStatus(null);
      setIsCheckingStatus(false);
      setRetryCount(0);
      setExistingTransaction(null);
      
      // Vérifier s'il existe déjà une transaction pour cette demande
      checkExistingTransaction();
    }
  }, [request, isOpen]);

  const checkExistingTransaction = async () => {
    if (!request?.id) return;
    
    setIsCheckingExisting(true);
    try {
      const response = await fetch('/api/transactions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const existingTransactions = data.transactions?.filter((t: {
          demande_avance_id: string;
          id: string;
          numero_transaction: string;
          statut: string;
          date_creation: string;
          montant: number;
        }) => 
          t.demande_avance_id === request.id
        ) || [];

        if (existingTransactions.length > 0) {
          // Trier par date de création (plus récent en premier)
          const sortedTransactions = existingTransactions.sort((a: {
            date_creation: string;
          }, b: {
            date_creation: string;
          }) => 
            new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()
          );

          const latestTransaction = sortedTransactions[0];
          setExistingTransaction(latestTransaction);

          // Si la transaction est récente (moins de 5 minutes), afficher un avertissement
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          const isRecent = new Date(latestTransaction.date_creation) > fiveMinutesAgo;

          if (isRecent) {
            toast.error('Une transaction pour cette demande a déjà été initiée récemment');
          } else if (latestTransaction.statut === 'EFFECTUEE') {
            toast.error('Cette demande a déjà été payée avec succès');
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des transactions existantes:', error);
    } finally {
      setIsCheckingExisting(false);
    }
  };

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

  const checkPaymentStatusAndNotify = async (payId: string, currentRetryCount = 0) => {
    setIsCheckingStatus(true);
    setPaymentStatus('pending');
    setRetryCount(currentRetryCount);
    
    // Limiter le nombre de tentatives à 10 (30 secondes max)
    if (currentRetryCount >= 10) {
      setPaymentStatus('failed');
      setIsCheckingStatus(false);
      toast.error('❌ Timeout: Le paiement prend trop de temps. Vérifiez manuellement.');
      return;
    }
    
    try {
      console.log('🔍 Vérification du statut du paiement:', payId);
      
      // Vérifier le statut du paiement
      const statusResponse = await fetch('/api/payments/lengo-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pay_id: payId
        })
      });
      
      if (statusResponse.ok) {
        const statusResult = await statusResponse.json();
        console.log('📊 Statut du paiement vérifié:', statusResult);
        
        console.log('🔍 Statuts reçus:', {
          lengo_status: statusResult.lengo_status,
          db_status: statusResult.db_status
        });
        
        // Prioriser lengo_status comme source de vérité
        if (statusResult.lengo_status === 'SUCCESS') {
          setPaymentStatus('success');
          toast.success('✅ Paiement confirmé avec succès!');
          
          // Envoyer les notifications de succès
          await sendNotifications('success', payId);
          
          // Fermer automatiquement le modal après 3 secondes
          setTimeout(() => {
            onClose();
            if (onPaymentSuccess) {
              onPaymentSuccess();
            }
          }, 3000);
          
        } else if (statusResult.lengo_status === 'FAILED' || statusResult.lengo_status === 'CANCELLED') {
          setPaymentStatus('failed');
          toast.error('❌ Le paiement a été annulé ou a échoué');
          
          // Envoyer les notifications d'échec
          await sendNotifications('failed', payId);
          
        } else if (statusResult.lengo_status === 'PENDING' || statusResult.lengo_status === 'INITIATED') {
          console.log('⏳ Paiement en cours (lengo_status: ' + statusResult.lengo_status + '), nouvelle tentative dans 2 secondes...');
          // Paiement en cours, réessayer après un délai
          setTimeout(() => checkPaymentStatusAndNotify(payId, currentRetryCount + 1), 2000);
          return;
          
        } else if (statusResult.lengo_status === 'UNKNOWN') {
          console.log('⏳ Statut inconnu, nouvelle tentative dans 3 secondes...');
          // Statut inconnu, réessayer après un délai
          setTimeout(() => checkPaymentStatusAndNotify(payId, currentRetryCount + 1), 3000);
          return;
          
        } else {
          console.log('❓ Statut inconnu:', statusResult.lengo_status, 'Nouvelle tentative...');
          // Statut inconnu, réessayer après un délai
          setTimeout(() => checkPaymentStatusAndNotify(payId, currentRetryCount + 1), 3000);
          return;
        }
      } else {
        console.error('❌ Erreur lors de la vérification du statut');
        setPaymentStatus('failed');
        toast.error('Erreur lors de la vérification du statut');
      }
    } catch (error) {
      console.error('💥 Erreur lors de la vérification du statut:', error);
      setPaymentStatus('failed');
      toast.error('Erreur lors de la vérification du statut');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const sendNotifications = async (status: 'success' | 'failed', payId: string) => {
    try {
      console.log('📧 Envoi des notifications pour le statut:', status);
      
      const notificationData = {
        type: status === 'success' ? 'payment_success' : 'payment_failure',
        paymentId: payId,
        errorMessage: status === 'failed' ? 'Paiement échoué lors du traitement' : undefined
      };

      // Envoyer les notifications via la nouvelle API
      const notificationResponse = await fetch('/api/advance/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      });

      if (notificationResponse.ok) {
        const notificationResult = await notificationResponse.json();
        console.log('✅ Notifications envoyées:', notificationResult);
        
        if (status === 'success') {
          if (notificationResult.sms_sent && notificationResult.email_sent) {
            toast.success('📧 SMS et email de confirmation envoyés');
          } else if (notificationResult.sms_sent || notificationResult.email_sent) {
            toast.success(`📧 ${notificationResult.sms_sent ? 'SMS' : 'Email'} de confirmation envoyé`);
          } else {
            toast('📧 Paiement traité mais notifications non envoyées', {
              icon: '⚠️',
              duration: 4000
            });
          }
        } else {
          if (notificationResult.sms_sent || notificationResult.email_sent) {
            toast('📧 Notification d\'échec envoyée', {
              icon: '📧',
              duration: 4000
            });
          }
        }
        
        // Afficher les détails des notifications dans la console
        if (notificationResult.details) {
          console.log('📊 Détails des notifications:');
          if (notificationResult.details.sms) {
            console.log('   SMS:', notificationResult.details.sms.success ? '✅' : '❌', notificationResult.details.sms.error || '');
          }
          if (notificationResult.details.email) {
            console.log('   Email:', notificationResult.details.email.success ? '✅' : '❌', notificationResult.details.email.error || '');
          }
        }
      } else {
        console.error('⚠️ Erreur lors de l\'envoi des notifications');
        const errorData = await notificationResponse.json();
        console.error('Détails de l\'erreur:', errorData);
        
        // Afficher un toast d'erreur si les notifications échouent
        toast('⚠️ Erreur lors de l\'envoi des notifications', {
          icon: '⚠️',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des notifications:', error);
      
      // Afficher un toast d'erreur en cas d'exception
      toast('❌ Erreur lors de l\'envoi des notifications', {
        icon: '❌',
        duration: 4000
      });
    }
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
      // Calculer le montant à payer en déduisant les frais de 6.5%
      const montantDemande = request.montant_demande;
      const fraisService = Math.round(montantDemande * 0.065); // 6.5% des frais
      const montantAPayer = montantDemande - fraisService;

      console.log('🚀 Début du paiement pour la demande:', request.id);
      console.log('📋 Données de paiement:', {
        montantDemande: montantDemande,
        fraisService: fraisService,
        montantAPayer: montantAPayer,
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
          amount: montantAPayer, // On paie le montant moins les frais
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
        
        // Vérifier automatiquement le statut et envoyer les notifications
        setTimeout(() => {
          checkPaymentStatusAndNotify(result.pay_id);
        }, 5000); // Commencer la vérification après 5 secondes pour laisser le temps au paiement
        
        // Ne pas fermer le modal immédiatement, attendre le résultat
        // onClose();
        // if (onPaymentSuccess) {
        //   onPaymentSuccess();
        // }
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

  const hasCancelledTransactions = (request: UISalaryAdvanceRequest | null): boolean => {
    if (!request || !request.transactions) return false;
    return request.transactions.some((t: { statut: string }) => t.statut === 'ANNULEE');
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
                {hasCancelledTransactions(request) ? 'Relancer le paiement' : 'Paiement de l\'avance'}
              </h2>
              <p className="text-sm text-[var(--zalama-text-secondary)]">
                Demande #{request.id.slice(0, 8)}
                {hasCancelledTransactions(request) && (
                  <span className="ml-2 text-orange-600">(Relancement)</span>
                )}
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
                    <span className="text-[var(--zalama-text-secondary)]">Montant demandé:</span>
                    <span className="font-semibold text-[var(--zalama-success)]">
                      {formatCurrency(request.montant_demande)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--zalama-text-secondary)]">Frais de service (6.5%):</span>
                    <span className="font-medium text-[var(--zalama-text-secondary)]">
                      -{formatCurrency(Math.round(request.montant_demande * 0.065))}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[var(--zalama-border)] pt-1 mt-1">
                    <span className="text-[var(--zalama-text-secondary)] font-medium">Montant à payer:</span>
                    <span className="font-bold text-[var(--zalama-blue)] text-base">
                      {formatCurrency(request.montant_demande - Math.round(request.montant_demande * 0.065))}
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
                {request.numero_reception && (
                  <p className="text-xs text-[var(--zalama-success)] mt-1">
                    ✅ Numéro pré-rempli depuis la demande
                  </p>
                )}
                {!request.numero_reception && request.employe?.telephone && (
                  <p className="text-xs text-[var(--zalama-warning)] mt-1">
                    ⚠️ Numéro pré-rempli depuis les données de l&apos;employé (vérifiez si à jour)
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

              {/* Message de relancement */}
              {hasCancelledTransactions(request) && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-orange-800">
                      <p className="font-medium">Relancement de paiement:</p>
                      <p>Une transaction précédente a échoué. Cette nouvelle tentative mettra à jour le statut de la transaction existante.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Information sur la transaction existante */}
              {existingTransaction && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Transaction existante détectée:</p>
                      <div className="mt-1 space-y-1">
                        <p>ID: {existingTransaction.numero_transaction}</p>
                        <p>Statut: {existingTransaction.statut}</p>
                        <p>Montant: {formatCurrency(existingTransaction.montant)}</p>
                        <p>Date: {new Date(existingTransaction.date_creation).toLocaleString('fr-FR')}</p>
                      </div>
                      {existingTransaction.statut === 'EFFECTUEE' && (
                        <p className="mt-2 font-medium text-green-700">
                          ✅ Cette demande a déjà été payée avec succès
                        </p>
                      )}
                      {existingTransaction.statut !== 'EFFECTUEE' && (
                        <p className="mt-2 font-medium text-orange-700">
                          ⚠️ Une transaction précédente existe mais n&apos;a pas réussi
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Statut de vérification */}
              {isCheckingStatus && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Vérification du statut... (Tentative {retryCount + 1}/10)</p>
                      <p>Vérification automatique du paiement en cours</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Résultat du statut */}
              {paymentStatus === 'success' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium">✅ Paiement confirmé!</p>
                      <p>Le paiement a été traité avec succès. SMS et email de confirmation envoyés.</p>
                    </div>
                  </div>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium">❌ Paiement échoué</p>
                      <p>Le paiement n&apos;a pas pu être traité. Veuillez réessayer.</p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-4 border-t border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] flex-shrink-0">
          {paymentStatus === null ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-[var(--zalama-text)] bg-[var(--zalama-bg-lighter)] hover:bg-[var(--zalama-bg)] rounded-lg transition-colors"
                disabled={isProcessing || isCheckingStatus || isCheckingExisting}
                aria-label="Annuler le paiement"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="payment-form"
                disabled={isProcessing || isCheckingStatus || isCheckingExisting || (existingTransaction?.statut === 'EFFECTUEE')}
                className="flex-1 px-4 py-2 bg-[var(--zalama-success)] hover:bg-[var(--zalama-success-accent)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                aria-label={`Payer ${formatCurrency(request.montant_demande - Math.round(request.montant_demande * 0.065))}`}
              >
                {isProcessing || isCheckingExisting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isCheckingExisting ? 'Vérification...' : 'Traitement...'}
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    {existingTransaction?.statut === 'EFFECTUEE' 
                      ? 'Déjà payé' 
                      : hasCancelledTransactions(request)
                      ? `Relancer ${formatCurrency(request.montant_demande - Math.round(request.montant_demande * 0.065))}`
                      : `Payer ${formatCurrency(request.montant_demande - Math.round(request.montant_demande * 0.065))}`
                    }
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onPaymentSuccess && paymentStatus === 'success') {
                  onPaymentSuccess();
                }
              }}
              className="w-full px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors"
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalePaiementDemande; 