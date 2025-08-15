import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { useAccessibility, useAriaDescriptions } from '../../hooks/useAccessibility';

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'emergency' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  emergencyAction?: boolean;
  description?: string;
  shortcut?: string;
  ariaLabel?: string;
  children: React.ReactNode;
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    variant = 'primary',
    size = 'md',
    loading = false,
    emergencyAction = false,
    description,
    shortcut,
    ariaLabel,
    children,
    disabled,
    onClick,
    className = '',
    ...props
  }, ref) => {
    const { isHighContrast } = useAccessibility();
    const { setDescription, getDescriptionProps } = useAriaDescriptions();
    const buttonId = `button-${React.useId()}`;

    // Set up description if provided
    React.useEffect(() => {
      if (description) {
        let fullDescription = description;
        if (shortcut) {
          fullDescription += `. Keyboard shortcut: ${shortcut}`;
        }
        if (emergencyAction) {
          fullDescription += '. This is an emergency action button.';
        }
        setDescription(buttonId, fullDescription);
      }
    }, [description, shortcut, emergencyAction, setDescription, buttonId]);

    // Base styles
    const baseStyles = `
      inline-flex items-center justify-center
      font-medium rounded-lg
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      relative
    `;

    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg'
    };

    // Variant styles
    const getVariantStyles = () => {
      if (isHighContrast) {
        return {
          primary: 'bg-hc-info text-hc-bg border-2 border-hc-info hover:bg-hc-bg hover:text-hc-info focus:ring-hc-focus',
          secondary: 'bg-hc-bg text-hc-text border-2 border-hc-border hover:bg-hc-text hover:text-hc-bg focus:ring-hc-focus',
          danger: 'bg-hc-critical text-hc-bg border-2 border-hc-critical hover:bg-hc-bg hover:text-hc-critical focus:ring-hc-focus',
          emergency: 'bg-hc-critical text-hc-bg border-4 border-hc-critical animate-pulse hover:animate-none focus:ring-hc-focus',
          ghost: 'bg-transparent text-hc-text border border-hc-border hover:bg-hc-text hover:text-hc-bg focus:ring-hc-focus'
        };
      }

      return {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        emergency: 'bg-red-600 text-white border-2 border-red-400 hover:bg-red-700 focus:ring-red-500 animate-pulse hover:animate-none shadow-lg',
        ghost: 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500'
      };
    };

    const variantStyles = getVariantStyles()[variant];

    // Emergency action styles
    const emergencyStyles = emergencyAction ? 
      'ring-2 ring-red-400 ring-offset-2' : '';

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;
      
      // Provide haptic feedback for emergency actions
      if (emergencyAction && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      
      onClick?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      // Enhanced keyboard support for emergency actions
      if (emergencyAction && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        handleClick(event as any);
      }
    };

    return (
      <button
        ref={ref}
        id={buttonId}
        className={`
          ${baseStyles}
          ${sizeStyles[size]}
          ${variantStyles}
          ${emergencyStyles}
          ${className}
        `}
        disabled={disabled || loading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        role="button"
        tabIndex={disabled ? -1 : 0}
        {...(description ? getDescriptionProps(buttonId) : {})}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span 
              className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"
              aria-hidden="true"
            />
            <span className="sr-only">Loading...</span>
          </span>
        )}
        
        <span className={loading ? 'opacity-0' : 'flex items-center gap-2'}>
          {children}
          {shortcut && (
            <span className="text-xs opacity-75 ml-2 hidden sm:inline">
              ({shortcut})
            </span>
          )}
        </span>

        {emergencyAction && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" aria-hidden="true" />
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;