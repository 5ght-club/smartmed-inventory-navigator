
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type NotificationType = 'low-stock' | 'expiring' | 'reorder' | 'critical' | 'info';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  link?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) => {
    const newNotification: Notification = {
      id: uuidv4(),
      createdAt: new Date(),
      read: false,
      ...notification
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },
  markAsRead: (id) => {
    set((state) => {
      const updatedNotifications = state.notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      );
      
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      
      return {
        notifications: updatedNotifications,
        unreadCount
      };
    });
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(notification => ({ ...notification, read: true })),
      unreadCount: 0
    }));
  },
  removeNotification: (id) => {
    set((state) => {
      const wasUnread = state.notifications.find(n => n.id === id)?.read === false;
      const updatedNotifications = state.notifications.filter(notification => notification.id !== id);
      
      return {
        notifications: updatedNotifications,
        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount
      };
    });
  },
  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  }
}));
