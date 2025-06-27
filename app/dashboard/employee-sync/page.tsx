"use client";

import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  UserPlus, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Database,
  Sync,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EmployeeSyncStatus {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  partner_id: string;
  partner_nom: string;
  user_id: string | null;
  sync_status: 'SYNCED' | 'NOT_SYNCED';
  created_at: string;
  updated_at: string;
}

interface SyncResult {
  success: boolean;
  employeeId: string;
  email: string;
  userId?: string;
  password?: string;
  error?: string;
  action: 'CREATED' | 'SYNCED' | 'FAILED' | 'ALREADY_EXISTS';
}

interface BulkSyncResult {
  total: number;
  successful: number;
  failed: number;
  results: SyncResult[];
}

export default function EmployeeSyncPage() {
  const [employees, setEmployees] = useState<EmployeeSyncStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);

  // Charger le statut de synchronisation
  const loadSyncStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees/sync');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setEmployees(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erreur chargement statut:', error);
      toast.error('Erreur lors du chargement du statut de synchronisation');
    } finally {
      setLoading(false);
    }
  };

  // Synchroniser un employé spécifique
  const syncEmployee = async (employeeId: string) => {
    try {
      setSyncing(true);
      const response = await fetch('/api/employees/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync_existing',
          employeeId: employeeId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        const syncResult = result.result as SyncResult;
        setSyncResults(prev => [syncResult, ...prev]);
        
        if (syncResult.success) {
          toast.success(`Employé synchronisé: ${syncResult.email}`);
          if (syncResult.password) {
            toast.success(`Mot de passe: ${syncResult.password}`, { duration: 10000 });
          }
        } else {
          toast.error(`Erreur synchronisation: ${syncResult.error}`);
        }
        
        // Recharger le statut
        await loadSyncStatus();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erreur synchronisation employé:', error);
      toast.error('Erreur lors de la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  // Synchroniser tous les employés
  const syncAllEmployees = async () => {
    try {
      setSyncing(true);
      const response = await fetch('/api/employees/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync_all'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        const bulkResult = result.result as BulkSyncResult;
        setSyncResults(prev => [...bulkResult.results, ...prev]);
        
        toast.success(`Synchronisation terminée: ${bulkResult.successful}/${bulkResult.total} réussis`);
        
        if (bulkResult.failed > 0) {
          toast.error(`${bulkResult.failed} échecs de synchronisation`);
        }
        
        // Recharger le statut
        await loadSyncStatus();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erreur synchronisation globale:', error);
      toast.error('Erreur lors de la synchronisation globale');
    } finally {
      setSyncing(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    loadSyncStatus();
  }, []);

  // Statistiques
  const totalEmployees = employees.length;
  const syncedEmployees = employees.filter(emp => emp.sync_status === 'SYNCED').length;
  const unsyncedEmployees = totalEmployees - syncedEmployees;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--zalama-text)] mb-2">
          Synchronisation des Employés
        </h1>
        <p className="text-[var(--zalama-text-secondary)]">
          Gérer la synchronisation entre les employés et les comptes Supabase Auth
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)]">Total employés</p>
              <p className="text-2xl font-bold text-[var(--zalama-text)]">{totalEmployees}</p>
            </div>
            <Users className="h-8 w-8 text-[var(--zalama-blue)]" />
          </div>
        </div>

        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)]">Synchronisés</p>
              <p className="text-2xl font-bold text-green-600">{syncedEmployees}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)]">Non synchronisés</p>
              <p className="text-2xl font-bold text-orange-600">{unsyncedEmployees}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)]">Taux de sync</p>
              <p className="text-2xl font-bold text-[var(--zalama-text)]">
                {totalEmployees > 0 ? Math.round((syncedEmployees / totalEmployees) * 100) : 0}%
              </p>
            </div>
            <Database className="h-8 w-8 text-[var(--zalama-blue)]" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)] mb-8">
        <h2 className="text-xl font-semibold text-[var(--zalama-text)] mb-4">
          Actions de synchronisation
        </h2>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={loadSyncStatus}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Actualiser
          </button>

          <button
            onClick={syncAllEmployees}
            disabled={syncing || unsyncedEmployees === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-success)] hover:bg-[var(--zalama-success-accent)] text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sync className="h-4 w-4" />
            )}
            Synchroniser tous ({unsyncedEmployees})
          </button>

          <button
            onClick={() => setShowPasswords(!showPasswords)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-gray)] hover:bg-[var(--zalama-gray-accent)] text-white rounded-lg transition-colors"
          >
            {showPasswords ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {showPasswords ? 'Masquer' : 'Afficher'} les mots de passe
          </button>
        </div>
      </div>

      {/* Liste des employés */}
      <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)] mb-8">
        <h2 className="text-xl font-semibold text-[var(--zalama-text)] mb-4">
          Statut de synchronisation des employés
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--zalama-blue)]" />
          </div>
        ) : employees.length === 0 ? (
          <p className="text-center py-8 text-[var(--zalama-text-secondary)]">
            Aucun employé trouvé
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--zalama-border)]">
                  <th className="text-left py-3 px-4 font-medium text-[var(--zalama-text)]">Employé</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--zalama-text)]">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--zalama-text)]">Partenaire</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--zalama-text)]">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--zalama-text)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--zalama-border)]">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-[var(--zalama-bg-light)]/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-[var(--zalama-blue)]/10 flex items-center justify-center text-[var(--zalama-blue)] font-medium">
                          {employee.prenom[0]}{employee.nom[0]}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-[var(--zalama-text)]">
                            {employee.prenom} {employee.nom}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[var(--zalama-text)]">
                      {employee.email}
                    </td>
                    <td className="py-3 px-4 text-[var(--zalama-text)]">
                      {employee.partner_nom}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        employee.sync_status === 'SYNCED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {employee.sync_status === 'SYNCED' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {employee.sync_status === 'SYNCED' ? 'Synchronisé' : 'Non synchronisé'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {employee.sync_status === 'NOT_SYNCED' && (
                        <button
                          onClick={() => syncEmployee(employee.id)}
                          disabled={syncing}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded transition-colors disabled:opacity-50"
                        >
                          {syncing ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Sync className="h-3 w-3" />
                          )}
                          Sync
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Résultats de synchronisation */}
      {syncResults.length > 0 && (
        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <h2 className="text-xl font-semibold text-[var(--zalama-text)] mb-4">
            Résultats de synchronisation ({syncResults.length})
          </h2>
          
          <div className="space-y-3">
            {syncResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium text-[var(--zalama-text)]">
                      {result.email}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      result.action === 'CREATED' ? 'bg-blue-100 text-blue-800' :
                      result.action === 'SYNCED' ? 'bg-green-100 text-green-800' :
                      result.action === 'ALREADY_EXISTS' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.action}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--zalama-text-secondary)]">
                    {new Date().toLocaleTimeString('fr-FR')}
                  </span>
                </div>
                
                {result.success && result.password && showPasswords && (
                  <div className="mt-2 text-sm">
                    <span className="text-[var(--zalama-text-secondary)]">Mot de passe: </span>
                    <code className="bg-[var(--zalama-bg-lighter)] px-2 py-1 rounded text-[var(--zalama-text)]">
                      {result.password}
                    </code>
                  </div>
                )}
                
                {!result.success && result.error && (
                  <div className="mt-2 text-sm text-red-600">
                    Erreur: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={() => setSyncResults([])}
            className="mt-4 px-4 py-2 bg-[var(--zalama-gray)] hover:bg-[var(--zalama-gray-accent)] text-white rounded-lg transition-colors"
          >
            Effacer les résultats
          </button>
        </div>
      )}
    </div>
  );
} 