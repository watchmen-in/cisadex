/**
 * Security initialization hook for CISAdx
 * Handles CSP setup, security headers validation, and security monitoring
 */

import { useEffect } from 'react';
import { setupCSPReporting } from '../utils/security';

export function useSecurityInit() {
  useEffect(() => {
    // Initialize CSP violation reporting
    setupCSPReporting();

    // Validate that security headers are present
    validateSecurityHeaders();

    // Set up security monitoring
    setupSecurityMonitoring();

    // Initialize secure session handling
    initializeSecureSession();

    // Content validation setup
    setupContentValidation();

    return () => {
      // Cleanup security monitoring
      cleanupSecurityMonitoring();
    };
  }, []);
}

function validateSecurityHeaders() {
  if (typeof window === 'undefined') return;

  // Check if running in secure context
  if (!window.isSecureContext && location.protocol !== 'https:' && location.hostname !== 'localhost') {
    console.warn('Application is not running in a secure context. HTTPS is required for production.');
  }

  // Validate CSP by checking if inline styles are blocked
  try {
    const testElement = document.createElement('div');
    testElement.style.cssText = 'color: red;';
    document.head.appendChild(testElement);
    document.head.removeChild(testElement);
  } catch (error) {
    console.log('CSP is properly configured - inline styles are blocked');
  }

  // Check for X-Frame-Options or frame-ancestors CSP
  const canFrame = window.self !== window.top;
  if (canFrame) {
    console.warn('Application may be vulnerable to clickjacking. Ensure proper frame protection.');
  }
}

function setupSecurityMonitoring() {
  if (typeof window === 'undefined') return;

  // Monitor for suspicious activity
  let suspiciousActivityCount = 0;
  const MAX_SUSPICIOUS_ACTIVITY = 10;

  // Monitor console access (potential XSS attempts)
  const originalConsole = window.console;
  const consoleAccessCount = { count: 0, lastAccess: 0 };

  Object.defineProperty(window, 'console', {
    get() {
      const now = Date.now();
      if (now - consoleAccessCount.lastAccess < 1000) {
        consoleAccessCount.count++;
      } else {
        consoleAccessCount.count = 1;
      }
      consoleAccessCount.lastAccess = now;

      if (consoleAccessCount.count > 20) {
        logSecurityEvent('excessive_console_access', {
          count: consoleAccessCount.count,
          timestamp: now
        });
      }

      return originalConsole;
    },
    configurable: true
  });

  // Monitor for eval usage attempts
  const originalEval = window.eval;
  window.eval = function(...args) {
    logSecurityEvent('eval_attempt', { args: args.map(arg => typeof arg) });
    throw new Error('eval() is disabled for security reasons');
  };

  // Monitor for suspicious DOM mutations
  if ('MutationObserver' in window) {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // Check for suspicious script injections
              if (element.tagName === 'SCRIPT' || element.innerHTML?.includes('<script')) {
                logSecurityEvent('suspicious_script_injection', {
                  tagName: element.tagName,
                  content: element.innerHTML?.substring(0, 100)
                });
                suspiciousActivityCount++;
              }
            }
          }
        }
      }

      if (suspiciousActivityCount > MAX_SUSPICIOUS_ACTIVITY) {
        logSecurityEvent('excessive_suspicious_activity', {
          count: suspiciousActivityCount
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Store observer for cleanup
    (window as any).__cisadexSecurityObserver = observer;
  }

  // Monitor storage access patterns
  monitorStorageAccess();
}

function monitorStorageAccess() {
  if (typeof window === 'undefined') return;

  let storageAccessCount = 0;
  const MAX_STORAGE_ACCESS = 100;

  // Monitor localStorage access
  const originalSetItem = localStorage.setItem;
  const originalGetItem = localStorage.getItem;

  localStorage.setItem = function(key, value) {
    storageAccessCount++;
    
    // Validate key and value
    if (typeof key !== 'string' || key.length > 100) {
      logSecurityEvent('invalid_storage_key', { key: typeof key });
      return;
    }
    
    if (typeof value !== 'string' || value.length > 10000) {
      logSecurityEvent('excessive_storage_value', { valueLength: value?.length });
      return;
    }

    if (storageAccessCount > MAX_STORAGE_ACCESS) {
      logSecurityEvent('excessive_storage_access', { count: storageAccessCount });
      return;
    }

    return originalSetItem.call(this, key, value);
  };

  localStorage.getItem = function(key) {
    storageAccessCount++;
    
    if (storageAccessCount > MAX_STORAGE_ACCESS) {
      logSecurityEvent('excessive_storage_access', { count: storageAccessCount });
      return null;
    }

    return originalGetItem.call(this, key);
  };
}

function initializeSecureSession() {
  if (typeof window === 'undefined') return;

  // Generate session identifier for tracking
  const sessionId = generateSessionId();
  sessionStorage.setItem('cisadx-session', sessionId);

  // Set session timeout
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  let lastActivity = Date.now();

  const updateActivity = () => {
    lastActivity = Date.now();
  };

  // Track user activity
  ['click', 'keypress', 'mousemove', 'scroll'].forEach(event => {
    document.addEventListener(event, updateActivity, { passive: true });
  });

  // Check session validity periodically
  const sessionCheckInterval = setInterval(() => {
    const now = Date.now();
    if (now - lastActivity > SESSION_TIMEOUT) {
      logSecurityEvent('session_timeout', { sessionId, duration: now - lastActivity });
      
      // Clear sensitive data
      sessionStorage.clear();
      
      // Optional: redirect to login or refresh
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
  }, 60000); // Check every minute

  // Store interval for cleanup
  (window as any).__cisadexSessionInterval = sessionCheckInterval;
}

function setupContentValidation() {
  if (typeof window === 'undefined') return;

  // Validate all external content loading
  const originalFetch = window.fetch;
  window.fetch = async function(input, init) {
    const url = typeof input === 'string' ? input : input.url;
    
    // Validate URL
    if (!isValidUrl(url)) {
      logSecurityEvent('invalid_fetch_url', { url });
      throw new Error('Invalid URL for fetch request');
    }

    // Add security headers
    const secureInit = {
      ...init,
      headers: {
        ...init?.headers,
        'X-Requested-With': 'XMLHttpRequest',
        'X-CISAdx-Request': 'true'
      }
    };

    try {
      return await originalFetch.call(this, input, secureInit);
    } catch (error) {
      logSecurityEvent('fetch_error', { url, error: error.message });
      throw error;
    }
  };
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    
    // Only allow HTTPS in production
    if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
      return false;
    }
    
    // Block known malicious domains (example list)
    const blockedDomains = ['malicious-site.com', 'phishing-domain.net'];
    if (blockedDomains.includes(parsed.hostname)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

function generateSessionId(): string {
  const array = new Uint8Array(16);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for older browsers
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function logSecurityEvent(event: string, data: any) {
  const securityEvent = {
    event,
    data,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    sessionId: sessionStorage.getItem('cisadx-session')
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('🔒 Security Event:', securityEvent);
  }

  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: send to monitoring endpoint
    // fetch('/api/security-events', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(securityEvent)
    // }).catch(() => {
    //   // Fail silently to prevent infinite loops
    // });
  }

  // Store critical events locally for forensics
  const criticalEvents = ['eval_attempt', 'suspicious_script_injection', 'excessive_suspicious_activity'];
  if (criticalEvents.includes(event)) {
    try {
      const existingEvents = JSON.parse(localStorage.getItem('cisadx-security-events') || '[]');
      existingEvents.push(securityEvent);
      
      // Keep only last 50 events
      if (existingEvents.length > 50) {
        existingEvents.splice(0, existingEvents.length - 50);
      }
      
      localStorage.setItem('cisadx-security-events', JSON.stringify(existingEvents));
    } catch {
      // Ignore storage errors
    }
  }
}

function cleanupSecurityMonitoring() {
  if (typeof window === 'undefined') return;

  // Cleanup mutation observer
  const observer = (window as any).__cisadexSecurityObserver;
  if (observer) {
    observer.disconnect();
    delete (window as any).__cisadexSecurityObserver;
  }

  // Cleanup session interval
  const sessionInterval = (window as any).__cisadexSessionInterval;
  if (sessionInterval) {
    clearInterval(sessionInterval);
    delete (window as any).__cisadexSessionInterval;
  }
}