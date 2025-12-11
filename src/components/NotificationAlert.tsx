import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';

// Cookie utility functions
const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const NotificationAlert = () => {
  // Check if user has already seen the notification
  const hasSeenNotification = getCookie('sakina_notification_dismissed') === 'true';
  
  const [isVisible, setIsVisible] = useState(!hasSeenNotification);
  const [isDismissed, setIsDismissed] = useState(hasSeenNotification);

  const handleDismiss = (accepted: boolean = false) => {
    setIsVisible(false);
    // Set cookie to remember user's choice for 30 days
    setCookie('sakina_notification_dismissed', 'true', 30);
    if (accepted) {
      setCookie('sakina_notifications_enabled', 'true', 365);
    }
    setTimeout(() => setIsDismissed(true), 300);
  };

  const handleEnable = () => {
    // Here you would typically request browser notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notifications enabled');
        }
      });
    }
    handleDismiss(true);
  };

  if (isDismissed) return null;

  return (
    <div className={`fixed bottom-8 left-8 z-50 transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0 bg-teal-100 rounded-full p-2">
            <Bell className="h-6 w-6 text-teal-600" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-lg font-semibold">Не упускайте выгоду!</p>
            <p className="text-gray-600 mt-1">
              Включите уведомления о скидках и акциях
            </p>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={handleEnable}
                className="bg-brand-turquoise text-white px-4 py-2 rounded hover:bg-brand-navy transition-colors"
              >
                Включить
              </button>
              <button
                onClick={() => handleDismiss(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                Нет, спасибо
              </button>
            </div>
          </div>
          <button
            onClick={() => handleDismiss(false)}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
            aria-label="Закрыть уведомление"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationAlert;