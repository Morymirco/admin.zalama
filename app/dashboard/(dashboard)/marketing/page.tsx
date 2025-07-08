"use client";

import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Mail, 
  MessageSquare, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Eye,
  Calendar,
  ChevronDown,
  Search,
  User
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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

  const filteredEmployees = employees.filter(employee =>
    employee.label.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    employee.telephone.includes(employeeSearchTerm)
  );

  const sendBulkSMS = async () => {
    if (!smsMessage.trim()) {
      toast.error('Le message SMS est requis');
      return;
    }
    if (smsMessage.length > 160) {
      toast.error('Le message SMS ne peut pas dépasser 160 caractères');
      return;
    }
    if (!smsRecipients.trim()) {
      toast.error('Veuillez saisir au moins un destinataire');
      return;
    }

    try {
      setSmsLoading(true);
      const recipients = parseRecipients(smsRecipients);
      
      if (recipients.length === 0) {
        toast.error('Aucun destinataire valide trouvé');
        return;
      }

      // Vérifier le solde SMS
      if (smsBalance && smsBalance.balance < recipients.length) {
        toast.error(`Solde SMS insuffisant. Vous avez ${smsBalance.balance} SMS, mais vous voulez en envoyer ${recipients.length}`);
        return;
      }

      // Envoyer les SMS
      let sentCount = 0;
      let failedCount = 0;

      for (const recipient of recipients) {
        try {
          const response = await fetch('/api/sms/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: [recipient],
              message: smsMessage,
              sender_name: 'ZaLaMa'
            }),
          });

          const result = await response.json();
          if (result.success) {
            sentCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          failedCount++;
          console.error(`Erreur lors de l'envoi du SMS à ${recipient}:`, error);
        }
      }

      // Recharger le solde et les messages
      await loadSMSBalance();
      await loadRecentMessages();

      toast.success(`SMS envoyés: ${sentCount} succès, ${failedCount} échecs`);
      
      // Réinitialiser le formulaire
      setSmsMessage('');
      setSmsRecipients('');

    } catch (error) {
      console.error('Erreur lors de l\'envoi en masse des SMS:', error);
      toast.error('Erreur lors de l\'envoi en masse des SMS');
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
      toast.error('Le message de l\'email est requis');
      return;
    }
    if (!emailRecipients.trim()) {
      toast.error('Veuillez saisir au moins un destinataire');
      return;
    }

    try {
      setEmailLoading(true);
      const recipients = parseRecipients(emailRecipients);
      
      if (recipients.length === 0) {
        toast.error('Aucun destinataire valide trouvé');
        return;
      }

      // Envoyer les emails
      let sentCount = 0;
      let failedCount = 0;

      for (const recipient of recipients) {
        try {
          const response = await fetch('/api/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: recipient,
              subject: emailSubject,
              html: emailMessage
            }),
          });

          const result = await response.json();
          if (result.success) {
            sentCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          failedCount++;
          console.error(`Erreur lors de l'envoi de l'email à ${recipient}:`, error);
        }
      }

      toast.success(`Emails envoyés: ${sentCount} succès, ${failedCount} échecs`);
      
      // Réinitialiser le formulaire
      setEmailSubject('');
      setEmailMessage('');
      setEmailRecipients('');

    } catch (error) {
      console.error('Erreur lors de l\'envoi en masse des emails:', error);
      toast.error('Erreur lors de l\'envoi en masse des emails');
    } finally {
      setEmailLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'failed':
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'pending':
      case 'queued':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4 md:p-6 w-full">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--zalama-text)]">Marketing</h1>
        <p className="text-[var(--zalama-text-secondary)]">Envoi en masse de SMS et emails</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-[var(--zalama-blue)]" />
              <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Solde SMS</h3>
            </div>
            <button
              onClick={loadSMSBalance}
              disabled={loadingBalance}
              className="p-1 hover:bg-[var(--zalama-bg-lighter)] rounded-md transition-colors"
            >
              <RefreshCw className={`h-4 w-4 text-[var(--zalama-text-secondary)] ${loadingBalance ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {loadingBalance ? (
            <div className="animate-pulse">
              <div className="h-8 bg-[var(--zalama-bg-lighter)] rounded w-20"></div>
            </div>
          ) : (
            <div className="text-2xl font-bold text-[var(--zalama-text)]">
              {smsBalance ? `${smsBalance.balance} ${smsBalance.currency}` : 'N/A'}
            </div>
          )}
        </div>

        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <div className="flex items-center gap-3 mb-2">
            <Send className="h-6 w-6 text-[var(--zalama-success)]" />
            <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Messages envoyés</h3>
          </div>
          <div className="text-2xl font-bold text-[var(--zalama-success)]">{messageStats.sent}</div>
        </div>

        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-6 w-6 text-[var(--zalama-warning)]" />
            <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Messages échoués</h3>
          </div>
          <div className="text-2xl font-bold text-[var(--zalama-warning)]">{messageStats.failed}</div>
        </div>
      </div>

      {/* Messages récents */}
      <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)] mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--zalama-text)]">Messages récents</h2>
          <button
            onClick={loadRecentMessages}
            disabled={loadingMessages}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-[var(--zalama-blue)] text-white rounded-md hover:bg-[var(--zalama-blue-accent)] transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loadingMessages ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
        
        {loadingMessages ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-[var(--zalama-bg-lighter)] rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-[var(--zalama-bg-lighter)] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : recentMessages.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentMessages.map((message) => (
              <div key={message.id} className="flex items-center justify-between p-3 bg-[var(--zalama-bg-lighter)] rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-[var(--zalama-text)]">{message.to}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(message.status)}`}>
                      {message.status}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--zalama-text-secondary)] truncate">{message.message}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-[var(--zalama-text-secondary)] flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(message.created_at)}
                    </span>
                    {message.cost && (
                      <span className="text-xs text-[var(--zalama-text-secondary)]">
                        Coût: {message.cost} {smsBalance?.currency}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--zalama-text-secondary)]">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucun message récent</p>
          </div>
        )}
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-6 bg-[var(--zalama-bg-lighter)] rounded-lg p-1">
        <button
          onClick={() => setActiveTab('sms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
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
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
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
        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <h2 className="text-xl font-semibold text-[var(--zalama-text)] mb-4">Envoi en masse SMS</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Message (max 160 caractères)
              </label>
              <textarea
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                rows={4}
                maxLength={160}
                placeholder="Saisissez votre message SMS..."
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
              />
              <div className="text-xs text-[var(--zalama-text-secondary)] mt-1">
                {smsMessage.length}/160 caractères
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[var(--zalama-text)]">
                  Destinataires (un par ligne ou séparés par des virgules)
                </label>
                <button
                  onClick={() => setShowEmployeeSelector(!showEmployeeSelector)}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-[var(--zalama-blue)] text-white rounded-md hover:bg-[var(--zalama-blue-accent)] transition-colors"
                >
                  <Users className="h-4 w-4" />
                  Sélectionner des employés
                </button>
              </div>

              {/* Sélecteur d'employés */}
              {showEmployeeSelector && (
                <div className="mb-4 p-4 bg-[var(--zalama-bg-lighter)] rounded-lg border border-[var(--zalama-border)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Search className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                    <input
                      type="text"
                      placeholder="Rechercher un employé..."
                      value={employeeSearchTerm}
                      onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-md border border-[var(--zalama-border)] bg-[var(--zalama-card)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
                    />
                  </div>

                  {loadingEmployees ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--zalama-blue)] mx-auto"></div>
                      <p className="text-sm text-[var(--zalama-text-secondary)] mt-2">Chargement des employés...</p>
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((employee) => {
                          const isSelected = selectedEmployees.some(emp => emp.id === employee.id);
                          return (
                            <div
                              key={employee.id}
                              onClick={() => toggleEmployeeSelection(employee)}
                              className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                                isSelected 
                                  ? 'bg-[var(--zalama-blue)] text-white' 
                                  : 'bg-[var(--zalama-card)] hover:bg-[var(--zalama-bg-lighter)]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="h-4 w-4"
                              />
                              <User className="h-4 w-4" />
                              <div className="flex-1">
                                <div className="text-sm font-medium">{employee.label}</div>
                                <div className="text-xs opacity-75">{employee.telephone}</div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-4 text-[var(--zalama-text-secondary)]">
                          <p>Aucun employé trouvé</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedEmployees.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[var(--zalama-border)]">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--zalama-text)]">
                          {selectedEmployees.length} employé(s) sélectionné(s)
                        </span>
                        <button
                          onClick={addSelectedEmployeesToRecipients}
                          className="px-3 py-1 text-sm bg-[var(--zalama-success)] text-white rounded-md hover:bg-[var(--zalama-success-accent)] transition-colors"
                        >
                          Ajouter aux destinataires
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <textarea
                value={smsRecipients}
                onChange={(e) => setSmsRecipients(e.target.value)}
                rows={4}
                placeholder="+224XXXXXXXXX&#10;+224XXXXXXXXX&#10;..."
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
              />
              <div className="text-xs text-[var(--zalama-text-secondary)] mt-1">
                {parseRecipients(smsRecipients).length} destinataire(s)
              </div>
            </div>

            <button
              onClick={sendBulkSMS}
              disabled={smsLoading}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {smsLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <Send className="h-4 w-4" />
              {smsLoading ? 'Envoi en cours...' : 'Envoyer les SMS'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <h2 className="text-xl font-semibold text-[var(--zalama-text)] mb-4">Envoi en masse Email</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Sujet
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Sujet de l'email..."
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Message (HTML supporté)
              </label>
              <textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={6}
                placeholder="Saisissez votre message email..."
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Destinataires (un par ligne ou séparés par des virgules)
              </label>
              <textarea
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                rows={4}
                placeholder="email@example.com&#10;email2@example.com&#10;..."
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
              />
              <div className="text-xs text-[var(--zalama-text-secondary)] mt-1">
                {parseRecipients(emailRecipients).length} destinataire(s)
              </div>
            </div>

            <button
              onClick={sendBulkEmail}
              disabled={emailLoading}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {emailLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <Mail className="h-4 w-4" />
              {emailLoading ? 'Envoi en cours...' : 'Envoyer les emails'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 