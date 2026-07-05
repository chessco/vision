// ─── Notification State Management ──────────────────────────────
import { useState, useCallback } from 'react';
import type { AppNotification } from '../types';

let notificationId = 0;

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = useCallback((
    type: AppNotification['type'],
    title: string,
    message: string,
    actionUrl?: string,
  ) => {
    const notification: AppNotification = {
      id: String(++notificationId),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl,
    };
    setNotifications(prev => [notification, ...prev]);
    // Auto-dismiss info/success after 5s
    if (type === 'info' || type === 'success') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    }
    return notification.id;
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    dismissNotification,
    markAsRead,
    clearAll,
  };
}
