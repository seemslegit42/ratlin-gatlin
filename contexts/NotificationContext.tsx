
/**
 * @file contexts/NotificationContext.tsx
 * @description Provides a global context for displaying transient notifications across the application.
 * It manages a queue of notifications and renders them using the `Notifications` component.
 * Includes rate limiting and deduplication to prevent notification flooding.
 */

import React, { createContext, useState, useCallback, useContext, useRef } from 'react';
import Notifications from '../components/Notifications';
import type { Notification } from '../components/Notifications';

/** Defines the possible types of notifications. */
type NotificationType = 'success' | 'error' | 'info';

/**
 * Interface for the NotificationContext's value.
 */
interface NotificationContextType {
  /**
   * Adds a new notification to be displayed.
   * @param message The text message of the notification.
   * @param type The type of the notification (success, error, info). Defaults to 'info'.
   */
  addNotification: (message: string, type?: NotificationType) => void;
}

/**
 * The React Context object for notifications.
 */
const NotificationContext = createContext<NotificationContextType | null>(null);

/**
 * Props for the NotificationProvider.
 */
interface NotificationProviderProps {
    /** The child components that will have access to the notification context. */
    children: React.ReactNode;
}

/**
 * Provides notification functionality to its children components.
 * It manages the state of active notifications and displays them.
 * @param {NotificationProviderProps} props - The component props.
 * @returns {React.FC} The NotificationProvider.
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  /** @state {Notification[]} notifications - The array of currently active notifications. */
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Rate limiting references
  const lastNotificationTime = useRef<number>(0);
  const notificationCount = useRef<number>(0);
  const recentMessages = useRef<Set<string>>(new Set());

  /**
   * Callback function to add a new notification.
   * Includes logic for deduplication and rate limiting.
   */
  const addNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const now = Date.now();
    
    // Reset rate limit window every 2 seconds
    if (now - lastNotificationTime.current > 2000) {
        notificationCount.current = 0;
        lastNotificationTime.current = now;
        recentMessages.current.clear(); // Clear deduplication cache
    }

    // Rate Limit: Max 3 notifications per 2 seconds
    if (notificationCount.current >= 3) {
        console.warn('Notification rate limit exceeded. Suppressing:', message);
        return;
    }

    // Deduplication: Prevent identical messages within the window
    if (recentMessages.current.has(message)) {
        return;
    }

    notificationCount.current += 1;
    recentMessages.current.add(message);

    const id = Date.now() + Math.random(); // Ensure unique ID
    setNotifications(prev => {
        // Max Queue Size: Keep only the latest 3 notifications to prevent screen flooding
        const updated = [...prev, { id, message, type }];
        if (updated.length > 3) {
            return updated.slice(updated.length - 3);
        }
        return updated;
    });

    // Auto-dismiss
    setTimeout(() => {
      setNotifications(n => n.filter(notification => notification.id !== id));
    }, 4000);
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <Notifications notifications={notifications} />
    </NotificationContext.Provider>
  );
};

/**
 * A custom hook to consume the NotificationContext.
 * Provides `addNotification` to any component within the `NotificationProvider` tree.
 * @returns {NotificationContextType} The notification context value.
 * @throws {Error} If `useNotifications` is used outside of a `NotificationProvider`.
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
