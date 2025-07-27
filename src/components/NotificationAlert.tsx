import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';

const NotificationAlert = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

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
                onClick={() => setIsVisible(false)}
                className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition-colors"
              >
                Включить
              </button>
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => setIsDismissed(true), 300);
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                Нет, спасибо
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => setIsDismissed(true), 300);
            }}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationAlert;