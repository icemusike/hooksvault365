/**
 * Notification system utilities
 */

// Global notification event key
const NOTIFICATION_EVENT = 'app:notification';

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

// Default duration for notifications (in milliseconds)
const DEFAULT_DURATION = 5000;

/**
 * Show a notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info, warning)
 * @param {number} duration - Duration in milliseconds
 */
export const showNotification = (message, type = NOTIFICATION_TYPES.INFO, duration = DEFAULT_DURATION) => {
  if (typeof window === 'undefined') return;
  
  const notificationEvent = new CustomEvent(NOTIFICATION_EVENT, {
    detail: {
      message,
      type,
      duration,
      id: Date.now() // Unique ID for this notification
    }
  });
  
  window.dispatchEvent(notificationEvent);
};

/**
 * Success notification shorthand
 * @param {string} message - Success message
 * @param {number} duration - Duration in milliseconds
 */
export const showSuccess = (message, duration = DEFAULT_DURATION) => {
  showNotification(message, NOTIFICATION_TYPES.SUCCESS, duration);
};

/**
 * Error notification shorthand
 * @param {string} message - Error message
 * @param {number} duration - Duration in milliseconds
 */
export const showError = (message, duration = DEFAULT_DURATION) => {
  showNotification(message, NOTIFICATION_TYPES.ERROR, duration);
};

/**
 * Info notification shorthand
 * @param {string} message - Info message
 * @param {number} duration - Duration in milliseconds
 */
export const showInfo = (message, duration = DEFAULT_DURATION) => {
  showNotification(message, NOTIFICATION_TYPES.INFO, duration);
};

/**
 * Warning notification shorthand
 * @param {string} message - Warning message
 * @param {number} duration - Duration in milliseconds
 */
export const showWarning = (message, duration = DEFAULT_DURATION) => {
  showNotification(message, NOTIFICATION_TYPES.WARNING, duration);
};

/**
 * Subscribe to notification events
 * @param {Function} callback - Callback function for notification events
 */
export const subscribeToNotifications = (callback) => {
  if (typeof window === 'undefined') return () => {};
  
  window.addEventListener(NOTIFICATION_EVENT, callback);
  return () => window.removeEventListener(NOTIFICATION_EVENT, callback);
};

export default {
  NOTIFICATION_TYPES,
  showNotification,
  showSuccess,
  showError,
  showInfo,
  showWarning,
  subscribeToNotifications
}; 