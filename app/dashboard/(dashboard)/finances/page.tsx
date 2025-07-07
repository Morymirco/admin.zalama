"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart,
  Calendar,
  Filter,
  Download
} from "lucide-react";
import FinanceCharts from "@/components/dashboard/finances/FinanceCharts";
import FinanceStats from "@/components/dashboard/finances/FinanceStats";

// Types pour les données financières
interface Transaction {
  id: string;
  montant: number;
  type: 'Débloqué' | 'Récupéré' | 'Revenu' | 'Remboursement';
  description?: string;
  partenaire_id?: string;
  utilisateur_id?: string;
  service_id?: string;
  statut: 'En attente' | 'Validé' | 'Rejeté' | 'Annulé';
  date_transaction: string; // ISO string
  date_validation?: string; // ISO string
  reference?: string;
  created_at: string;
  updated_at: string;
}

interface FinancialStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  transactionCount: number;
  averageTransaction: number;
  monthlyGrowth: number;
}

const FinancesPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    transactionCount: 0,
    averageTransaction: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    // Simuler le chargement des données
    const loadData = async () => {
      setLoading(true);
      
      // Données simulées
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          montant: 50000,
          type: 'Revenu',
          description: 'Paiement service premium',
          statut: 'Validé',
          date_transaction: '2024-06-10T10:30:00Z',
          created_at: '2024-06-10T10:30:00Z',
          updated_at: '2024-06-10T10:30:00Z'
        },
        {
          id: '2',
          montant: 25000,
          type: 'Débloqué',
          description: 'Avance sur salaire',
          statut: 'Validé',
          date_transaction: '2024-06-09T14:20:00Z',
          created_at: '2024-06-09T14:20:00Z',
          updated_at: '2024-06-09T14:20:00Z'
        }
      ];

      const mockStats: FinancialStats = {
        totalRevenue: 1500000,
        totalExpenses: 800000,
        netProfit: 700000,
        transactionCount: 45,
        averageTransaction: 33333,
        monthlyGrowth: 12.5
      };

      setTransactions(mockTransactions);
      setStats(mockStats);
      setLoading(false);
    };

    loadData();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedType !== 'all' && transaction.type !== selectedType) {
      return false;
    }
    return true;
  });

  if (loading) {
  return (
    <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
                </div>
              );
  }
              
              return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Finances</h1>
          <p className="text-muted-foreground">
            Gestion et suivi des finances de la plateforme
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button>
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </Button>
        </div>
      </div>
      
      {/* Statistiques principales */}
      <FinanceStats stats={stats} />

      {/* Onglets */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <FinanceCharts 
            chartData={{
              evolutionMensuelle: [
                { mois: 'Jan', revenus: 150000, depenses: 80000 },
                { mois: 'Fév', revenus: 180000, depenses: 90000 },
                { mois: 'Mar', revenus: 220000, depenses: 110000 },
                { mois: 'Avr', revenus: 200000, depenses: 95000 },
                { mois: 'Mai', revenus: 250000, depenses: 120000 },
                { mois: 'Juin', revenus: 280000, depenses: 130000 }
              ],
              repartitionCategories: [
                { categorie: 'Avances salaire', pourcentage: 40, type: 'depense' },
                { categorie: 'Commissions', pourcentage: 35, type: 'revenu' },
                { categorie: 'Frais opérationnels', pourcentage: 15, type: 'depense' },
                { categorie: 'Services premium', pourcentage: 10, type: 'revenu' }
              ],
              tendances: {
                croissance: 12.5
              }
            }}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transactions récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'Revenu' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <DollarSign className={`h-4 w-4 ${
                          transaction.type === 'Revenu' ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date_transaction).toLocaleDateString('fr-FR')}
                        </p>
          </div>
        </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'Revenu' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {transaction.montant.toLocaleString('fr-FR')} GNF
                      </p>
                      <Badge variant="outline">{transaction.statut}</Badge>
          </div>
        </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Croissance mensuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  +{stats.monthlyGrowth}%
              </div>
                <p className="text-muted-foreground">
                  Par rapport au mois précédent
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Transactions moyennes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.averageTransaction.toLocaleString('fr-FR')} GNF
              </div>
                <p className="text-muted-foreground">
                  Montant moyen par transaction
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancesPage;
