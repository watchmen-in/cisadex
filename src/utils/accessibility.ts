/**
 * Accessibility utilities for government-compliant cybersecurity dashboard
 * Following WCAG 2.1 AA standards and Section 508 compliance
 */

// Keyboard navigation constants
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  F1: 'F1',
  F2: 'F2',
  F3: 'F3',
  F4: 'F4',
  F5: 'F5',
  F6: 'F6',
  F7: 'F7',
  F8: 'F8',
  F9: 'F9',
  F10: 'F10',
  F11: 'F11',
  F12: 'F12'
} as const;

// ARIA roles for cybersecurity components
export const ARIA_ROLES = {
  // Dashboard specific roles
  THREAT_MONITOR: 'region',
  ALERT_BANNER: 'alert',
  STATUS_INDICATOR: 'status',
  LIVE_FEED: 'log',
  METRIC_DISPLAY: 'img',
  FILTER_PANEL: 'search',
  EMERGENCY_ACTIONS: 'toolbar',
  INCIDENT_LIST: 'list',
  THREAT_CARD: 'article',
  
  // Standard ARIA roles
  MAIN: 'main',
  NAVIGATION: 'navigation',
  BANNER: 'banner',
  CONTENTINFO: 'contentinfo',
  COMPLEMENTARY: 'complementary',
  DIALOG: 'dialog',
  ALERTDIALOG: 'alertdialog',
  TAB: 'tab',
  TABPANEL: 'tabpanel',
  TABLIST: 'tablist',
  BUTTON: 'button',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  TEXTBOX: 'textbox',
  LISTBOX: 'listbox',
  OPTION: 'option',
  PROGRESSBAR: 'progressbar'
} as const;

// Color contrast ratios for WCAG AA compliance
export const CONTRAST_RATIOS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5
} as const;

// High contrast color schemes for 24/7 operations
export const HIGH_CONTRAST_THEMES = {
  LIGHT: {
    name: 'High Contrast Light',
    background: '#ffffff',
    text: '#000000',
    critical: '#cc0000',
    warning: '#b35900',
    success: '#006600',
    info: '#000099',
    border: '#000000',
    focus: '#0066cc'
  },
  DARK: {
    name: 'High Contrast Dark',
    background: '#000000',
    text: '#ffffff',
    critical: '#ff6666',
    warning: '#ffcc66',
    success: '#66ff66',
    info: '#6666ff',
    border: '#ffffff',
    focus: '#66ccff'
  },
  SOC_OPTIMIZED: {
    name: 'SOC Operations',
    background: '#1a1a1a',
    text: '#e0e0e0',
    critical: '#ff4444',
    warning: '#ffaa00',
    success: '#44ff44',
    info: '#4488ff',
    border: '#666666',
    focus: '#00aaff'
  }
} as const;

// Screen reader announcements for cybersecurity events
export const SCREEN_READER_MESSAGES = {
  THREAT_DETECTED: 'Critical threat detected. Review immediately.',
  INCIDENT_RESOLVED: 'Incident has been resolved.',
  ALERT_DISMISSED: 'Alert dismissed.',
  SYSTEM_OFFLINE: 'System is offline. Immediate attention required.',
  SYSTEM_ONLINE: 'System is back online.',
  FILTER_APPLIED: 'Filter applied. Results updated.',
  DATA_LOADING: 'Loading threat intelligence data.',
  DATA_LOADED: 'Threat intelligence data loaded.',
  EMERGENCY_MODE: 'Emergency mode activated. All non-critical functions disabled.',
  MAINTENANCE_MODE: 'System in maintenance mode.',
  ACCESS_DENIED: 'Access denied. Insufficient privileges.',
  SESSION_TIMEOUT: 'Session timeout warning. Please save your work.',
  CONNECTION_LOST: 'Network connection lost. Operating in offline mode.',
  CONNECTION_RESTORED: 'Network connection restored.'
} as const;

/**
 * Accessibility manager class for dashboard-wide a11y features
 */
export class AccessibilityManager {
  private static instance: AccessibilityManager;
  private announcer: HTMLElement | null = null;
  private focusTracker: HTMLElement | null = null;
  private keyboardNavigationEnabled = true;
  private highContrastMode = false;
  private reducedMotion = false;
  private screenReaderMode = false;
  
  static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }

  constructor() {
    this.init();
  }

  private init(): void {
    if (typeof window === 'undefined') return;

    // Create live region for announcements
    this.createLiveRegion();
    
    // Detect user preferences
    this.detectUserPreferences();
    
    // Set up keyboard navigation
    this.setupKeyboardNavigation();
    
    // Set up focus management
    this.setupFocusManagement();
    
    // Monitor for accessibility setting changes
    this.monitorPreferenceChanges();
  }

  private createLiveRegion(): void {
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.setAttribute('id', 'accessibility-announcer');
    this.announcer.style.position = 'absolute';
    this.announcer.style.left = '-10000px';
    this.announcer.style.width = '1px';
    this.announcer.style.height = '1px';
    this.announcer.style.overflow = 'hidden';
    document.body.appendChild(this.announcer);
  }

  private detectUserPreferences(): void {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.reducedMotion = true;
      document.documentElement.classList.add('reduce-motion');
    }

    // Check for high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.highContrastMode = true;
      this.enableHighContrastMode();
    }

    // Check for screen reader usage
    this.screenReaderMode = this.detectScreenReader();
  }

  private detectScreenReader(): boolean {
    // Check for common screen reader indicators
    const userAgent = navigator.userAgent.toLowerCase();
    const hasScreenReader = 
      userAgent.includes('nvda') ||
      userAgent.includes('jaws') ||
      userAgent.includes('voiceover') ||
      userAgent.includes('dragon') ||
      document.documentElement.classList.contains('sr-only') ||
      window.speechSynthesis?.speaking === true;

    return hasScreenReader;
  }

  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (event) => {
      if (!this.keyboardNavigationEnabled) return;

      // Emergency shortcuts for SOC operations
      if (event.ctrlKey && event.shiftKey) {
        switch (event.key) {
          case 'E': // Emergency mode
            event.preventDefault();
            this.announce(SCREEN_READER_MESSAGES.EMERGENCY_MODE);
            this.triggerEmergencyMode();
            break;
          case 'H': // High contrast toggle
            event.preventDefault();
            this.toggleHighContrast();
            break;
          case 'M': // Mute/unmute notifications
            event.preventDefault();
            this.toggleNotifications();
            break;
          case 'R': // Refresh critical data
            event.preventDefault();
            this.announce('Refreshing critical threat data.');
            this.refreshCriticalData();
            break;
        }
      }

      // Help overlay (F1)
      if (event.key === KEYBOARD_KEYS.F1) {
        event.preventDefault();
        this.showKeyboardHelp();
      }

      // Skip to main content (Alt + M)
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        this.skipToMainContent();
      }
    });
  }

  private setupFocusManagement(): void {
    // Create focus indicator
    const style = document.createElement('style');
    style.textContent = `
      .focus-visible {
        outline: 3px solid #0066cc !important;
        outline-offset: 2px !important;
      }
      
      .high-contrast .focus-visible {
        outline: 3px solid #66ccff !important;
        outline-offset: 2px !important;
      }
      
      .focus-trap {
        position: relative;
      }
      
      .focus-trap::before,
      .focus-trap::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);

    // Track focus for better UX
    document.addEventListener('focusin', (event) => {
      this.focusTracker = event.target as HTMLElement;
    });
  }

  private monitorPreferenceChanges(): void {
    // Monitor media queries for preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
      document.documentElement.classList.toggle('reduce-motion', e.matches);
    });

    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      this.highContrastMode = e.matches;
      if (e.matches) {
        this.enableHighContrastMode();
      } else {
        this.disableHighContrastMode();
      }
    });
  }

  // Public API methods
  public announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.announcer) return;
    
    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      if (this.announcer) {
        this.announcer.textContent = '';
      }
    }, 1000);
  }

  public enableHighContrastMode(theme: keyof typeof HIGH_CONTRAST_THEMES = 'SOC_OPTIMIZED'): void {
    const selectedTheme = HIGH_CONTRAST_THEMES[theme];
    document.documentElement.classList.add('high-contrast');
    
    // Apply CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--hc-bg', selectedTheme.background);
    root.style.setProperty('--hc-text', selectedTheme.text);
    root.style.setProperty('--hc-critical', selectedTheme.critical);
    root.style.setProperty('--hc-warning', selectedTheme.warning);
    root.style.setProperty('--hc-success', selectedTheme.success);
    root.style.setProperty('--hc-info', selectedTheme.info);
    root.style.setProperty('--hc-border', selectedTheme.border);
    root.style.setProperty('--hc-focus', selectedTheme.focus);
    
    this.announce(`High contrast mode enabled: ${selectedTheme.name}`);
  }

  public disableHighContrastMode(): void {
    document.documentElement.classList.remove('high-contrast');
    this.announce('High contrast mode disabled');
  }

  public toggleHighContrast(): void {
    if (this.highContrastMode) {
      this.disableHighContrastMode();
      this.highContrastMode = false;
    } else {
      this.enableHighContrastMode();
      this.highContrastMode = true;
    }
  }

  public skipToMainContent(): void {
    const mainContent = document.querySelector('[role="main"], main, #main-content');
    if (mainContent instanceof HTMLElement) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  public trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === KEYBOARD_KEYS.TAB) {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
      
      if (event.key === KEYBOARD_KEYS.ESCAPE) {
        this.releaseFocusTrap();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  public releaseFocusTrap(): void {
    if (this.focusTracker) {
      this.focusTracker.focus();
    }
  }

  private triggerEmergencyMode(): void {
    document.documentElement.classList.add('emergency-mode');
    // Additional emergency mode logic would go here
  }

  private toggleNotifications(): void {
    // Toggle notification preferences
    const currentState = localStorage.getItem('notifications-muted') === 'true';
    localStorage.setItem('notifications-muted', String(!currentState));
    this.announce(currentState ? 'Notifications enabled' : 'Notifications muted');
  }

  private refreshCriticalData(): void {
    // Trigger data refresh in the application
    window.dispatchEvent(new CustomEvent('refresh-critical-data'));
  }

  private showKeyboardHelp(): void {
    const helpContent = `
      Keyboard Shortcuts for SOC Operations:
      - Ctrl+Shift+E: Emergency mode
      - Ctrl+Shift+H: Toggle high contrast
      - Ctrl+Shift+M: Mute/unmute notifications
      - Ctrl+Shift+R: Refresh critical data
      - Alt+M: Skip to main content
      - F1: Show this help
      - Tab/Shift+Tab: Navigate between elements
      - Enter/Space: Activate buttons and links
      - Escape: Close dialogs and menus
    `;
    
    this.announce(helpContent, 'assertive');
  }

  // Getters for current state
  public isHighContrastEnabled(): boolean {
    return this.highContrastMode;
  }

  public isReducedMotionEnabled(): boolean {
    return this.reducedMotion;
  }

  public isScreenReaderActive(): boolean {
    return this.screenReaderMode;
  }

  public isKeyboardNavigationEnabled(): boolean {
    return this.keyboardNavigationEnabled;
  }

  // Setters for manual control
  public setKeyboardNavigation(enabled: boolean): void {
    this.keyboardNavigationEnabled = enabled;
  }
}

// Utility functions for color contrast checking
export function calculateContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    // Simplified luminance calculation
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;
    
    const [r, g, b] = rgb.map(num => {
      const val = parseInt(num) / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

export function meetsContrastRequirement(
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA',
  isLargeText = false
): boolean {
  const ratio = calculateContrastRatio(foreground, background);
  const requirement = level === 'AA' 
    ? (isLargeText ? CONTRAST_RATIOS.AA_LARGE : CONTRAST_RATIOS.AA_NORMAL)
    : (isLargeText ? CONTRAST_RATIOS.AAA_LARGE : CONTRAST_RATIOS.AAA_NORMAL);
  
  return ratio >= requirement;
}

// Export singleton instance
export const accessibilityManager = AccessibilityManager.getInstance();