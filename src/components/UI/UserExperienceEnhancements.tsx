import React, { useState, useEffect, useCallback } from 'react';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

interface NotificationProps {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    handler: () => void;
  };
  autoClose?: boolean;
  duration?: number;
}

interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  animationsEnabled: boolean;
  soundEnabled: boolean;
  compactMode: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  autoRefresh: boolean;
  notificationLevel: 'all' | 'important' | 'critical';
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = useCallback((notification: Omit<NotificationProps, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    if (notification.autoClose !== false) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const getNotificationStyles = (type: NotificationProps['type']) => {
    const baseStyles = 'border rounded-lg p-4 shadow-lg transition-all duration-300 transform';
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`;
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-200 text-gray-800`;
    }
  };

  const getNotificationIcon = (type: NotificationProps['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  return (
    <>
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={getNotificationStyles(notification.type)}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </span>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{notification.title}</h4>
                <p className="text-sm mt-1">{notification.message}</p>
                {notification.action && (
                  <button
                    onClick={notification.action.handler}
                    className="mt-2 px-3 py-1 bg-current bg-opacity-20 rounded text-xs font-medium hover:bg-opacity-30 transition-colors"
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-lg hover:opacity-70 transition-opacity"
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Global notification trigger function */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addNotification = ${addNotification.toString()};
          `
        }}
      />
    </>
  );
}

export function LoadingIndicator({ loadingState }: { loadingState: LoadingState }) {
  if (!loadingState.isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-label="Loading">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading</h3>
          {loadingState.message && (
            <p className="text-sm text-gray-600 mb-4">{loadingState.message}</p>
          )}
          {loadingState.progress !== undefined && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadingState.progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function UserPreferencesPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'auto',
    animationsEnabled: true,
    soundEnabled: true,
    compactMode: false,
    highContrast: false,
    fontSize: 'medium',
    autoRefresh: true,
    notificationLevel: 'important'
  });

  useEffect(() => {
    // Load preferences from localStorage
    const savedPrefs = localStorage.getItem('cisadx-user-preferences');
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
  }, []);

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    localStorage.setItem('cisadx-user-preferences', JSON.stringify(newPreferences));
    
    // Apply changes immediately
    applyPreferences(newPreferences);
  };

  const applyPreferences = (prefs: UserPreferences) => {
    const root = document.documentElement;
    
    // Apply theme
    if (prefs.theme === 'dark') {
      root.classList.add('dark');
    } else if (prefs.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto theme based on system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    }
    
    // Apply high contrast
    root.classList.toggle('high-contrast', prefs.highContrast);
    
    // Apply font size
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${prefs.fontSize}`);
    
    // Apply compact mode
    root.classList.toggle('compact-mode', prefs.compactMode);
    
    // Apply animations setting
    root.classList.toggle('reduce-motion', !prefs.animationsEnabled);
  };

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 p-3 bg-bg1 border border-b1 rounded-full shadow-lg hover:shadow-xl transition-shadow z-40"
        aria-label="Open user preferences"
      >
        ⚙️
      </button>

      {/* Preferences Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog">
          <div className="bg-bg0 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-t1">User Preferences</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-t2 hover:text-t1 text-xl"
                aria-label="Close preferences"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Theme Settings */}
              <div>
                <h3 className="font-semibold text-t1 mb-3">Appearance</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-t2 mb-1">Theme</label>
                    <select
                      value={preferences.theme}
                      onChange={(e) => updatePreference('theme', e.target.value as UserPreferences['theme'])}
                      className="w-full px-3 py-2 border border-b1 rounded-lg bg-bg1 text-t1"
                    >
                      <option value="auto">Auto (System)</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-t2 mb-1">Font Size</label>
                    <select
                      value={preferences.fontSize}
                      onChange={(e) => updatePreference('fontSize', e.target.value as UserPreferences['fontSize'])}
                      className="w-full px-3 py-2 border border-b1 rounded-lg bg-bg1 text-t1"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.highContrast}
                      onChange={(e) => updatePreference('highContrast', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-t1">High contrast mode</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.compactMode}
                      onChange={(e) => updatePreference('compactMode', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-t1">Compact layout</span>
                  </label>
                </div>
              </div>

              {/* Interaction Settings */}
              <div>
                <h3 className="font-semibold text-t1 mb-3">Interaction</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.animationsEnabled}
                      onChange={(e) => updatePreference('animationsEnabled', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-t1">Enable animations</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.soundEnabled}
                      onChange={(e) => updatePreference('soundEnabled', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-t1">Sound notifications</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.autoRefresh}
                      onChange={(e) => updatePreference('autoRefresh', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-t1">Auto-refresh data</span>
                  </label>
                </div>
              </div>

              {/* Notification Settings */}
              <div>
                <h3 className="font-semibold text-t1 mb-3">Notifications</h3>
                <div>
                  <label className="block text-sm font-medium text-t2 mb-1">Notification Level</label>
                  <select
                    value={preferences.notificationLevel}
                    onChange={(e) => updatePreference('notificationLevel', e.target.value as UserPreferences['notificationLevel'])}
                    className="w-full px-3 py-2 border border-b1 rounded-lg bg-bg1 text-t1"
                  >
                    <option value="all">All notifications</option>
                    <option value="important">Important only</option>
                    <option value="critical">Critical only</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    // Reset to defaults
                    const defaults: UserPreferences = {
                      theme: 'auto',
                      animationsEnabled: true,
                      soundEnabled: true,
                      compactMode: false,
                      highContrast: false,
                      fontSize: 'medium',
                      autoRefresh: true,
                      notificationLevel: 'important'
                    };
                    setPreferences(defaults);
                    localStorage.setItem('cisadx-user-preferences', JSON.stringify(defaults));
                    applyPreferences(defaults);
                  }}
                  className="flex-1 px-4 py-2 border border-b1 rounded-lg text-t2 hover:text-t1 hover:bg-bg2 transition-colors"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-brand text-black rounded-lg hover:bg-brand/90 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { keys: ['Ctrl', 'K'], description: 'Open command palette' },
    { keys: ['/'], description: 'Focus search' },
    { keys: ['Ctrl', 'Shift', 'E'], description: 'Emergency mode' },
    { keys: ['Ctrl', 'Shift', 'H'], description: 'Show keyboard shortcuts' },
    { keys: ['Ctrl', 'Shift', 'D'], description: 'Toggle dark mode' },
    { keys: ['Ctrl', 'Shift', 'C'], description: 'Toggle high contrast' },
    { keys: ['Escape'], description: 'Close modals/overlays' },
    { keys: ['Tab'], description: 'Navigate between elements' },
    { keys: ['Shift', 'Tab'], description: 'Navigate backwards' },
    { keys: ['Enter'], description: 'Activate focused element' },
    { keys: ['Arrow Keys'], description: 'Navigate lists and maps' },
    { keys: ['Ctrl', '1-5'], description: 'Switch dashboard tabs' }
  ];

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  return (
    <>
      {/* Help trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-16 p-2 bg-bg1 border border-b1 rounded-full shadow-lg hover:shadow-xl transition-shadow z-40 text-sm"
        aria-label="Show keyboard shortcuts (Ctrl+Shift+H)"
        title="Keyboard shortcuts"
      >
        ⌨️
      </button>

      {/* Shortcuts Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog">
          <div className="bg-bg0 rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-t1">Keyboard Shortcuts</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-t2 hover:text-t1 text-xl"
                aria-label="Close shortcuts help"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm text-t1">{shortcut.description}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <React.Fragment key={keyIndex}>
                        {keyIndex > 0 && <span className="text-t2 text-xs mx-1">+</span>}
                        <kbd className="px-2 py-1 bg-bg2 border border-b1 rounded text-xs font-mono">
                          {key}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-b1">
              <p className="text-sm text-t2 text-center">
                Press <kbd className="px-1 py-0.5 bg-bg2 border border-b1 rounded text-xs">Ctrl+Shift+H</kbd> to toggle this help
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function PerformanceMonitorWidget() {
  const { metrics, alerts, clearAlerts, getOptimizationSuggestions } = usePerformanceMonitor();
  const [isExpanded, setIsExpanded] = useState(false);

  const suggestions = getOptimizationSuggestions();

  return (
    <div className="fixed top-4 left-4 z-40">
      <div className={`bg-bg1 border border-b1 rounded-lg shadow-lg transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-auto'
      }`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 text-left hover:bg-bg2 transition-colors rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                alerts.length > 0 ? 'bg-red-500' : 
                metrics.memoryUsage > 30 * 1024 * 1024 ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <span className="text-sm font-medium text-t1">Performance</span>
            </div>
            <span className="text-xs text-t2">{isExpanded ? '−' : '+'}</span>
          </div>
        </button>

        {isExpanded && (
          <div className="p-3 border-t border-b1 space-y-3">
            {/* Memory Usage */}
            <div>
              <div className="flex justify-between text-xs text-t2 mb-1">
                <span>Memory</span>
                <span>{(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</span>
              </div>
              <div className="w-full bg-bg2 rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all ${
                    metrics.memoryUsage > 50 * 1024 * 1024 ? 'bg-red-500' :
                    metrics.memoryUsage > 30 * 1024 * 1024 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((metrics.memoryUsage / (100 * 1024 * 1024)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Render Time */}
            <div>
              <div className="flex justify-between text-xs text-t2 mb-1">
                <span>Render Time</span>
                <span>{metrics.renderTime.toFixed(1)}ms</span>
              </div>
              <div className="w-full bg-bg2 rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all ${
                    metrics.renderTime > 100 ? 'bg-red-500' :
                    metrics.renderTime > 50 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((metrics.renderTime / 200) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-t2">Alerts ({alerts.length})</span>
                  <button
                    onClick={clearAlerts}
                    className="text-xs text-t2 hover:text-t1"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {alerts.slice(0, 3).map((alert, index) => (
                    <div key={index} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      {alert}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optimization Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <span className="text-xs font-medium text-t2 block mb-2">Suggestions</span>
                <div className="space-y-1">
                  {suggestions.slice(0, 2).map((suggestion, index) => (
                    <div key={index} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {suggestion.suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Export a combined UX component that includes all enhancements
export default function UserExperienceEnhancements() {
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false });

  // Global loading state management
  useEffect(() => {
    // Listen for global loading events
    const handleLoadingStart = (event: CustomEvent) => {
      setLoadingState({ isLoading: true, message: event.detail.message });
    };

    const handleLoadingProgress = (event: CustomEvent) => {
      setLoadingState(prev => ({ ...prev, progress: event.detail.progress }));
    };

    const handleLoadingEnd = () => {
      setLoadingState({ isLoading: false });
    };

    window.addEventListener('loading:start', handleLoadingStart as EventListener);
    window.addEventListener('loading:progress', handleLoadingProgress as EventListener);
    window.addEventListener('loading:end', handleLoadingEnd);

    return () => {
      window.removeEventListener('loading:start', handleLoadingStart as EventListener);
      window.removeEventListener('loading:progress', handleLoadingProgress as EventListener);
      window.removeEventListener('loading:end', handleLoadingEnd);
    };
  }, []);

  return (
    <>
      <NotificationSystem />
      <LoadingIndicator loadingState={loadingState} />
      <UserPreferencesPanel />
      <KeyboardShortcutsHelp />
      <PerformanceMonitorWidget />
    </>
  );
}