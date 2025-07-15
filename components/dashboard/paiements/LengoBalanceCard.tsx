"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BalanceData {
  status: string;
  balance: string;
  currency: string;
}

interface BalanceResponse {
  success: boolean;
  data: BalanceData;
  formattedBalance: string;
}

export function LengoBalanceCard() {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [formattedBalance, setFormattedBalance] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchBalance = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/lengo-balance');
      const data: BalanceResponse = await response.json();

      if (data.success) {
        setBalance(data.data);
        setFormattedBalance(data.formattedBalance);
        setLastUpdate(new Date());
        toast.success('Solde mis à jour avec succès');
      } else {
        toast.error(data.error || 'Erreur lors de la récupération du solde');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du solde:', error);
      toast.error('Erreur de connexion lors de la récupération du solde');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return '🟢';
      case 'error':
        return '🔴';
      default:
        return '🟡';
    }
  };

  return (
    <Card className="border-[var(--zalama-border)] bg-[var(--zalama-bg)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[var(--zalama-blue)]" />
            <CardTitle className="text-[var(--zalama-text)]">Solde Lengo Pay</CardTitle>
          </div>
          <Button
            onClick={fetchBalance}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="border-[var(--zalama-border)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
        <CardDescription className="text-[var(--zalama-text-secondary)]">
          Solde actuel du compte marchand
        </CardDescription>
      </CardHeader>
      <CardContent>
        {balance ? (
          <div className="space-y-4">
            {/* Solde principal */}
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--zalama-text)] mb-1">
                {formattedBalance}
              </div>
              <div className="text-sm text-[var(--zalama-text-secondary)]">
                Solde disponible
              </div>
            </div>

            {/* Détails du statut */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--zalama-border)]">
              <div className="text-center">
                <div className="text-sm text-[var(--zalama-text-secondary)] mb-1">
                  Statut API
                </div>
                <div className={`flex items-center justify-center gap-1 text-sm font-medium ${getStatusColor(balance.status)}`}>
                  <span>{getStatusIcon(balance.status)}</span>
                  {balance.status}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-[var(--zalama-text-secondary)] mb-1">
                  Devise
                </div>
                <div className="text-sm font-medium text-[var(--zalama-text)]">
                  {balance.currency}
                </div>
              </div>
            </div>

            {/* Dernière mise à jour */}
            {lastUpdate && (
              <div className="text-center pt-2 border-t border-[var(--zalama-border)]">
                <div className="text-xs text-[var(--zalama-text-secondary)]">
                  Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[var(--zalama-blue)]" />
                <span className="text-[var(--zalama-text-secondary)]">Chargement du solde...</span>
              </div>
            ) : (
              <div className="text-[var(--zalama-text-secondary)]">
                Impossible de charger le solde
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 