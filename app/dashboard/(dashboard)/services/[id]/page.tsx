"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, FileText, DollarSign, Calendar, Edit } from "lucide-react";
import { ServiceDetail } from "@/types/service-detail";
import { format as formatDate } from "date-fns/format";
import { fr } from "date-fns/locale/fr";
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ServiceHeaderProps {
  service: ServiceDetail;
  onBack: () => void;
}

const ServiceHeader: React.FC<ServiceHeaderProps> = ({ service, onBack }) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Button variant="outline" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={service.logo} alt={service.nom} />
          <AvatarFallback>{service.nom.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{service.nom}</h1>
          <p className="text-muted-foreground">{service.description}</p>
        </div>
      </div>
    </div>
  );
};

const ServiceDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;
  
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        
        // Récupérer les détails du service depuis Supabase
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', serviceId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setService(data as ServiceDetail);
        } else {
          setError('Service non trouvé');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du service:', err);
        setError('Erreur lors du chargement du service');
      } finally {
        setLoading(false);
      }
    };
    
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);
  
  const handleBack = () => {
    router.push('/dashboard/services');
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error || !service) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            {error || 'Service non trouvé'}
          </h2>
          <Button onClick={handleBack} variant="outline">
            Retour aux services
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <ServiceHeader service={service} onBack={handleBack} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informations du service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Nom du service
                  </label>
                  <p className="text-lg">{service.nom}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Catégorie
                  </label>
                  <Badge variant="secondary">{service.categorie}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Prix
                  </label>
                  <p className="text-lg font-semibold text-green-600">
                    {service.prix?.toLocaleString('fr-FR')} GNF
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Durée
                  </label>
                  <p className="text-lg">{service.duree || 'Non spécifiée'}</p>
        </div>
      </div>
      
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p className="text-gray-700 mt-1">
                  {service.description || 'Aucune description disponible'}
                </p>
              </div>
            </CardContent>
          </Card>

              <Card>
                <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Statistiques financières
              </CardTitle>
                </CardHeader>
                <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {service.nombreDemandes || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Demandes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {service.nombreTransactions || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {service.montantTotal?.toLocaleString('fr-FR') || 0} GNF
                  </p>
                  <p className="text-sm text-muted-foreground">Montant total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
        </div>
            
        {/* Sidebar */}
        <div className="space-y-6">
              <Card>
                <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informations générales
              </CardTitle>
                </CardHeader>
            <CardContent className="space-y-4">
                    <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Statut
                </label>
                <Badge 
                  variant={service.actif ? "default" : "destructive"}
                  className="mt-1"
                >
                          {service.actif ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Date de création
                </label>
                <p className="text-sm mt-1">
                  {service.dateCreation ? 
                    formatDate(new Date(service.dateCreation), 'dd/MM/yyyy', { locale: fr }) : 
                    'Non spécifiée'
                  }
                </p>
                    </div>
                    
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Responsable
                </label>
                <p className="text-sm mt-1">{service.responsable || 'Non assigné'}</p>
              </div>
                    
                    <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email responsable
                </label>
                <p className="text-sm mt-1">{service.emailResponsable || 'Non spécifié'}</p>
                      </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Téléphone responsable
                </label>
                <p className="text-sm mt-1">{service.telephoneResponsable || 'Non spécifié'}</p>
                  </div>
                </CardContent>
              </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Modifier le service
              </Button>
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Voir les demandes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;