import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  accessibilityManager, 
  KEYBOARD_KEYS, 
  SCREEN_READER_MESSAGES,
  HIGH_CONTRAST_THEMES 
} from '../utils/accessibility';

// Hook for managing accessibility state
export function useAccessibility() {
  const [isHighContrast, setIsHighContrast] = useState(
    accessibilityManager.isHighContrastEnabled()
  );
  const [isReducedMotion, setIsReducedMotion] = useState(
    accessibilityManager.isReducedMotionEnabled()
  );
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(
    accessibilityManager.isScreenReaderActive()
  );

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    accessibilityManager.announce(message, priority);
  }, []);

  const toggleHighContrast = useCallback(() => {
    accessibilityManager.toggleHighContrast();
    setIsHighContrast(accessibilityManager.isHighContrastEnabled());
  }, []);

  const enableSOCMode = useCallback(() => {
    accessibilityManager.enableHighContrastMode('SOC_OPTIMIZED');
    setIsHighContrast(true);
    announce('SOC optimized display mode enabled');
  }, [announce]);

  return {
    isHighContrast,
    isReducedMotion,
    isScreenReaderActive,
    announce,
    toggleHighContrast,
    enableSOCMode
  };
}

// Hook for keyboard navigation
export function useKeyboardNavigation(options: {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: () => void;
  enabled?: boolean;
} = {}) {
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case KEYBOARD_KEYS.ESCAPE:
          if (options.onEscape) {
            event.preventDefault();
            options.onEscape();
          }
          break;
        case KEYBOARD_KEYS.ENTER:
          if (options.onEnter) {
            event.preventDefault();
            options.onEnter();
          }
          break;
        case KEYBOARD_KEYS.ARROW_UP:
          if (options.onArrowUp) {
            event.preventDefault();
            options.onArrowUp();
          }
          break;
        case KEYBOARD_KEYS.ARROW_DOWN:
          if (options.onArrowDown) {
            event.preventDefault();
            options.onArrowDown();
          }
          break;
        case KEYBOARD_KEYS.ARROW_LEFT:
          if (options.onArrowLeft) {
            event.preventDefault();
            options.onArrowLeft();
          }
          break;
        case KEYBOARD_KEYS.ARROW_RIGHT:
          if (options.onArrowRight) {
            event.preventDefault();
            options.onArrowRight();
          }
          break;
        case KEYBOARD_KEYS.TAB:
          if (options.onTab) {
            options.onTab();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [options, enabled]);
}

// Hook for focus management and trapping
export function useFocusTrap(isActive: boolean = false) {
  const containerRef = useRef<HTMLElement>(null);
  const releaseFocusTrap = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isActive && containerRef.current) {
      releaseFocusTrap.current = accessibilityManager.trapFocus(containerRef.current);
    } else if (releaseFocusTrap.current) {
      releaseFocusTrap.current();
      releaseFocusTrap.current = null;
    }

    return () => {
      if (releaseFocusTrap.current) {
        releaseFocusTrap.current();
      }
    };
  }, [isActive]);

  const releaseFocus = useCallback(() => {
    if (releaseFocusTrap.current) {
      releaseFocusTrap.current();
      releaseFocusTrap.current = null;
    }
  }, []);

  return {
    containerRef,
    releaseFocus
  };
}

// Hook for ARIA live regions
export function useLiveRegion() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    accessibilityManager.announce(message, priority);
  }, []);

  const announceStatus = useCallback((status: keyof typeof SCREEN_READER_MESSAGES) => {
    announce(SCREEN_READER_MESSAGES[status], 'assertive');
  }, [announce]);

  const announceDataLoad = useCallback((itemCount: number, itemType: string) => {
    announce(`Loaded ${itemCount} ${itemType} items`, 'polite');
  }, [announce]);

  const announceFilterChange = useCallback((filterType: string, filterValue: string) => {
    announce(`Filter applied: ${filterType} set to ${filterValue}`, 'polite');
  }, [announce]);

  const announceThreatLevel = useCallback((level: string, count: number) => {
    const priority = level === 'CRITICAL' ? 'assertive' : 'polite';
    announce(`${level} threat level: ${count} active threats`, priority);
  }, [announce]);

  return {
    announce,
    announceStatus,
    announceDataLoad,
    announceFilterChange,
    announceThreatLevel
  };
}

// Hook for managing roving tabindex (for lists, grids, etc.)
export function useRovingTabIndex<T extends HTMLElement>(
  items: T[],
  orientation: 'horizontal' | 'vertical' | 'both' = 'vertical'
) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    items.forEach((item, index) => {
      if (item) {
        item.tabIndex = index === activeIndex ? 0 : -1;
      }
    });
  }, [items, activeIndex]);

  const handleKeyDown = useCallback((event: KeyboardEvent, currentIndex: number) => {
    let newIndex = currentIndex;

    switch (event.key) {
      case KEYBOARD_KEYS.ARROW_DOWN:
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          newIndex = Math.min(currentIndex + 1, items.length - 1);
        }
        break;
      case KEYBOARD_KEYS.ARROW_UP:
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          newIndex = Math.max(currentIndex - 1, 0);
        }
        break;
      case KEYBOARD_KEYS.ARROW_RIGHT:
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          newIndex = Math.min(currentIndex + 1, items.length - 1);
        }
        break;
      case KEYBOARD_KEYS.ARROW_LEFT:
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          newIndex = Math.max(currentIndex - 1, 0);
        }
        break;
      case KEYBOARD_KEYS.HOME:
        event.preventDefault();
        newIndex = 0;
        break;
      case KEYBOARD_KEYS.END:
        event.preventDefault();
        newIndex = items.length - 1;
        break;
    }

    if (newIndex !== currentIndex) {
      setActiveIndex(newIndex);
      items[newIndex]?.focus();
    }
  }, [items, orientation]);

  const getItemProps = useCallback((index: number) => ({
    tabIndex: index === activeIndex ? 0 : -1,
    onKeyDown: (event: React.KeyboardEvent) => handleKeyDown(event.nativeEvent, index),
    onFocus: () => setActiveIndex(index)
  }), [activeIndex, handleKeyDown]);

  return {
    activeIndex,
    setActiveIndex,
    getItemProps
  };
}

// Hook for skip links
export function useSkipLinks() {
  const addSkipLink = useCallback((target: string, label: string) => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${target}`;
    skipLink.textContent = label;
    skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white';
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const targetElement = document.getElementById(target);
      if (targetElement) {
        targetElement.focus();
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    return () => {
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink);
      }
    };
  }, []);

  return { addSkipLink };
}

// Hook for ARIA descriptions and labels
export function useAriaDescriptions() {
  const [descriptions] = useState(new Map<string, string>());

  const setDescription = useCallback((id: string, description: string) => {
    descriptions.set(id, description);
    
    // Create or update description element
    let descElement = document.getElementById(`${id}-description`);
    if (!descElement) {
      descElement = document.createElement('div');
      descElement.id = `${id}-description`;
      descElement.className = 'sr-only';
      document.body.appendChild(descElement);
    }
    descElement.textContent = description;
  }, [descriptions]);

  const getDescriptionProps = useCallback((id: string) => ({
    'aria-describedby': `${id}-description`
  }), []);

  const getThreatLevelDescription = useCallback((level: string, count: number) => {
    const descriptions = {
      critical: `Critical threat level with ${count} active threats requiring immediate attention`,
      high: `High threat level with ${count} active threats requiring prompt response`,
      medium: `Medium threat level with ${count} active threats under monitoring`,
      low: `Low threat level with ${count} active threats in baseline monitoring`
    };
    
    return descriptions[level.toLowerCase() as keyof typeof descriptions] || 
           `${level} threat level with ${count} active threats`;
  }, []);

  const getStatusDescription = useCallback((status: string, timestamp?: Date) => {
    const timeStr = timestamp ? ` as of ${timestamp.toLocaleString()}` : '';
    const descriptions = {
      operational: `System is operational and functioning normally${timeStr}`,
      degraded: `System is experiencing degraded performance${timeStr}`,
      offline: `System is offline and not responding${timeStr}`,
      maintenance: `System is under maintenance${timeStr}`
    };
    
    return descriptions[status.toLowerCase() as keyof typeof descriptions] || 
           `System status: ${status}${timeStr}`;
  }, []);

  return {
    setDescription,
    getDescriptionProps,
    getThreatLevelDescription,
    getStatusDescription
  };
}

// Hook for color contrast and theme management
export function useThemeAccessibility() {
  const [currentTheme, setCurrentTheme] = useState<keyof typeof HIGH_CONTRAST_THEMES>('SOC_OPTIMIZED');
  const { isHighContrast, announce } = useAccessibility();

  const switchTheme = useCallback((theme: keyof typeof HIGH_CONTRAST_THEMES) => {
    if (isHighContrast) {
      accessibilityManager.enableHighContrastMode(theme);
      setCurrentTheme(theme);
      announce(`Switched to ${HIGH_CONTRAST_THEMES[theme].name} theme`);
    }
  }, [isHighContrast, announce]);

  const getThemeStyles = useCallback(() => {
    if (!isHighContrast) return {};
    
    const theme = HIGH_CONTRAST_THEMES[currentTheme];
    return {
      backgroundColor: theme.background,
      color: theme.text,
      borderColor: theme.border
    };
  }, [isHighContrast, currentTheme]);

  const getThreatLevelStyles = useCallback((level: string) => {
    if (!isHighContrast) return {};
    
    const theme = HIGH_CONTRAST_THEMES[currentTheme];
    const colorMap = {
      critical: theme.critical,
      high: theme.warning,
      medium: theme.info,
      low: theme.success
    };
    
    return {
      color: colorMap[level.toLowerCase() as keyof typeof colorMap] || theme.text,
      borderColor: colorMap[level.toLowerCase() as keyof typeof colorMap] || theme.border
    };
  }, [isHighContrast, currentTheme]);

  return {
    currentTheme,
    switchTheme,
    getThemeStyles,
    getThreatLevelStyles,
    availableThemes: Object.keys(HIGH_CONTRAST_THEMES) as Array<keyof typeof HIGH_CONTRAST_THEMES>
  };
}

// Hook for emergency accessibility features
export function useEmergencyAccessibility() {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const { announce } = useAccessibility();

  const enableEmergencyMode = useCallback(() => {
    setEmergencyMode(true);
    document.documentElement.classList.add('emergency-mode');
    accessibilityManager.enableHighContrastMode('SOC_OPTIMIZED');
    announce(SCREEN_READER_MESSAGES.EMERGENCY_MODE, 'assertive');
  }, [announce]);

  const disableEmergencyMode = useCallback(() => {
    setEmergencyMode(false);
    document.documentElement.classList.remove('emergency-mode');
    announce('Emergency mode disabled', 'polite');
  }, [announce]);

  const quickActions = useCallback({
    refreshData: () => {
      announce('Refreshing critical threat data', 'assertive');
      window.dispatchEvent(new CustomEvent('refresh-critical-data'));
    },
    escalateIncident: () => {
      announce('Incident escalation initiated', 'assertive');
      window.dispatchEvent(new CustomEvent('escalate-incident'));
    },
    activateDefenses: () => {
      announce('Defensive measures activated', 'assertive');
      window.dispatchEvent(new CustomEvent('activate-defenses'));
    }
  }, [announce]);

  useEffect(() => {
    const handleEmergencyShortcut = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'E') {
        event.preventDefault();
        if (emergencyMode) {
          disableEmergencyMode();
        } else {
          enableEmergencyMode();
        }
      }
    };

    document.addEventListener('keydown', handleEmergencyShortcut);
    return () => document.removeEventListener('keydown', handleEmergencyShortcut);
  }, [emergencyMode, enableEmergencyMode, disableEmergencyMode]);

  return {
    emergencyMode,
    enableEmergencyMode,
    disableEmergencyMode,
    quickActions
  };
}