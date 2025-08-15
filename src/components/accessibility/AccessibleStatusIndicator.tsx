import React from 'react';
import { useAccessibility, useAriaDescriptions, useLiveRegion } from '../../hooks/useAccessibility';
import { ARIA_ROLES } from '../../utils/accessibility';

interface AccessibleStatusIndicatorProps {
  status: 'operational' | 'degraded' | 'offline' | 'maintenance' | 'critical';
  label: string;
  count?: number;
  lastUpdated?: Date;
  icon?: string;
  showPulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  description?: string;
  onStatusChange?: (status: string) => void;
  className?: string;
}

const AccessibleStatusIndicator: React.FC<AccessibleStatusIndicatorProps> = ({
  status,
  label,
  count,
  lastUpdated,
  icon,
  showPulse = false,
  size = 'md',
  description,
  onStatusChange,
  className = ''
}) => {
  const { isHighContrast } = useAccessibility();
  const { getDescriptionProps, getStatusDescription } = useAriaDescriptions();
  const { announce } = useLiveRegion();
  const indicatorId = `status-${React.useId()}`;
  
  const previousStatus = React.useRef(status);

  // Announce status changes
  React.useEffect(() => {
    if (previousStatus.current !== status) {
      const message = count !== undefined 
        ? `${label} status changed to ${status}. ${count} items affected.`
        : `${label} status changed to ${status}`;
      
      announce(message, status === 'critical' || status === 'offline' ? 'assertive' : 'polite');
      onStatusChange?.(status);
      previousStatus.current = status;
    }
  }, [status, label, count, announce, onStatusChange]);

  // Status configuration
  const getStatusConfig = () => {
    const configs = {
      operational: {
        color: isHighContrast ? 'var(--hc-success)' : '#10b981',
        bgColor: isHighContrast ? 'transparent' : '#d1fae5',
        borderColor: isHighContrast ? 'var(--hc-success)' : '#10b981',
        icon: icon || '✅',
        ariaLabel: 'Operational status'
      },
      degraded: {
        color: isHighContrast ? 'var(--hc-warning)' : '#f59e0b',
        bgColor: isHighContrast ? 'transparent' : '#fef3c7',
        borderColor: isHighContrast ? 'var(--hc-warning)' : '#f59e0b',
        icon: icon || '⚠️',
        ariaLabel: 'Degraded performance status'
      },
      offline: {
        color: isHighContrast ? 'var(--hc-critical)' : '#ef4444',
        bgColor: isHighContrast ? 'transparent' : '#fee2e2',
        borderColor: isHighContrast ? 'var(--hc-critical)' : '#ef4444',
        icon: icon || '❌',
        ariaLabel: 'Offline status'
      },
      maintenance: {
        color: isHighContrast ? 'var(--hc-info)' : '#3b82f6',
        bgColor: isHighContrast ? 'transparent' : '#dbeafe',
        borderColor: isHighContrast ? 'var(--hc-info)' : '#3b82f6',
        icon: icon || '🔧',
        ariaLabel: 'Maintenance status'
      },
      critical: {
        color: isHighContrast ? 'var(--hc-critical)' : '#dc2626',
        bgColor: isHighContrast ? 'transparent' : '#fee2e2',
        borderColor: isHighContrast ? 'var(--hc-critical)' : '#dc2626',
        icon: icon || '🚨',
        ariaLabel: 'Critical status'
      }
    };

    return configs[status];
  };

  const config = getStatusConfig();

  // Size configuration
  const sizeConfig = {
    sm: {
      container: 'text-sm',
      indicator: 'w-2 h-2',
      icon: 'text-sm',
      padding: 'px-2 py-1'
    },
    md: {
      container: 'text-base',
      indicator: 'w-3 h-3',
      icon: 'text-base',
      padding: 'px-3 py-2'
    },
    lg: {
      container: 'text-lg',
      indicator: 'w-4 h-4',
      icon: 'text-lg',
      padding: 'px-4 py-3'
    }
  };

  const sizeStyles = sizeConfig[size];

  // Generate full description for screen readers
  const fullDescription = React.useMemo(() => {
    if (description) return description;
    
    let desc = getStatusDescription(status, lastUpdated);
    if (count !== undefined) {
      desc += `. ${count} items in this status.`;
    }
    return desc;
  }, [description, status, lastUpdated, count, getStatusDescription]);

  // Set up ARIA description
  React.useEffect(() => {
    // This would be handled by useAriaDescriptions hook
  }, [fullDescription]);

  const pulseClass = showPulse && (status === 'critical' || status === 'offline') 
    ? 'animate-pulse' : '';

  return (
    <div 
      className={`
        inline-flex items-center gap-2 rounded-lg border-2
        ${sizeStyles.container} ${sizeStyles.padding} ${pulseClass} ${className}
      `}
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
        ...(isHighContrast && {
          borderWidth: '2px',
          borderStyle: 'solid'
        })
      }}
      role={ARIA_ROLES.STATUS_INDICATOR}
      aria-label={config.ariaLabel}
      aria-live={status === 'critical' || status === 'offline' ? 'assertive' : 'polite'}
      aria-atomic="true"
      {...getDescriptionProps(indicatorId)}
    >
      {/* Visual indicator dot */}
      <span
        className={`
          ${sizeStyles.indicator} rounded-full flex-shrink-0
          ${showPulse && (status === 'critical' || status === 'offline') ? 'animate-ping' : ''}
        `}
        style={{ backgroundColor: config.color }}
        aria-hidden="true"
      />

      {/* Status icon */}
      <span 
        className={`${sizeStyles.icon}`}
        style={{ color: config.color }}
        aria-hidden="true"
      >
        {config.icon}
      </span>

      {/* Status text and count */}
      <div className="flex items-center gap-2">
        <span 
          className="font-medium"
          style={{ color: isHighContrast ? 'var(--hc-text)' : undefined }}
        >
          {label}
        </span>
        
        {count !== undefined && (
          <span 
            className="font-bold"
            style={{ color: config.color }}
            aria-label={`${count} items`}
          >
            {count}
          </span>
        )}
      </div>

      {/* Last updated timestamp for screen readers */}
      {lastUpdated && (
        <span className="sr-only">
          Last updated: {lastUpdated.toLocaleString()}
        </span>
      )}

      {/* Pulsing indicator for critical states */}
      {showPulse && (status === 'critical' || status === 'offline') && (
        <span
          className={`absolute ${sizeStyles.indicator} rounded-full animate-ping`}
          style={{ backgroundColor: config.color }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default AccessibleStatusIndicator;