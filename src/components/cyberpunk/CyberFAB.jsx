import React, { useState } from 'react';

const CyberFAB = ({ 
  actions = [],
  mainIcon = "◈",
  position = "bottom-right",
  variant = "primary"
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const variants = {
    primary: {
      bg: 'bg-matrix-dark',
      border: 'border-neon-cyan',
      text: 'text-neon-cyan',
      hover: 'hover:bg-neon-cyan/10 hover:border-neon-magenta hover:text-neon-magenta',
      glow: 'shadow-[0_0_20px_rgba(0,255,255,0.3)]'
    },
    danger: {
      bg: 'bg-matrix-dark',
      border: 'border-neon-magenta',
      text: 'text-neon-magenta',
      hover: 'hover:bg-neon-magenta/10 hover:border-neon-pink hover:text-neon-pink',
      glow: 'shadow-[0_0_20px_rgba(255,0,128,0.3)]'
    },
    warning: {
      bg: 'bg-matrix-dark',
      border: 'border-neon-yellow',
      text: 'text-neon-yellow',
      hover: 'hover:bg-neon-yellow/10 hover:border-neon-orange hover:text-neon-orange',
      glow: 'shadow-[0_0_20px_rgba(255,255,0,0.3)]'
    }
  };

  const style = variants[variant];

  return (
    <div className={`fixed ${positions[position]} z-50`}>
      {/* Action Buttons */}
      <div className={`
        absolute bottom-16 right-0 space-y-3 transition-all duration-300 transform
        ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-4'}
      `}>
        {actions.map((action, index) => (
          <div
            key={index}
            className="flex items-center gap-3"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Action Label */}
            <div className="bg-matrix-dark/90 border border-neon-green px-3 py-1 rounded-full
                            text-neon-green text-xs uppercase tracking-wide font-bold
                            backdrop-blur-sm whitespace-nowrap">
              {action.label}
            </div>
            
            {/* Action Button */}
            <button
              onClick={action.onClick}
              className={`
                w-12 h-12 rounded-full border-2 transition-all duration-300
                flex items-center justify-center text-lg font-bold
                hover:scale-110 hover:animate-neon-pulse focus:outline-none
                ${style.bg} ${style.border} ${style.text} ${style.hover} ${style.glow}
              `}
            >
              {action.icon}
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-16 h-16 rounded-full border-2 transition-all duration-300
          flex items-center justify-center text-xl font-bold
          hover:scale-110 focus:outline-none animate-cyber-float
          ${style.bg} ${style.border} ${style.text} ${style.hover} ${style.glow}
          ${isOpen ? 'rotate-45' : 'rotate-0'}
        `}
      >
        <span className="animate-neon-glow">
          {isOpen ? "◈" : mainIcon}
        </span>
      </button>

      {/* Ripple Effect */}
      <div className="absolute inset-0 rounded-full border-2 border-current 
                      animate-ping opacity-20 pointer-events-none"></div>
    </div>
  );
};

export default CyberFAB;