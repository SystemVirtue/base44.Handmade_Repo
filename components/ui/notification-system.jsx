import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info, XCircle, ExternalLink } from 'lucide-react';

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNotification = (event) => {
      const { type, title, message, duration, persistent, action } = event.detail;
      
      const notification = {
        id: Date.now() + Math.random(),
        type: type || 'info',
        title: title || 'Notification',
        message: message || '',
        persistent: persistent || false,
        action: action || null,
        timestamp: new Date()
      };

      setNotifications(prev => [...prev, notification]);

      // Auto-remove non-persistent notifications
      if (!persistent && duration !== 0) {
        setTimeout(() => {
          removeNotification(notification.id);
        }, duration || 5000);
      }
    };

    window.addEventListener('djamms-notification', handleNotification);
    
    return () => {
      window.removeEventListener('djamms-notification', handleNotification);
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-900/50 border-green-700';
      case 'warning':
        return 'bg-yellow-900/50 border-yellow-700';
      case 'error':
        return 'bg-red-900/50 border-red-700';
      default:
        return 'bg-blue-900/50 border-blue-700';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`border rounded-lg p-4 shadow-lg backdrop-blur-sm ${getBgColor(notification.type)}`}
        >
          <div className="flex items-start gap-3">
            {getIcon(notification.type)}
            
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm">
                {notification.title}
              </h4>
              
              {notification.message && (
                <p className="text-gray-300 text-sm mt-1">
                  {notification.message}
                </p>
              )}

              {notification.action && (
                <button
                  onClick={() => {
                    if (notification.action.url) {
                      window.location.href = notification.action.url;
                    }
                    removeNotification(notification.id);
                  }}
                  className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-300 hover:text-blue-200 transition-colors"
                >
                  {notification.action.text}
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
