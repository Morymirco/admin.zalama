import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import React from 'react';

interface NotificationStatusProps {
  sms_sent?: boolean;
  email_sent?: boolean;
  error?: string;
  type: 'approval' | 'rejection' | 'payment_success' | 'payment_failure';
  className?: string;
}

const NotificationStatus: React.FC<NotificationStatusProps> = ({
  sms_sent,
  email_sent,
  error,
  type,
  className = ''
}) => {
  const getTypeInfo = () => {
    switch (type) {
      case 'approval':
        return {
          title: 'Approbation',
          successColor: 'text-green-600',
          icon: CheckCircle
        };
      case 'rejection':
        return {
          title: 'Rejet',
          successColor: 'text-red-600',
          icon: XCircle
        };
      case 'payment_success':
        return {
          title: 'Paiement réussi',
          successColor: 'text-green-600',
          icon: CheckCircle
        };
      case 'payment_failure':
        return {
          title: 'Paiement échoué',
          successColor: 'text-red-600',
          icon: XCircle
        };
      default:
        return {
          title: 'Notification',
          successColor: 'text-blue-600',
          icon: AlertCircle
        };
    }
  };

  const typeInfo = getTypeInfo();
  const Icon = typeInfo.icon;

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-red-600 ${className}`}>
        <XCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Erreur notification: {error}</span>
      </div>
    );
  }

  if (sms_sent === undefined && email_sent === undefined) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <Clock className="h-4 w-4" />
        <span className="text-sm">Notifications en cours...</span>
      </div>
    );
  }

  const hasSuccess = sms_sent || email_sent;
  const hasBoth = sms_sent && email_sent;

  return (
    <div className={`flex items-center gap-2 ${hasSuccess ? typeInfo.successColor : 'text-gray-500'} ${className}`}>
      <Icon className="h-4 w-4" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{typeInfo.title}</span>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span>📱</span>
            <span>{sms_sent ? 'SMS envoyé' : 'SMS non envoyé'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📧</span>
            <span>{email_sent ? 'Email envoyé' : 'Email non envoyé'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationStatus; 