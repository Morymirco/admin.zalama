"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, ArrowLeft, CheckCircle2, XCircle, Clock, Search, Filter, ChevronDown, Users, Settings, Plus, DollarSign, CheckCircle, Edit } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { fr } from "date-fns/locale/fr";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";

// Import des composants
import { ServiceHeader } from "@/components/dashboard/services/ServiceHeader";
import { ServiceStats } from "@/components/dashboard/services/ServiceStats";
import { ServiceDemandes } from "@/components/dashboard/services/ServiceDemandes";
import { ServiceTransactions } from "@/components/dashboard/services/ServiceTransactions";
import { ServiceSidebar } from "@/components/dashboard/services/ServiceSidebar";

// Types pour les données du service
import { ServiceDetail, DemandeService, TransactionService } from "@/types/service-detail";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;
  
  // Types pour les composants enfants
  type DemandeServiceForComponent = {
    id: string;
    reference: string;
    demandeurNom: string;
    dateDemande: string;
    statut: 'EN_ATTENTE' | 'EN_COURS' | 'TRAITEE' | 'REJETEE' | 'ANNULEE';
    priorite: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'URGENTE';
  };
  
  type TransactionServiceForComponent = {
    id: string;
    reference: string;
    demandeurNom: string;
    dateTransaction: string;
    montant: number;
    typePaiement: string;
    statut: 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE' | 'ANNULEE' | 'REMBOURSEE';
  };
  
  // Types pour les données brutes
  type RawDemandeService = DemandeService & {
    dateDemande: string | Timestamp;
  };
  
  type RawTransactionService = TransactionService & {
    dateTransaction: string | Timestamp;
  };
  
  // États pour les données
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [rawDemandes, setRawDemandes] = useState<RawDemandeService[]>([]);
  const [rawTransactions, setRawTransactions] = useState<RawTransactionService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('demandes');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TOUS');
  
  // Convertir les données brutes pour les composants
  const demandes: DemandeServiceForComponent[] = rawDemandes.map(demande => ({
    id: demande.id,
    reference: demande.reference,
    demandeurNom: demande.demandeurNom,
    dateDemande: typeof demande.dateDemande === 'string' 
      ? demande.dateDemande 
      : demande.dateDemande.toDate().toISOString(),
    statut: demande.statut as 'EN_ATTENTE' | 'EN_COURS' | 'TRAITEE' | 'REJETEE' | 'ANNULEE',
    priorite: demande.priorite as 'BASSE' | 'MOYENNE' | 'HAUTE' | 'URGENTE'
  }));
  
  const transactions: TransactionServiceForComponent[] = rawTransactions.map(transaction => ({
    id: transaction.id,
    reference: transaction.reference,
    demandeurNom: transaction.demandeurNom,
    dateTransaction: typeof transaction.dateTransaction === 'string'
      ? transaction.dateTransaction
      : transaction.dateTransaction.toDate().toISOString(),
    montant: transaction.montant,
    typePaiement: transaction.typePaiement,
    statut: transaction.statut as 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE' | 'ANNULEE' | 'REMBOURSEE'
  }));
  
  // Charger les données du service
  useEffect(() => {
    const chargerDonneesService = async () => {
      try {
        setLoading(true);
        
        // Simulation de chargement des données
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Données simulées pour le service
        const serviceSimule: ServiceDetail = {
          id: serviceId,
          nom: 'Service Client Premium',
          description: 'Service dédié à la gestion des clients premium avec support prioritaire',
          responsable: 'Marie Dupont',
          emailResponsable: 'marie.dupont@example.com',
          telephoneResponsable: '+225 07 12 34 56 78',
          dateCreation: '2024-01-15T10:30:00',
          actif: true,
          nombreDemandes: 124,
          nombreTransactions: 98,
          montantTotal: 2450000,
          categorie: 'Support Client',
          statut: 'actif',
          logo: '/images/service-client.png',
          derniereMiseAJour: '2024-06-10T14:25:00'
        };
        
        // Données simulées pour les demandes
        const demandesSimulees: RawDemandeService[] = [
          {
            id: 'dem1',
            reference: 'DEM-2024-001',
            serviceId: serviceId,
            serviceNom: 'Service Client Premium',
            demandeurId: 'user1',
            demandeurNom: 'Jean Dupont',
            demandeurEmail: 'jean.dupont@example.com',
            dateDemande: '2024-06-10T09:15:00',
            statut: 'EN_ATTENTE',
            priorite: 'HAUTE',
            description: 'Problème de connexion à la plateforme',
            commentaires: 'Le client ne parvient pas à se connecter depuis ce matin'
          },
          // Ajoutez d'autres demandes simulées ici...
        ];
        
        // Données simulées pour les transactions
        const transactionsSimulees: RawTransactionService[] = [
          {
            id: 'trans1',
            reference: 'TRX-2024-001',
            serviceId: serviceId,
            serviceNom: 'Service Client Premium',
            demandeId: 'dem1',
            demandeurId: 'user1',
            demandeurNom: 'Jean Dupont',
            demandeurEmail: 'jean.dupont@example.com',
            montant: 25000,
            dateTransaction: '2024-06-10T10:30:00',
            statut: 'VALIDEE',
            typePaiement: 'Mobile Money',
            referencePaiement: 'MOB123456789',
            commentaire: 'Paiement pour service premium'
          },
          // Ajoutez d'autres transactions simulées ici...
        ];
        
        setService(serviceSimule);
        setRawDemandes(demandesSimulees);
        setRawTransactions(transactionsSimulees);
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    if (serviceId) {
      chargerDonneesService();
    }
  }, [serviceId]);
  
  // Gérer la navigation entre les onglets
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  // Gérer la vue des détails d'une demande
  const handleViewDemandeDetails = (demande: DemandeServiceForComponent) => {
    // Implémenter la logique pour afficher les détails d'une demande
    console.log('Détails de la demande:', demande);
    // Ici, vous pourriez ouvrir une modale ou naviguer vers une page de détails
  };
  
  // Gérer la vue des détails d'une transaction
  const handleViewTransactionDetails = (transaction: TransactionServiceForComponent) => {
    // Implémenter la logique pour afficher les détails d'une transaction
    console.log('Détails de la transaction:', transaction);
    // Ici, vous pourriez ouvrir une modale ou naviguer vers une page de détails
  };
  
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[110px] w-full" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }
  
  if (!service) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Service non trouvé</p>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Barre latérale */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r">
          <ServiceSidebar 
            serviceId={serviceId} 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* En-tête du service */}
          <ServiceHeader 
            service={service} 
            onBack={() => router.push('/dashboard/services')} 
          />
          
          {/* Statistiques du service */}
          <ServiceStats service={service} />
          
          {/* Onglets pour les demandes et transactions */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="demandes">Demandes</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="responsable">Responsable</TabsTrigger>
              <TabsTrigger value="parametres">Paramètres</TabsTrigger>
            </TabsList>
            
            {/* Contenu de l'onglet Demandes */}
            <TabsContent value="demandes" className="space-y-4">
              <ServiceDemandes 
                demandes={demandes} 
                onViewDetails={handleViewDemandeDetails} 
              />
            </TabsContent>
            
            {/* Contenu de l'onglet Transactions */}
            <TabsContent value="transactions" className="space-y-4">
              <ServiceTransactions 
                transactions={transactions} 
                onViewDetails={handleViewTransactionDetails} 
              />
            </TabsContent>
            
            {/* Contenu de l'onglet Responsable */}
            <TabsContent value="responsable" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Responsable du service</CardTitle>
                  <CardDescription>
                    Informations de contact du responsable
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback>
                        {service.responsable.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-medium">{service.responsable}</h3>
                      <p className="text-sm text-muted-foreground">{service.emailResponsable}</p>
                      <p className="text-sm text-muted-foreground">{service.telephoneResponsable}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Contenu de l'onglet Paramètres */}
            <TabsContent value="parametres" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres du service</CardTitle>
                  <CardDescription>
                    Gérez les paramètres et les préférences de ce service
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Statut du service</h4>
                      <div className="flex items-center space-x-4">
                        <Badge variant={service.actif ? 'default' : 'secondary'}>
                          {service.actif ? 'Actif' : 'Inactif'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          {service.actif ? 'Désactiver' : 'Activer'}
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-2">Actions</h4>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier les informations
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                          <XCircle className="mr-2 h-4 w-4" />
                          Supprimer le service
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}