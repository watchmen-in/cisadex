import React from 'react';

const CyberButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  glitch = false,
  pulse = false,
  ...props 
}) => {
  const baseClasses = `
    relative font-bold uppercase tracking-wide transition-all duration-300 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-matrix-dark
    hover:transform hover:-translate-y-0.5 active:translate-y-0
    overflow-hidden cursor-pointer
  `;

  const variants = {
    primary: `
      border-2 border-neon-cyan bg-matrix-dark text-neon-cyan
      hover:bg-neon-cyan/10 hover:border-neon-magenta hover:text-neon-magenta
      focus:ring-neon-cyan hover:drop-shadow-[0_0_15px_currentColor]
    `,
    secondary: `
      border-2 border-neon-green bg-matrix-dark text-neon-green
      hover:bg-neon-green/10 hover:border-neon-cyan hover:text-neon-cyan
      focus:ring-neon-green hover:drop-shadow-[0_0_15px_currentColor]
    `,
    danger: `
      border-2 border-neon-magenta bg-matrix-dark text-neon-magenta
      hover:bg-neon-magenta/10 hover:border-neon-pink hover:text-neon-pink
      focus:ring-neon-magenta hover:drop-shadow-[0_0_15px_currentColor]
    `,
    warning: `
      border-2 border-neon-orange bg-matrix-dark text-neon-orange
      hover:bg-neon-orange/10 hover:border-neon-yellow hover:text-neon-yellow
      focus:ring-neon-orange hover:drop-shadow-[0_0_15px_currentColor]
    `,
    ghost: `
      border-2 border-transparent bg-transparent text-neon-cyan
      hover:border-neon-cyan hover:bg-neon-cyan/5 hover:text-neon-magenta
      focus:ring-neon-cyan hover:drop-shadow-[0_0_10px_currentColor]
    `
  };

  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-6 py-2 text-sm',
    lg: 'px-8 py-3 text-base',
    xl: 'px-10 py-4 text-lg'
  };

  const animationClasses = `
    ${pulse ? 'animate-neon-pulse' : ''}
    ${glitch ? 'glitch-effect' : ''}
  `;

  return (
    <button
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${animationClasses}
        ${className}
      `}
      data-text={glitch ? children : undefined}
      {...props}
    >
      {/* Energy Wave Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 hover:opacity-20 transition-opacity duration-500 transform -translate-x-full hover:translate-x-full"></div>
      
      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};

export default CyberButton;