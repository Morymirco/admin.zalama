"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  Clock,
  Plus,
  Filter,
  Search
} from "lucide-react";
import { Alerte } from "@/types/alerte";

const AlertesPage = () => {
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Critique' | 'Importante' | 'Information'>('all');

  useEffect(() => {
    // Simuler le chargement des données
    const loadAlertes = async () => {
      setLoading(true);
      
      // Données simulées
      const mockAlertes: Alerte[] = [
        {
          id: '1',
          titre: 'Système de paiement en maintenance',
          description: 'Le système de paiement sera en maintenance de 2h à 4h du matin',
          type: 'Critique',
          statut: 'En cours',
          dateCreation: '2024-06-10T10:30:00Z',
          source: 'Système',
          assigneA: 'Équipe technique'
        },
        {
          id: '2',
          titre: 'Nouveau partenaire ajouté',
          description: 'Le partenaire "TechCorp" a été ajouté avec succès',
          type: 'Information',
          statut: 'Résolue',
          dateCreation: '2024-06-09T14:20:00Z',
          dateResolution: '2024-06-09T14:25:00Z',
          source: 'Administration'
        }
      ];

      setAlertes(mockAlertes);
      setLoading(false);
    };

    loadAlertes();
  }, []);

  const filteredAlertes = alertes.filter(alerte => {
    if (filter === 'all') return true;
    return alerte.type === filter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Critique':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'Importante':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'Information':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Critique':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Importante':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Information':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Résolue':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'En cours':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Nouvelle':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Alertes</h1>
          <p className="text-muted-foreground">
            Gestion et suivi des alertes système
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle alerte
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Toutes
        </Button>
        <Button
          variant={filter === 'Critique' ? 'default' : 'outline'}
          onClick={() => setFilter('Critique')}
        >
          Critiques
        </Button>
        <Button
          variant={filter === 'Importante' ? 'default' : 'outline'}
          onClick={() => setFilter('Importante')}
        >
          Importantes
        </Button>
        <Button
          variant={filter === 'Information' ? 'default' : 'outline'}
          onClick={() => setFilter('Information')}
        >
          Informations
        </Button>
      </div>

      {/* Liste des alertes */}
      <div className="space-y-4">
        {filteredAlertes.map((alerte) => (
          <Card key={alerte.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="mt-1">
                    {getTypeIcon(alerte.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{alerte.titre}</h3>
                      <Badge className={getTypeColor(alerte.type)}>
                        {alerte.type}
                      </Badge>
                      <Badge className={getStatusColor(alerte.statut)}>
                        {alerte.statut}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{alerte.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Source: {alerte.source}</span>
                      {alerte.assigneA && (
                        <span>Assigné à: {alerte.assigneA}</span>
                      )}
                      <span>
                        Créée le: {new Date(alerte.dateCreation).toLocaleDateString('fr-FR')}
                      </span>
                      {alerte.dateResolution && (
                        <span>
                          Résolue le: {new Date(alerte.dateResolution).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Résoudre
                  </Button>
                  <Button variant="outline" size="sm">
                    <Clock className="h-4 w-4 mr-1" />
                    Assigner
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAlertes.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune alerte trouvée
          </h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Aucune alerte n\'est actuellement active.'
              : `Aucune alerte de type "${filter}" n'est actuellement active.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AlertesPage;
