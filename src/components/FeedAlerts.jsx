import React, { useState, useEffect } from 'react';
import { feedAlerting } from '../services/feedAlerting';

export default function FeedAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    // Load initial alerts and status
    refreshAlerts();
    
    // Listen for new feed alerts
    const handleFeedAlert = (event) => {
      refreshAlerts();
    };

    window.addEventListener('feedAlert', handleFeedAlert);
    
    // Refresh alerts every 30 seconds
    const interval = setInterval(refreshAlerts, 30000);

    return () => {
      window.removeEventListener('feedAlert', handleFeedAlert);
      clearInterval(interval);
    };
  }, []);

  const refreshAlerts = () => {
    setAlerts(feedAlerting.getPendingAlerts(5));
    setSystemStatus(feedAlerting.getStatus());
  };

  const clearAlert = (index) => {
    feedAlerting.clearAlert(index);
    refreshAlerts();
  };

  const clearAllAlerts = () => {
    feedAlerting.clearAllAlerts();
    refreshAlerts();
  };

  const requestNotifications = async () => {
    const granted = await feedAlerting.requestNotificationPermission();
    if (granted) {
      refreshAlerts();
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <span className="text-red-500 text-lg">⚠️</span>;
      case 'medium':
        return <span className="text-yellow-500 text-lg">⚡</span>;
      case 'low':
        return <span className="text-blue-500 text-lg">ℹ️</span>;
      default:
        return <span className="text-gray-500 text-lg">📋</span>;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (!systemStatus || alerts.length === 0) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-green-100 border border-green-300 rounded-lg px-4 py-2 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✅</span>
            <span className="text-sm text-green-800 font-medium">All feeds healthy</span>
            {systemStatus?.notificationPermission === 'default' && (
              <button
                onClick={requestNotifications}
                className="text-xs text-green-600 underline hover:text-green-800"
              >
                Enable alerts
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">🚨</span>
            <h4 className="font-medium text-gray-900">Feed Alerts</h4>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              {alerts.length}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-gray-200 rounded"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              <span className="text-sm">{isMinimized ? '▲' : '▼'}</span>
            </button>
            <button
              onClick={clearAllAlerts}
              className="p-1 hover:bg-gray-200 rounded text-gray-500"
              title="Clear all alerts"
            >
              <span className="text-sm">✕</span>
            </button>
          </div>
        </div>

        {/* Alerts List */}
        {!isMinimized && (
          <div className="max-h-96 overflow-y-auto">
            {alerts.map((alert, index) => (
              <div
                key={`${alert.type}-${alert.timestamp.getTime()}-${index}`}
                className={`p-4 border-l-4 ${getSeverityColor(alert.severity)} border-b border-gray-100 last:border-b-0`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 text-sm">
                        {alert.title}
                      </h5>
                      <p className="text-sm text-gray-600 mt-1">
                        {alert.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {alert.timestamp.toLocaleTimeString()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => clearAlert(index)}
                    className="ml-2 p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
                    title="Dismiss alert"
                  >
                    <span className="text-xs">✕</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {!isMinimized && (
          <div className="px-4 py-2 bg-gray-50 rounded-b-lg border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>
                Monitoring {systemStatus?.isRunning ? '🟢 Active' : '🔴 Inactive'}
              </span>
              {systemStatus?.notificationPermission === 'default' && (
                <button
                  onClick={requestNotifications}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Enable notifications
                </button>
              )}
              {systemStatus?.notificationPermission === 'granted' && (
                <span className="text-green-600">🔔 Notifications enabled</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}