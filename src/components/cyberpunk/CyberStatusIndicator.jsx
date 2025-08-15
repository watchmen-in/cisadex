import React from 'react';

const CyberStatusIndicator = ({ 
  status = 'online', 
  label, 
  pulse = true,
  size = 'md',
  showLabel = true,
  className = '',
  ...props 
}) => {
  const statusConfig = {
    online: {
      color: 'neon-green',
      bgColor: 'bg-neon-green/20',
      borderColor: 'border-neon-green',
      textColor: 'text-neon-green',
      glow: '0_0_10px_rgba(57,255,20,0.3)',
      icon: '◉',
      defaultLabel: 'ONLINE'
    },
    offline: {
      color: 'neon-magenta',
      bgColor: 'bg-neon-magenta/20',
      borderColor: 'border-neon-magenta',
      textColor: 'text-neon-magenta',
      glow: '0_0_10px_rgba(255,0,128,0.3)',
      icon: '◌',
      defaultLabel: 'OFFLINE'
    },
    warning: {
      color: 'neon-yellow',
      bgColor: 'bg-neon-yellow/20',
      borderColor: 'border-neon-yellow',
      textColor: 'text-neon-yellow',
      glow: '0_0_10px_rgba(255,255,0,0.3)',
      icon: '◈',
      defaultLabel: 'WARNING'
    },
    critical: {
      color: 'neon-magenta',
      bgColor: 'bg-neon-magenta/30',
      borderColor: 'border-neon-magenta',
      textColor: 'text-neon-magenta',
      glow: '0_0_15px_rgba(255,0,128,0.5)',
      icon: '◆',
      defaultLabel: 'CRITICAL'
    },
    processing: {
      color: 'neon-cyan',
      bgColor: 'bg-neon-cyan/20',
      borderColor: 'border-neon-cyan',
      textColor: 'text-neon-cyan',
      glow: '0_0_10px_rgba(0,255,255,0.3)',
      icon: '◎',
      defaultLabel: 'PROCESSING'
    },
    secure: {
      color: 'neon-purple',
      bgColor: 'bg-neon-purple/20',
      borderColor: 'border-neon-purple',
      textColor: 'text-neon-purple',
      glow: '0_0_10px_rgba(157,0,255,0.3)',
      icon: '◈',
      defaultLabel: 'SECURE'
    }
  };

  const sizes = {
    sm: {
      container: 'px-2 py-1',
      text: 'text-xs',
      icon: 'text-xs'
    },
    md: {
      container: 'px-3 py-1.5',
      text: 'text-sm',
      icon: 'text-sm'
    },
    lg: {
      container: 'px-4 py-2',
      text: 'text-base',
      icon: 'text-base'
    }
  };

  const config = statusConfig[status];
  const sizeConfig = sizes[size];
  const displayLabel = label || config.defaultLabel;

  const pulseAnimation = pulse ? {
    critical: 'animate-neon-pulse',
    warning: 'animate-pulse',
    processing: 'animate-neon-glow',
    default: 'animate-pulse'
  }[status] || 'animate-pulse' : '';

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full border-2
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        ${sizeConfig.container} ${sizeConfig.text}
        transition-all duration-300 font-bold uppercase tracking-wide
        hover:scale-105 ${pulseAnimation}
        ${className}
      `}
      style={{ 
        boxShadow: `${config.glow}`,
        textShadow: `0_0_8px_currentColor`
      }}
      {...props}
    >
      {/* Status Icon */}
      <span 
        className={`${sizeConfig.icon} ${pulseAnimation}`}
        style={{ 
          filter: `drop-shadow(0 0 4px currentColor)` 
        }}
      >
        {config.icon}
      </span>

      {/* Status Label */}
      {showLabel && (
        <span className="font-mono font-bold">
          {displayLabel}
        </span>
      )}

      {/* Additional visual effect for critical status */}
      {status === 'critical' && (
        <div className="absolute inset-0 rounded-full border-2 border-neon-magenta 
                        animate-ping opacity-20 pointer-events-none"></div>
      )}
    </div>
  );
};

export default CyberStatusIndicator;