"use client";

import { useState, useEffect, useCallback } from 'react';
import { PartnershipRequest, PartnershipRequestStats, PartnershipRequestFilters } from '@/types/partnershipRequest';
import partnershipRequestService from '@/services/partnershipRequestService';
import toast from 'react-hot-toast';

export const useSupabasePartnershipRequests = () => {
  const [requests, setRequests] = useState<PartnershipRequest[]>([]);
  const [stats, setStats] = useState<PartnershipRequestStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    in_review: 0,
    by_domain: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PartnershipRequestFilters>({
    status: 'all',
    activity_domain: undefined,
    search: undefined
  });

  // Charger toutes les demandes
  const loadRequests = useCallback(async (currentFilters?: PartnershipRequestFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await partnershipRequestService.getAll(currentFilters || filters);
      setRequests(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des demandes';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Charger les statistiques
  const loadStats = useCallback(async () => {
    try {
      const data = await partnershipRequestService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  }, []);

  // Charger les données au montage et quand les filtres changent
  useEffect(() => {
    loadRequests();
    loadStats();
  }, [loadRequests, loadStats]);

  // Mettre à jour les filtres
  const updateFilters = useCallback((newFilters: Partial<PartnershipRequestFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    loadRequests(updatedFilters);
  }, [filters, loadRequests]);

  // Approuver une demande
  const approveRequest = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await partnershipRequestService.approve(id);
      
      // Mettre à jour la liste locale
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status: 'approved' as const } : req
      ));
      
      // Recharger les statistiques
      await loadStats();
      
      toast.success('Demande approuvée avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'approbation';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  // Rejeter une demande
  const rejectRequest = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await partnershipRequestService.reject(id);
      
      // Mettre à jour la liste locale
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status: 'rejected' as const } : req
      ));
      
      // Recharger les statistiques
      await loadStats();
      
      toast.success('Demande rejetée');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du rejet';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  // Mettre en révision une demande
  const setInReview = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await partnershipRequestService.setInReview(id);
      
      // Mettre à jour la liste locale
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status: 'in_review' as const } : req
      ));
      
      // Recharger les statistiques
      await loadStats();
      
      toast.success('Demande mise en révision');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise en révision';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  // Supprimer une demande
  const deleteRequest = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await partnershipRequestService.delete(id);
      
      // Mettre à jour la liste locale
      setRequests(prev => prev.filter(req => req.id !== id));
      
      // Recharger les statistiques
      await loadStats();
      
      toast.success('Demande supprimée');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  // Rechercher des demandes
  const searchRequests = useCallback(async (searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await partnershipRequestService.search(searchTerm);
      setRequests(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la recherche';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recharger les données
  const refresh = useCallback(() => {
    loadRequests();
    loadStats();
  }, [loadRequests, loadStats]);

  return {
    requests,
    stats,
    loading,
    error,
    filters,
    updateFilters,
    approveRequest,
    rejectRequest,
    setInReview,
    deleteRequest,
    searchRequests,
    refresh
  };
}; 