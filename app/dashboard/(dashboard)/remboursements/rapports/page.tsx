'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import reimbursementService from '@/services/reimbursementService';
import {
    RapportRemboursementParEmploye,
    RapportRemboursementParPartenaire,
    RapportRemboursementParPeriode,
    StatistiquesRemboursementGlobales
} from '@/types/reimbursement';
import {
    DollarSign,
    Download,
    Filter,
    TrendingDown,
    TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function RapportsRemboursementsPage() {
  const [statistiques, setStatistiques] = useState<StatistiquesRemboursementGlobales | null>(null);
  const [rapportPeriode, setRapportPeriode] = useState<RapportRemboursementParPeriode[]>([]);
  const [rapportPartenaire, setRapportPartenaire] = useState<RapportRemboursementParPartenaire[]>([]);
  const [rapportEmploye, setRapportEmploye] = useState<RapportRemboursementParEmploye[]>([]);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState('30j');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  useEffect(() => {
    loadRapports();
  }, [periode, dateDebut, dateFin]);

  const loadRapports = async () => {
    try {
      setLoading(true);
      const [statistiquesData, periodeData, partenaireData, employeData] = await Promise.all([
        reimbursementService.getStatistiquesGlobales(),
        reimbursementService.getRapportParPeriode({ periode, date_debut: dateDebut, date_fin: dateFin }),
        reimbursementService.getRapportParPartenaire({ periode, date_debut: dateDebut, date_fin: dateFin }),
        reimbursementService.getRapportParEmploye({ periode, date_debut: dateDebut, date_fin: dateFin })
      ]);

      setStatistiques(statistiquesData);
      setRapportPeriode(periodeData);
      setRapportPartenaire(partenaireData);
      setRapportEmploye(employeData);
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
      toast.error('Erreur lors du chargement des rapports');
    } finally {
      setLoading(false);
    }
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'EN_ATTENTE': '#FCD34D',
      'PAYE': '#10B981',
      'EN_RETARD': '#EF4444',
      'ANNULE': '#6B7280'
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  const handleExportRapport = (type: string) => {
    // TODO: Implémenter l'export des rapports
    toast.info(`Export du rapport ${type} à implémenter`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapports de Remboursements</h1>
          <p className="text-muted-foreground">
            Analyse et statistiques des remboursements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExportRapport('complet')}>
            <Download className="h-4 w-4 mr-2" />
            Exporter Rapport
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={periode} onValueChange={setPeriode}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7j">7 derniers jours</SelectItem>
                <SelectItem value="30j">30 derniers jours</SelectItem>
                <SelectItem value="90j">90 derniers jours</SelectItem>
                <SelectItem value="1an">1 an</SelectItem>
                <SelectItem value="personnalise">Période personnalisée</SelectItem>
              </SelectContent>
            </Select>
            
            {periode === 'personnalise' && (
              <>
                <Input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  placeholder="Date de début"
                />
                <Input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  placeholder="Date de fin"
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques globales */}
      {statistiques && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Remboursements</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistiques.total_remboursements}</div>
              <p className="text-xs text-muted-foreground">
                {formatMontant(statistiques.montant_total_a_rembourser)} à rembourser
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remboursements Payés</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistiques.par_statut?.PAYE || 0}</div>
              <p className="text-xs text-muted-foreground">
                {formatMontant(statistiques.montant_total_rembourse)} remboursés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de Remboursement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistiques.total_remboursements > 0 
                  ? Math.round((statistiques.par_statut?.PAYE || 0) / statistiques.total_remboursements * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Remboursements complétés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Retard</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistiques.remboursements_en_retard}</div>
              <p className="text-xs text-muted-foreground">
                {formatMontant(statistiques.montant_en_retard)} en retard
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onglets des rapports */}
      <Tabs defaultValue="evolution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="evolution">Évolution</TabsTrigger>
          <TabsTrigger value="partenaires">Par Partenaire</TabsTrigger>
          <TabsTrigger value="employes">Par Employé</TabsTrigger>
          <TabsTrigger value="statuts">Par Statut</TabsTrigger>
        </TabsList>

        <TabsContent value="evolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Remboursements</CardTitle>
              <CardDescription>
                Évolution du montant des remboursements dans le temps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={rapportPeriode}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periode" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatMontant(Number(value))} />
                  <Line 
                    type="monotone" 
                    dataKey="montant_total" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Montant Total"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="montant_rembourse" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Montant Remboursé"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partenaires" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Remboursements par Partenaire</CardTitle>
              <CardDescription>
                Répartition des remboursements par partenaire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={rapportPartenaire}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="montant_total"
                    >
                      {rapportPartenaire.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatMontant(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>

                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Partenaire</TableHead>
                        <TableHead>Montant Total</TableHead>
                        <TableHead>Remboursé</TableHead>
                        <TableHead>Taux</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rapportPartenaire.map((partenaire) => (
                        <TableRow key={partenaire.partenaire_id}>
                          <TableCell className="font-medium">
                            {partenaire.partenaire_nom}
                          </TableCell>
                          <TableCell>
                            {formatMontant(partenaire.montant_total)}
                          </TableCell>
                          <TableCell>
                            {formatMontant(partenaire.montant_rembourse)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {Math.round(partenaire.taux_remboursement * 100)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Employés par Remboursements</CardTitle>
              <CardDescription>
                Employés avec le plus de remboursements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={rapportEmploye.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="employe_nom" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatMontant(Number(value))} />
                  <Bar dataKey="montant_total" fill="#8884d8" name="Montant Total" />
                  <Bar dataKey="montant_rembourse" fill="#82ca9d" name="Montant Remboursé" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statuts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Statut</CardTitle>
              <CardDescription>
                Répartition des remboursements par statut
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={statistiques?.par_statut ? Object.entries(statistiques.par_statut).map(([status, count]) => ({
                        name: status,
                        value: count
                      })) : []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.keys(statistiques?.par_statut || {}).map((status, index) => (
                        <Cell key={`cell-${index}`} fill={getStatusColor(status)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-4">
                  {statistiques?.par_statut && Object.entries(statistiques.par_statut).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: getStatusColor(status) }}
                        />
                        <span className="font-medium">{status}</span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 