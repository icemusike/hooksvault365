import { useState, useEffect } from 'react';
import { subscribeToNotifications } from '../utils/notificationUtils';

/**
 * Notification item component
 */
const Notification = ({ id, message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  
  // Start exit animation
  const startExit = () => {
    setIsExiting(true);
    // Allow time for animation before actual removal
    setTimeout(() => onClose(id), 300);
  };
  
  // Get icon based on notification type
  const getIcon = () => {
    switch (type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-exclamation-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'info':
      default: return 'fas fa-info-circle';
    }
  };

  return (
    <div className={`notification ${type} ${isExiting ? 'exiting' : ''}`}>
      <div className="notification-icon">
        <i className={getIcon()}></i>
      </div>
      <div className="notification-content">
        <span>{message}</span>
      </div>
      <button className="notification-close" onClick={startExit}>
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

/**
 * Notification system component
 */
const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Subscribe to notification events
    const unsubscribe = subscribeToNotifications((event) => {
      const notification = event.detail;
      
      // Add new notification
      setNotifications(current => [...current, notification]);
      
      // Auto-remove after duration
      if (notification.duration) {
        setTimeout(() => {
          setNotifications(current => 
            current.filter(item => item.id !== notification.id)
          );
        }, notification.duration);
      }
    });
    
    // Cleanup subscription
    return unsubscribe;
  }, []);

  const removeNotification = (id) => {
    setNotifications(current => current.filter(item => item.id !== id));
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <Notification 
          key={notification.id}
          id={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationSystem; 