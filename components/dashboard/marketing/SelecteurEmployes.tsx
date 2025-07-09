"use client";

import React from 'react';
import { Search, User } from 'lucide-react';

interface Employee {
  id: string;
  label: string;
  value: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  poste: string;
  partenaire_nom: string;
}

interface SelecteurEmployesProps {
  isOpen: boolean;
  employees: Employee[];
  selectedEmployees: Employee[];
  searchTerm: string;
  isLoading: boolean;
  onSearchChange: (term: string) => void;
  onToggleEmployee: (employee: Employee) => void;
  onAddSelected: () => void;
}

const SelecteurEmployes: React.FC<SelecteurEmployesProps> = ({
  isOpen,
  employees,
  selectedEmployees,
  searchTerm,
  isLoading,
  onSearchChange,
  onToggleEmployee,
  onAddSelected
}) => {
  if (!isOpen) return null;

  const filteredEmployees = employees.filter(employee =>
    employee.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.telephone.includes(searchTerm)
  );

  return (
    <div className="mb-4 p-3 bg-[var(--zalama-bg-lighter)] rounded-lg border border-[var(--zalama-border)]">
      <div className="flex items-center gap-2 mb-3">
        <Search className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
        <input
          type="text"
          placeholder="Rechercher un employé..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-md border border-[var(--zalama-border)] bg-[var(--zalama-card)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--zalama-blue)] mx-auto"></div>
          <p className="text-sm text-[var(--zalama-text-secondary)] mt-2">Chargement des employés...</p>
        </div>
      ) : (
                            <div className="max-h-40 overflow-y-auto space-y-2">
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((employee) => {
                          const isSelected = selectedEmployees.some(emp => emp.id === employee.id);
                          return (
                            <div
                              key={employee.id}
                              onClick={() => onToggleEmployee(employee)}
                              className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                                isSelected 
                                  ? 'bg-[var(--zalama-blue)] text-white' 
                                  : 'bg-[var(--zalama-card)] hover:bg-[var(--zalama-bg-lighter)]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="h-3 w-3"
                              />
                              <User className="h-3 w-3" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium truncate">{employee.label}</div>
                                <div className="text-xs opacity-75 truncate">{employee.telephone}</div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-3 text-[var(--zalama-text-secondary)]">
                          <p className="text-xs">Aucun employé trouvé</p>
                        </div>
                      )}
                    </div>
      )}

                        {selectedEmployees.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[var(--zalama-border)]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--zalama-text)]">
                          {selectedEmployees.length} employé(s) sélectionné(s)
                        </span>
                        <button
                          onClick={onAddSelected}
                          className="px-2 py-1 text-xs bg-[var(--zalama-success)] text-white rounded-md hover:bg-[var(--zalama-success-accent)] transition-colors"
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  )}
    </div>
  );
};

export default SelecteurEmployes; 