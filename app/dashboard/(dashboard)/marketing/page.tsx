"use client";

import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Importation des composants
import {
  StatistiquesMarketing,
  ListeMessages,
  FormulaireSMS,
  FormulaireEmail
} from '@/components/dashboard/marketing';

interface SMSBalance {
  balance: number;
  currency: string;
}

interface SMSMessage {
  id: string;
  to: string;
  message: string;
  sender_name: string;
  status: string;
  created_at: string;
  cost?: number;
}

interface MessageStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

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

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'sms' | 'email'>('sms');
  const [smsBalance, setSmsBalance] = useState<SMSBalance | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [recentMessages, setRecentMessages] = useState<SMSMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageStats, setMessageStats] = useState<MessageStats>({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0
  });
  
  // États pour SMS
  const [smsMessage, setSmsMessage] = useState('');
  const [smsRecipients, setSmsRecipients] = useState('');
  const [smsLoading, setSmsLoading] = useState(false);
  
  // États pour Email
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // États pour la sélection d'employés
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');

  // Charger le solde SMS et les messages récents au montage
  useEffect(() => {
    loadSMSBalance();
    loadRecentMessages();
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await fetch('/api/employees?includePhone=true&active=true');
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.employees || []);
      } else {
        console.error('Erreur lors du chargement des employés:', data.error);
        toast.error('Erreur lors du chargement des employés');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      toast.error('Erreur lors du chargement des employés');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const loadSMSBalance = async () => {
    try {
      setLoadingBalance(true);
      const response = await fetch('/api/sms/balance');
      const data = await response.json();
      
      if (data.success) {
        setSmsBalance(data.balance);
      } else {
        console.error('Erreur lors du chargement du solde SMS:', data.error);
        toast.error('Erreur lors du chargement du solde SMS');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du solde SMS:', error);
      toast.error('Erreur lors du chargement du solde SMS');
    } finally {
      setLoadingBalance(false);
    }
  };

  const loadRecentMessages = async () => {
    try {
      setLoadingMessages(true);
      const response = await fetch('/api/sms/messages?limit=10');
      const data = await response.json();
      
      if (data.success) {
        setRecentMessages(data.messages || []);
        calculateMessageStats(data.messages || []);
      } else {
        console.error('Erreur lors du chargement des messages:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const calculateMessageStats = (messages: SMSMessage[]) => {
    const stats = {
      total: messages.length,
      sent: messages.filter(m => m.status === 'sent' || m.status === 'delivered').length,
      failed: messages.filter(m => m.status === 'failed' || m.status === 'error').length,
      pending: messages.filter(m => m.status === 'pending' || m.status === 'queued').length
    };
    setMessageStats(stats);
  };

  const parseRecipients = (recipientsString: string): string[] => {
    return recipientsString
      .split(/[,\n]/)
      .map(recipient => recipient.trim())
      .filter(recipient => recipient.length > 0);
  };

  const toggleEmployeeSelection = (employee: Employee) => {
    const isSelected = selectedEmployees.some(emp => emp.id === employee.id);
    
    if (isSelected) {
      setSelectedEmployees(selectedEmployees.filter(emp => emp.id !== employee.id));
    } else {
      setSelectedEmployees([...selectedEmployees, employee]);
    }
  };

  const addSelectedEmployeesToRecipients = () => {
    const phoneNumbers = selectedEmployees.map(emp => emp.telephone);
    const currentRecipients = parseRecipients(smsRecipients);
    const newRecipients = [...new Set([...currentRecipients, ...phoneNumbers])];
    setSmsRecipients(newRecipients.join('\n'));
    setSelectedEmployees([]);
    setShowEmployeeSelector(false);
    toast.success(`${phoneNumbers.length} employé(s) ajouté(s) aux destinataires`);
  };

  const sendBulkSMS = async () => {
    if (!smsMessage.trim()) {
      toast.error('Le message SMS est requis');
      return;
    }
    if (smsMessage.length > 160) {
      toast.error('Le message SMS ne peut pas dépasser 160 caractères');
      return;
    }

    const recipients = parseRecipients(smsRecipients);
    if (recipients.length === 0) {
      toast.error('Au moins un destinataire est requis');
      return;
    }

    try {
      setSmsLoading(true);
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipients,
          message: smsMessage,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`SMS envoyés avec succès à ${recipients.length} destinataire(s)`);
        setSmsMessage('');
        setSmsRecipients('');
        loadRecentMessages();
        loadSMSBalance();
      } else {
        toast.error(data.error || 'Erreur lors de l\'envoi des SMS');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi des SMS:', error);
      toast.error('Erreur lors de l\'envoi des SMS');
    } finally {
      setSmsLoading(false);
    }
  };

  const sendBulkEmail = async () => {
    if (!emailSubject.trim()) {
      toast.error('Le sujet de l\'email est requis');
      return;
    }
    if (!emailMessage.trim()) {
      toast.error('Le message email est requis');
      return;
    }

    const recipients = parseRecipients(emailRecipients);
    if (recipients.length === 0) {
      toast.error('Au moins un destinataire est requis');
      return;
    }

    try {
      setEmailLoading(true);
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipients,
          subject: emailSubject,
          message: emailMessage,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Emails envoyés avec succès à ${recipients.length} destinataire(s)`);
        setEmailSubject('');
        setEmailMessage('');
        setEmailRecipients('');
      } else {
        toast.error(data.error || 'Erreur lors de l\'envoi des emails');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi des emails:', error);
      toast.error('Erreur lors de l\'envoi des emails');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 w-full max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--zalama-text)]">Marketing</h1>
        <p className="text-[var(--zalama-text-secondary)]">Envoi en masse de SMS et emails</p>
      </div>

      {/* Layout principal avec sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Onglets */}
          <div className="flex gap-1 bg-[var(--zalama-bg-lighter)] rounded-lg p-1">
            <button
              onClick={() => setActiveTab('sms')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors flex-1 ${
                activeTab === 'sms'
                  ? 'bg-[var(--zalama-card)] text-[var(--zalama-text)] shadow-sm'
                  : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              SMS
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors flex-1 ${
                activeTab === 'email'
                  ? 'bg-[var(--zalama-card)] text-[var(--zalama-text)] shadow-sm'
                  : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]'
              }`}
            >
              <Mail className="h-4 w-4" />
              Email
            </button>
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'sms' ? (
            <FormulaireSMS
              message={smsMessage}
              recipients={smsRecipients}
              employees={employees}
              selectedEmployees={selectedEmployees}
              showEmployeeSelector={showEmployeeSelector}
              employeeSearchTerm={employeeSearchTerm}
              isLoading={smsLoading}
              onMessageChange={setSmsMessage}
              onRecipientsChange={setSmsRecipients}
              onToggleEmployeeSelector={() => setShowEmployeeSelector(!showEmployeeSelector)}
              onEmployeeSearchChange={setEmployeeSearchTerm}
              onToggleEmployee={toggleEmployeeSelection}
              onAddSelectedEmployees={addSelectedEmployeesToRecipients}
              onSend={sendBulkSMS}
            />
          ) : (
            <FormulaireEmail
              subject={emailSubject}
              message={emailMessage}
              recipients={emailRecipients}
              isLoading={emailLoading}
              onSubjectChange={setEmailSubject}
              onMessageChange={setEmailMessage}
              onRecipientsChange={setEmailRecipients}
              onSend={sendBulkEmail}
            />
          )}
        </div>

        {/* Sidebar avec statistiques et messages récents */}
        <div className="space-y-6">
          {/* Statistiques */}
          <StatistiquesMarketing
            smsBalance={smsBalance}
            messageStats={messageStats}
            loadingBalance={loadingBalance}
            onRefreshBalance={loadSMSBalance}
          />

          {/* Messages récents */}
          <ListeMessages
            messages={recentMessages}
            isLoading={loadingMessages}
            smsBalance={smsBalance}
            onRefresh={loadRecentMessages}
          />
        </div>
      </div>
    </div>
  );
} 