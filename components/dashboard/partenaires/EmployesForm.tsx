import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Employe } from './types';

interface EmployesFormProps {
  employes: Employe[];
  onChange: (employes: Employe[]) => void;
  onExcelImport?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EmployesForm: React.FC<EmployesFormProps> = ({ employes, onChange, onExcelImport }) => {
  const [salaireTotal, setSalaireTotal] = useState<number>(0);
  const [contratsCounts, setContratsCounts] = useState<Record<string, number>>({});

  // Calcul du salaire total et comptage des types de contrats
  useEffect(() => {
    const total = employes.reduce((sum, emp) => sum + (emp.salaireNet || 0), 0);
    setSalaireTotal(total);

    // Comptage des contrats par type
    const counts: Record<string, number> = {};
    employes.forEach(emp => {
      counts[emp.typeContrat] = (counts[emp.typeContrat] || 0) + 1;
    });
    setContratsCounts(counts);
  }, [employes]);

  // Ajout d'un nouvel employé
  const handleAddEmploye = () => {
    const newEmploye: Employe = {
      id: Date.now().toString(),
      nom: '',
      prenom: '',
      genre: 'Homme',
      email: '',
      telephone: '',
      adresse: '',
      poste: '',
      role: '',
      typeContrat: 'CDI',
      salaireNet: 0
    };
    onChange([...employes, newEmploye]);
  };

  // Suppression d'un employé
  const handleRemoveEmploye = (id: string) => {
    onChange(employes.filter(emp => emp.id !== id));
  };

  // Mise à jour des données d'un employé
  const handleEmployeChange = (id: string, field: keyof Employe, value: any) => {
    const updatedEmployes = employes.map(emp => {
      if (emp.id === id) {
        return { ...emp, [field]: value };
      }
      return emp;
    });
    onChange(updatedEmployes);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Informations sur les employés</h3>
        <div className="flex gap-2">
          <label
            htmlFor="excel-import"
            className="flex items-center gap-1 px-3 py-1 bg-[var(--zalama-success)] hover:bg-[var(--zalama-success-accent)] text-white rounded-lg transition-colors text-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Importer Excel
            <input
              type="file"
              id="excel-import"
              accept=".xlsx, .xls"
              onChange={onExcelImport}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={handleAddEmploye}
            className="flex items-center gap-1 px-3 py-1 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            Ajouter un employé
          </button>
        </div>
      </div>

      {/* Résumé des employés */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-[var(--zalama-bg-lighter)] rounded-lg">
        <div>
          <p className="text-sm text-[var(--zalama-text-secondary)]">Nombre d'employés</p>
          <p className="text-xl font-semibold text-[var(--zalama-text)]">{employes.length}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--zalama-text-secondary)]">Salaire net total</p>
          <p className="text-xl font-semibold text-[var(--zalama-success)]">
            {salaireTotal.toLocaleString()} GNF
          </p>
        </div>
        <div>
          <p className="text-sm text-[var(--zalama-text-secondary)]">Types de contrats</p>
          <div className="text-sm text-[var(--zalama-text)]">
            {Object.entries(contratsCounts).map(([type, count]) => (
              <span key={type} className="mr-2">
                {count} {type}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des employés */}
      {employes.length === 0 ? (
        <div className="text-center py-8 text-[var(--zalama-text-secondary)]">
          Aucun employé ajouté. Cliquez sur "Ajouter un employé" pour commencer.
        </div>
      ) : (
        <div className="space-y-6">
          {employes.map((employe, index) => (
            <div key={employe.id} className="p-4 border border-[var(--zalama-border)] rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-[var(--zalama-text)]">Employé #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveEmploye(employe.id)}
                  className="text-[var(--zalama-danger)] hover:text-[var(--zalama-danger-accent)] transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`nom-${employe.id}`} className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Nom</label>
                  <input
                    type="text"
                    id={`nom-${employe.id}`}
                    value={employe.nom}
                    onChange={(e) => handleEmployeChange(employe.id, 'nom', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  />
                </div>
                <div>
                  <label htmlFor={`prenom-${employe.id}`} className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Prénom</label>
                  <input
                    type="text"
                    id={`prenom-${employe.id}`}
                    value={employe.prenom}
                    onChange={(e) => handleEmployeChange(employe.id, 'prenom', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label htmlFor={`genre-${employe.id}`} className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Genre</label>
                <select
                  id={`genre-${employe.id}`}
                  value={employe.genre}
                  onChange={(e) => handleEmployeChange(employe.id, 'genre', e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                >
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label htmlFor={`email-${employe.id}`} className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Email</label>
                  <input
                    type="email"
                    id={`email-${employe.id}`}
                    value={employe.email}
                    onChange={(e) => handleEmployeChange(employe.id, 'email', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  />
                </div>
                <div>
                  <label htmlFor={`telephone-${employe.id}`} className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Téléphone</label>
                  <input
                    type="tel"
                    id={`telephone-${employe.id}`}
                    value={employe.telephone}
                    onChange={(e) => handleEmployeChange(employe.id, 'telephone', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label htmlFor={`adresse-${employe.id}`} className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Adresse</label>
                <input
                  type="text"
                  id={`adresse-${employe.id}`}
                  value={employe.adresse}
                  onChange={(e) => handleEmployeChange(employe.id, 'adresse', e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label htmlFor={`poste-${employe.id}`} className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Poste</label>
                  <input
                    type="text"
                    id={`poste-${employe.id}`}
                    value={employe.poste}
                    onChange={(e) => handleEmployeChange(employe.id, 'poste', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  />
                </div>
                <div>
                  <label htmlFor={`role-${employe.id}`} className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Rôle</label>
                  <input
                    type="text"
                    id={`role-${employe.id}`}
                    value={employe.role}
                    onChange={(e) => handleEmployeChange(employe.id, 'role', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label htmlFor={`typeContrat-${employe.id}`} className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Type de contrat</label>
                  <select
                    id={`typeContrat-${employe.id}`}
                    value={employe.typeContrat}
                    onChange={(e) => handleEmployeChange(employe.id, 'typeContrat', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Consultant">Consultant</option>
                    <option value="Stage">Stage</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label htmlFor={`salaireNet-${employe.id}`} className="block text-sm font-medium text-[var(--zalama-text)] mb-1">Salaire net</label>
                  <input
                    type="number"
                    id={`salaireNet-${employe.id}`}
                    value={employe.salaireNet}
                    onChange={(e) => handleEmployeChange(employe.id, 'salaireNet', parseFloat(e.target.value) || 0)}
                    required
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployesForm;
