"use client";

import React from 'react';
import { Send, Users } from 'lucide-react';
import SelecteurEmployes from './SelecteurEmployes';

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

interface FormulaireSMSProps {
  message: string;
  recipients: string;
  employees: Employee[];
  selectedEmployees: Employee[];
  showEmployeeSelector: boolean;
  employeeSearchTerm: string;
  isLoading: boolean;
  onMessageChange: (message: string) => void;
  onRecipientsChange: (recipients: string) => void;
  onToggleEmployeeSelector: () => void;
  onEmployeeSearchChange: (term: string) => void;
  onToggleEmployee: (employee: Employee) => void;
  onAddSelectedEmployees: () => void;
  onSend: () => void;
}

const FormulaireSMS: React.FC<FormulaireSMSProps> = ({
  message,
  recipients,
  employees,
  selectedEmployees,
  showEmployeeSelector,
  employeeSearchTerm,
  isLoading,
  onMessageChange,
  onRecipientsChange,
  onToggleEmployeeSelector,
  onEmployeeSearchChange,
  onToggleEmployee,
  onAddSelectedEmployees,
  onSend
}) => {
  const parseRecipients = (recipientsString: string): string[] => {
    return recipientsString
      .split(/[,\n]/)
      .map(recipient => recipient.trim())
      .filter(recipient => recipient.length > 0);
  };

  return (
    <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
      <h2 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">Envoi en masse SMS</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
            Message (max 160 caractères)
          </label>
          <textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            rows={4}
            maxLength={160}
            placeholder="Saisissez votre message SMS..."
            className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
          />
          <div className="text-xs text-[var(--zalama-text-secondary)] mt-1">
            {message.length}/160 caractères
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-[var(--zalama-text)]">
              Destinataires (un par ligne ou séparés par des virgules)
            </label>
            <button
              onClick={onToggleEmployeeSelector}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-[var(--zalama-blue)] text-white rounded-md hover:bg-[var(--zalama-blue-accent)] transition-colors"
            >
              <Users className="h-4 w-4" />
              Sélectionner des employés
            </button>
          </div>

          <SelecteurEmployes
            isOpen={showEmployeeSelector}
            employees={employees}
            selectedEmployees={selectedEmployees}
            searchTerm={employeeSearchTerm}
            isLoading={isLoading}
            onSearchChange={onEmployeeSearchChange}
            onToggleEmployee={onToggleEmployee}
            onAddSelected={onAddSelectedEmployees}
          />

          <textarea
            value={recipients}
            onChange={(e) => onRecipientsChange(e.target.value)}
            rows={4}
            placeholder="+224XXXXXXXXX&#10;+224XXXXXXXXX&#10;..."
            className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
          />
          <div className="text-xs text-[var(--zalama-text-secondary)] mt-1">
            {parseRecipients(recipients).length} destinataire(s)
          </div>
        </div>

        <button
          onClick={onSend}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          <Send className="h-4 w-4" />
          {isLoading ? 'Envoi en cours...' : 'Envoyer les SMS'}
        </button>
      </div>
    </div>
  );
};

export default FormulaireSMS; 