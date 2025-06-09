"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Notification } from './types';
import NotificationHeader from './NotificationHeader';
import NotificationFilters from './NotificationFilters';
import NotificationList from './NotificationList';
import { fetchUnreadNotifications, fetchNotificationsByType } from './notificationService';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationFooter from './NotificationFooter';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const { notifications, setNotifications, markAsRead, markAllAsRead, refreshUnreadCount } = useNotifications();

  // Charger les notifications depuis Firebase
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, filter]);
  
  // Fonction pour charger les notifications
  const loadNotifications = async () => {
    setLoading(true);
    try {
      let data: Notification[];
      
      if (filter === 'all') {
        console.log('Chargement des notifications non lues');
        data = await fetchUnreadNotifications();
      } else {
        console.log(`Chargement des notifications de type: ${filter}`);
        data = await fetchNotificationsByType(filter);
      }
      
      console.log('Notifications récupérées dans NotificationDrawer:', data.length, data);
      setNotifications(data);
      // Rafraîchir le compteur après avoir chargé les notifications
      refreshUnreadCount();
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fermer le drawer si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Empêcher le scroll du body quand le drawer est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  // Obtenir le nombre de notifications non lues pour l'affichage local
  const localUnreadCount = notifications.filter((notification: Notification) => !notification.lue).length;
  
  // Filtrer les notifications
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter((notification: Notification) => notification.type === filter);
    
  console.log('Notifications filtrées à afficher:', filteredNotifications.length, filteredNotifications);
  
  return (
    <>
      {/* Overlay sombre */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}
      
      {/* Drawer */}
      <div 
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-[var(--zalama-card)] shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* En-tête */}
          <NotificationHeader 
            unreadCount={localUnreadCount} 
            onClose={onClose} 
          />
          
          {/* Filtres */}
          <NotificationFilters 
            currentFilter={filter} 
            onFilterChange={setFilter} 
          />
          
          {/* Liste des notifications */}
          <NotificationList 
            notifications={filteredNotifications} 
            onMarkAsRead={markAsRead}
            loading={loading}
          />
          
          {/* Pied de page */}
          <NotificationFooter 
            onMarkAllAsRead={markAllAsRead} 
          />
        </div>
      </div>
    </>
  );
}
