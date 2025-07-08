"use client";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, Send, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TransactionsList } from '@/components/dashboard/paiements/TransactionsList';
import { useTransactions, Transaction } from '@/hooks/useTransactions';

interface PaymentForm {
  amount: string;
  phone: string;
  description: string;
  paymentMethod: string;
  typeAccount: string;
  partnerId: string;
}

interface PaymentResult {
  pay_id: string;
  status: string;
  amount?: number;
  account?: number;
  date?: string;
  transaction?: any;
}

export default function PaiementsPage() {
  const [formData, setFormData] = useState<PaymentForm>({
    amount: '',
    phone: '',
    description: '',
    paymentMethod: 'lengo',
    typeAccount: 'lp-om-gn',
    partnerId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Hook pour gérer les transactions
  const { addTransaction, updateTransaction, refreshTransactions } = useTransactions();

  const handleInputChange = (field: keyof PaymentForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Réinitialiser les erreurs et résultats
    setError(null);
    setPaymentResult(null);

    if (!formData.amount || !formData.phone || !formData.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Le montant doit être un nombre positif');
      return;
    }

    // Validation du montant pour Lengo Pay (GNF)
    if (amount < 1000) {
      toast.error('Le montant minimum est de 1000 GNF');
      return;
    }

    if (amount > 1000000) {
      toast.error('Le montant maximum est de 1,000,000 GNF');
      return;
    }

    // Vérifier que le montant est un multiple de 100
    if (amount % 100 !== 0) {
      toast.error('Le montant doit être un multiple de 100 GNF');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/payments/lengo-cashin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          phone: formData.phone,
          description: formData.description,
          type_account: formData.typeAccount,
          partnerId: formData.partnerId || null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Paiement initié avec succès, données reçues:', data);
        toast.success('Paiement initié avec succès!');
        
        // Ajouter la transaction à la liste locale
        if (data.transaction) {
          addTransaction(data.transaction);
        }
        
        // Rafraîchir la liste des transactions
        await refreshTransactions();
        
        // Vérifier automatiquement le statut après 3 secondes
        if (data.pay_id) {
          console.log('🔍 pay_id trouvé, vérification automatique dans 3 secondes:', data.pay_id);
          setTimeout(async () => {
            console.log('⏰ Déclenchement de la vérification automatique pour:', data.pay_id);
            await checkPaymentStatus(data.pay_id);
          }, 3000);
        } else {
          console.log('⚠️ pay_id manquant dans la réponse:', data);
        }
        
        // Réinitialiser le formulaire
        setFormData({
          amount: '',
          phone: '',
          description: '',
          paymentMethod: 'lengo',
          typeAccount: 'lp-om-gn',
          partnerId: ''
        });
      } else {
        // Gestion spécifique des erreurs Lengo Pay
        let errorMessage = data.error || 'Erreur lors de l\'initiation du paiement';
        
        if (data.error && data.error.includes('Insufficient balance')) {
          errorMessage = 'Solde insuffisant sur le compte Lengo Pay. Veuillez recharger votre compte ou contacter le support.';
        } else if (data.error && data.error.includes('Unsupported amount')) {
          errorMessage = 'Montant non supporté. Utilisez un montant entre 1,000 et 1,000,000 GNF (multiples de 100).';
        } else if (data.error && data.error.includes('Invalid account')) {
          errorMessage = 'Numéro de téléphone invalide. Vérifiez le format du numéro Guinée.';
        } else if (data.error && data.error.includes('Invalid websiteid')) {
          errorMessage = 'Erreur de configuration du site. Contactez l\'administrateur.';
        }
        
        // Afficher l'erreur dans l'interface et en toast
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Erreur paiement:', error);
      toast.error('Erreur de connexion lors de l\'initiation du paiement');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async (payId: string) => {
    setIsCheckingStatus(true);
    
    try {
      console.log('🔍 Vérification du statut du paiement:', payId);
      
      const response = await fetch('/api/payments/lengo-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pay_id: payId }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Statut vérifié:', data);
        setPaymentResult(data);
        
        // Mettre à jour la transaction dans la liste locale
        if (data.transaction) {
          updateTransaction(data.transaction.id, {
            statut: data.db_status,
            date_transaction: data.date,
            numero_reception: data.account?.toString(),
            message_callback: data.details?.message
          });
        }
        
        // Rafraîchir la liste des transactions
        await refreshTransactions();
        
        // Afficher un message selon le statut
        switch (data.lengo_status?.toUpperCase()) {
          case 'SUCCESS':
            toast.success('Paiement confirmé avec succès!');
            break;
          case 'PENDING':
          case 'INITIATED':
            toast.info('Paiement en attente de confirmation...');
            break;
          case 'FAILED':
          case 'CANCELLED':
            toast.error('Paiement échoué ou annulé');
            break;
          default:
            toast.info(`Statut du paiement: ${data.lengo_status}`);
        }
      } else {
        console.error('❌ Erreur vérification statut:', data);
        toast.error('Impossible de vérifier le statut du paiement');
      }
    } catch (error) {
      console.error('💥 Erreur lors de la vérification du statut:', error);
      toast.error('Erreur lors de la vérification du statut');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCheckStatus = () => {
    if (paymentResult?.pay_id) {
      checkPaymentStatus(paymentResult.pay_id);
    }
  };

  const handleTransactionSelect = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    // Pré-remplir le formulaire avec les données de la transaction sélectionnée
    setFormData({
      amount: transaction.montant.toString(),
      phone: transaction.numero_compte,
      description: transaction.description,
      paymentMethod: 'lengo',
      typeAccount: transaction.methode_paiement,
      partnerId: transaction.entreprise_id || ''
    });
  };

  const handleSyncTransactions = async () => {
    setIsSyncing(true);
    
    try {
      console.log('🔄 Synchronisation des transactions depuis LengoPay...');
      
      const response = await fetch('/api/payments/sync-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Synchronisation réussie:', data);
        toast.success(`Synchronisation terminée: ${data.synced} nouvelles, ${data.updated} mises à jour`);
        
        // Rafraîchir la liste des transactions
        await refreshTransactions();
      } else {
        console.error('❌ Erreur synchronisation:', data);
        toast.error(data.error || 'Erreur lors de la synchronisation');
      }
    } catch (error) {
      console.error('💥 Erreur lors de la synchronisation:', error);
      toast.error('Erreur de connexion lors de la synchronisation');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[var(--zalama-blue)] rounded-lg">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--zalama-text)]">Paiements</h1>
          <p className="text-[var(--zalama-text-secondary)]">Effectuez des paiements simples via Lengo Pay</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="border-[var(--zalama-border)] bg-[var(--zalama-bg)]">
          <CardHeader>
            <CardTitle className="text-[var(--zalama-text)] flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Nouveau Paiement
            </CardTitle>
            <CardDescription className="text-[var(--zalama-text-secondary)]">
              Remplissez les informations pour initier un paiement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur de paiement</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-[var(--zalama-text)]">
                    Montant (GNF) *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="1000"
                    min="1000"
                    max="1000000"
                    step="100"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]"
                    required
                  />
                  <p className="text-xs text-[var(--zalama-text-secondary)]">
                    Montant entre 1,000 et 1,000,000 GNF (multiples de 100)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[var(--zalama-text)]">
                    Numéro de téléphone *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="620124578"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]"
                    required
                  />
                  <p className="text-xs text-[var(--zalama-text-secondary)]">
                    Format Guinée: 620124578 (sans indicatif pays)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[var(--zalama-text)]">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Description du paiement..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)] min-h-[80px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="typeAccount" className="text-[var(--zalama-text)]">
                    Type de compte *
                  </Label>
                  <Select
                    value={formData.typeAccount}
                    onValueChange={(value) => handleInputChange('typeAccount', value)}
                  >
                    <SelectTrigger className="border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--zalama-bg)] border-[var(--zalama-border)]">
                      <SelectItem value="lp-om-gn">Orange Money Guinée</SelectItem>
                      <SelectItem value="lp-momo-gn">Mobile Money Guinée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partnerId" className="text-[var(--zalama-text)]">
                    ID Partenaire (optionnel)
                  </Label>
                  <Input
                    id="partnerId"
                    type="text"
                    placeholder="ID du partenaire"
                    value={formData.partnerId}
                    onChange={(e) => handleInputChange('partnerId', e.target.value)}
                    className="border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  onClick={handleSyncTransactions}
                  disabled={isSyncing}
                  variant="outline"
                  className="border-[var(--zalama-border)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)] flex items-center gap-2"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Synchronisation...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Synchroniser
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    console.log('🧪 Test manuel - Vérification du statut');
                    // Test avec un pay_id fictif pour vérifier que l'API fonctionne
                    checkPaymentStatus('test-pay-id');
                  }}
                  variant="outline"
                  className="border-[var(--zalama-border)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]"
                >
                  Test API Status
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Initier le paiement
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Résultat du paiement */}
        {paymentResult && (
          <Card className="border-[var(--zalama-border)] bg-[var(--zalama-bg)]">
            <CardHeader>
              <CardTitle className="text-[var(--zalama-text)] flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Résultat du Paiement
              </CardTitle>
              <CardDescription className="text-[var(--zalama-text-secondary)]">
                Détails de la transaction et statut actuel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[var(--zalama-text-secondary)] text-sm">ID de Transaction</Label>
                  <p className="text-[var(--zalama-text)] font-mono text-sm bg-[var(--zalama-bg-light)] p-2 rounded">
                    {paymentResult.pay_id}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[var(--zalama-text-secondary)] text-sm">Statut LengoPay</Label>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    paymentResult.lengo_status?.toUpperCase() === 'SUCCESS' 
                      ? 'bg-green-100 text-green-800' 
                      : paymentResult.lengo_status?.toUpperCase() === 'FAILED' || paymentResult.lengo_status?.toUpperCase() === 'CANCELLED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {paymentResult.lengo_status}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[var(--zalama-text-secondary)] text-sm">Statut en Base</Label>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    paymentResult.db_status === 'PAYE' 
                      ? 'bg-green-100 text-green-800' 
                      : paymentResult.db_status === 'ECHOUE'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {paymentResult.db_status}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[var(--zalama-text-secondary)] text-sm">Montant</Label>
                  <p className="text-[var(--zalama-text)] font-semibold">
                    {paymentResult.amount ? `${paymentResult.amount.toLocaleString()} GNF` : 'N/A'}
                  </p>
                </div>
              </div>

              {paymentResult.account && (
                <div className="space-y-2">
                  <Label className="text-[var(--zalama-text-secondary)] text-sm">Compte Destinataire</Label>
                  <p className="text-[var(--zalama-text)] font-mono">
                    {paymentResult.account}
                  </p>
                </div>
              )}

              {paymentResult.date && (
                <div className="space-y-2">
                  <Label className="text-[var(--zalama-text-secondary)] text-sm">Date de Transaction</Label>
                  <p className="text-[var(--zalama-text)]">
                    {new Date(paymentResult.date).toLocaleString('fr-FR')}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleCheckStatus}
                  disabled={isCheckingStatus}
                  variant="outline"
                  className="border-[var(--zalama-border)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)] flex items-center gap-2"
                >
                  {isCheckingStatus ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Vérifier le statut
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des transactions */}
        <TransactionsList onTransactionSelect={handleTransactionSelect} />

        <Card className="border-[var(--zalama-border)] bg-[var(--zalama-bg)]">
          <CardHeader>
            <CardTitle className="text-[var(--zalama-text)]">Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[var(--zalama-text-secondary)]">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[var(--zalama-blue)] rounded-full mt-2 flex-shrink-0"></div>
              <p>Le paiement sera traité via Lengo Pay et nécessite une confirmation du destinataire</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[var(--zalama-blue)] rounded-full mt-2 flex-shrink-0"></div>
              <p>Le numéro de téléphone doit être au format Guinée (ex: 620124578)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[var(--zalama-blue)] rounded-full mt-2 flex-shrink-0"></div>
              <p>Une transaction sera créée dans la base de données pour le suivi</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[var(--zalama-blue)] rounded-full mt-2 flex-shrink-0"></div>
              <p>Montant minimum: 1,000 GNF, maximum: 1,000,000 GNF (multiples de 100)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--zalama-border)] bg-[var(--zalama-bg)]">
          <CardHeader>
            <CardTitle className="text-[var(--zalama-text)] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[var(--zalama-warning)]" />
              Problèmes courants
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[var(--zalama-text-secondary)]">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[var(--zalama-warning)] rounded-full mt-2 flex-shrink-0"></div>
              <p><strong>Solde insuffisant :</strong> Si vous obtenez cette erreur, le compte Lengo Pay doit être rechargé</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[var(--zalama-warning)] rounded-full mt-2 flex-shrink-0"></div>
              <p><strong>Montant non supporté :</strong> Vérifiez que le montant est entre 1,000 et 1,000,000 GNF</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[var(--zalama-warning)] rounded-full mt-2 flex-shrink-0"></div>
              <p><strong>Numéro invalide :</strong> Assurez-vous que le numéro est au format Guinée (9 chiffres)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[var(--zalama-warning)] rounded-full mt-2 flex-shrink-0"></div>
              <p><strong>Support :</strong> En cas de problème persistant, contactez le support technique</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 