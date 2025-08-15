/**
 * Security utilities for input validation and sanitization
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  const element = document.createElement('div');
  element.textContent = input;
  return element.innerHTML;
}

/**
 * Validate and sanitize URL parameters
 */
export function sanitizeUrlParam(param: string): string {
  if (typeof param !== 'string') return '';
  
  // Remove potential dangerous characters
  return param
    .replace(/[<>'"&]/g, '')
    .substring(0, 1000) // Limit length
    .trim();
}

/**
 * Validate entity ID format
 */
export function validateEntityId(id: string): boolean {
  if (typeof id !== 'string') return false;
  
  // Only allow alphanumeric, hyphens, and underscores
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  return validPattern.test(id) && id.length > 0 && id.length <= 100;
}

/**
 * Validate coordinates
 */
export function validateCoordinates(lng: number, lat: number): boolean {
  return (
    typeof lng === 'number' &&
    typeof lat === 'number' &&
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}

/**
 * Validate filter object to prevent injection
 */
export function validateFilters(filters: any): boolean {
  if (!filters || typeof filters !== 'object') return false;
  
  const allowedKeys = ['agencies', 'sectors', 'functions', 'states'];
  const keys = Object.keys(filters);
  
  // Check if all keys are allowed
  if (!keys.every(key => allowedKeys.includes(key))) return false;
  
  // Check if all values are arrays of strings
  for (const key of keys) {
    const value = filters[key];
    if (!Array.isArray(value)) return false;
    if (!value.every(item => typeof item === 'string' && item.length <= 100)) return false;
  }
  
  return true;
}

/**
 * Rate limiting for API calls
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    // Check if under limit
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

/**
 * Generate secure random string for request IDs
 */
export function generateSecureId(): string {
  const array = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Content Security Policy violation reporter
 */
export function setupCSPReporting(): void {
  if (typeof window === 'undefined') return;
  
  document.addEventListener('securitypolicyviolation', (e) => {
    console.warn('CSP Violation:', {
      directive: e.violatedDirective,
      blockedURI: e.blockedURI,
      lineNumber: e.lineNumber,
      columnNumber: e.columnNumber,
      sourceFile: e.sourceFile,
    });
    
    // In production, you might want to send this to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: send to monitoring service
      // fetch('/api/csp-violations', { method: 'POST', body: JSON.stringify(violationData) });
    }
  });
}