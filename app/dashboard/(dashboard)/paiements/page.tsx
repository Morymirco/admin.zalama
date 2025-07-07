"use client";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, Send, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PaymentForm {
  amount: string;
  phone: string;
  description: string;
  paymentMethod: string;
  typeAccount: string;
  partnerId: string;
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

  const handleInputChange = (field: keyof PaymentForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Réinitialiser les erreurs
    setError(null);

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
        toast.success('Paiement initié avec succès!');
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

              <div className="flex justify-end pt-4">
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