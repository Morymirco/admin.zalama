"use client";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CreditCard, TrendingUp } from 'lucide-react';

interface Transaction {
  id: string;
  montant: number;
  statut: 'EFFECTUEE' | 'ANNULEE';
  methode_paiement: string;
  date_transaction: string;
  employe?: { nom: string; prenom: string };
  entreprise?: { nom: string };
}

interface TransactionsSummaryProps {
  transactions: Transaction[];
  loading?: boolean;
}

export function TransactionsSummary({ transactions, loading = false }: TransactionsSummaryProps) {
  if (loading) {
    return (
      <Card className="border-[var(--zalama-border)] bg-[var(--zalama-card)] shadow-lg">
        <CardHeader>
          <CardTitle className="text-[var(--zalama-text)]">Résumé des Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-[var(--zalama-bg-lighter)] rounded w-3/4"></div>
            <div className="h-4 bg-[var(--zalama-bg-lighter)] rounded w-1/2"></div>
            <div className="h-4 bg-[var(--zalama-bg-lighter)] rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalTransactions = transactions.length;
  const transactionsEffectuees = transactions.filter(t => t.statut === 'EFFECTUEE').length;
  const transactionsAnnulees = transactions.filter(t => t.statut === 'ANNULEE').length;
  
  const montantTotal = transactions
    .filter(t => t.statut === 'EFFECTUEE')
    .reduce((sum, t) => sum + (t.montant || 0), 0);

  const montantCeMois = transactions
    .filter(t => {
      const transactionDate = new Date(t.date_transaction);
      const now = new Date();
      return t.statut === 'EFFECTUEE' && 
             transactionDate.getMonth() === now.getMonth() &&
             transactionDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + (t.montant || 0), 0);

  // Répartition par méthode de paiement
  const repartitionMethode = transactions.reduce((acc, transaction) => {
    const methode = transaction.methode_paiement || 'Inconnue';
    acc[methode] = (acc[methode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Transactions récentes (5 dernières)
  const transactionsRecentes = transactions
    .filter(t => t.statut === 'EFFECTUEE')
    .sort((a, b) => new Date(b.date_transaction).getTime() - new Date(a.date_transaction).getTime())
    .slice(0, 5);

  return (
    <Card className="border-[var(--zalama-border)] bg-[var(--zalama-card)] shadow-lg">
      <CardHeader>
        <CardTitle className="text-[var(--zalama-text)] flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Résumé des Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistiques principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-[var(--zalama-bg-lighter)] rounded-lg">
            <div className="text-2xl font-bold text-[var(--zalama-text)]">{totalTransactions}</div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">Total</div>
          </div>
          <div className="text-center p-3 bg-[var(--zalama-success)]/20 rounded-lg">
            <div className="text-2xl font-bold text-[var(--zalama-success)]">{transactionsEffectuees}</div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">Effectuées</div>
          </div>
          <div className="text-center p-3 bg-[var(--zalama-danger)]/20 rounded-lg">
            <div className="text-2xl font-bold text-[var(--zalama-danger)]">{transactionsAnnulees}</div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">Annulées</div>
          </div>
          <div className="text-center p-3 bg-[var(--zalama-blue)]/20 rounded-lg">
            <div className="text-2xl font-bold text-[var(--zalama-blue)]">
              {montantTotal.toLocaleString('fr-FR')}
            </div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">GNF Total</div>
          </div>
        </div>

        {/* Montant ce mois */}
        <div className="p-4 bg-[var(--zalama-bg-lighter)] rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--zalama-success)]" />
              <span className="text-[var(--zalama-text)] font-medium">Ce mois</span>
            </div>
            <div className="text-xl font-bold text-[var(--zalama-success)]">
              {montantCeMois.toLocaleString('fr-FR')} GNF
            </div>
          </div>
        </div>

        {/* Répartition par méthode de paiement */}
        <div>
          <h4 className="text-sm font-medium text-[var(--zalama-text)] mb-3">Répartition par méthode</h4>
          <div className="space-y-2">
            {Object.entries(repartitionMethode).map(([methode, count]) => (
              <div key={methode} className="flex items-center justify-between">
                <span className="text-sm text-[var(--zalama-text-secondary)]">{methode}</span>
                <Badge variant="outline" className="border-[var(--zalama-border)] text-[var(--zalama-text)]">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions récentes */}
        <div>
          <h4 className="text-sm font-medium text-[var(--zalama-text)] mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Transactions récentes
          </h4>
          <div className="space-y-2">
            {transactionsRecentes.length > 0 ? (
              transactionsRecentes.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-2 bg-[var(--zalama-bg-lighter)] rounded">
                  <div>
                    <div className="text-sm font-medium text-[var(--zalama-text)]">
                      {transaction.employe?.prenom} {transaction.employe?.nom}
                    </div>
                    <div className="text-xs text-[var(--zalama-text-secondary)]">
                      {transaction.entreprise?.nom} - {transaction.methode_paiement}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[var(--zalama-success)]">
                      {transaction.montant.toLocaleString('fr-FR')} GNF
                    </div>
                    <div className="text-xs text-[var(--zalama-text-secondary)]">
                      {new Date(transaction.date_transaction).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-[var(--zalama-text-secondary)]">
                Aucune transaction récente
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 