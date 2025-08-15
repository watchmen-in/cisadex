import React from 'react';

const CyberCard = ({ 
  children, 
  variant = 'default', 
  holographic = false,
  glowing = false,
  scanLines = false,
  matrixRain = false,
  className = '',
  ...props 
}) => {
  const baseClasses = `
    relative rounded-lg border backdrop-blur-sm transition-all duration-300
    hover:transform hover:-translate-y-1 hover:scale-[1.02]
    overflow-hidden
  `;

  const variants = {
    default: `
      bg-matrix-dark/80 border-neon-cyan/30
      hover:border-neon-cyan hover:bg-matrix-dark/90
    `,
    primary: `
      bg-gradient-to-br from-matrix-dark/90 to-matrix-code/50 border-neon-cyan
      hover:border-neon-magenta hover:from-matrix-dark to-matrix-dark/80
    `,
    hologram: `
      bg-gradient-to-br from-neon-cyan/5 via-neon-magenta/5 to-neon-green/5 
      border-neon-cyan/50 hover:border-neon-cyan
    `,
    terminal: `
      bg-matrix-terminal border-neon-green font-mono
      hover:border-neon-cyan hover:bg-matrix-dark
    `,
    danger: `
      bg-gradient-to-br from-matrix-dark/90 to-neon-magenta/10 border-neon-magenta/50
      hover:border-neon-magenta hover:from-matrix-dark to-neon-magenta/20
    `,
    floating: `
      bg-matrix-dark/70 border-neon-purple/40 shadow-2xl
      hover:border-neon-purple hover:shadow-[0_0_30px_rgba(157,0,255,0.3)]
    `
  };

  const effectClasses = `
    ${holographic ? 'hologram-panel' : ''}
    ${glowing ? 'neon-glow-cyan' : ''}
    ${scanLines ? 'scan-lines' : ''}
    ${matrixRain ? 'matrix-rain' : ''}
  `;

  return (
    <div
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${effectClasses}
        ${className}
      `}
      {...props}
    >
      {/* Holographic Shimmer Effect */}
      {holographic && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-cyan/10 to-transparent 
                        opacity-0 hover:opacity-100 transition-opacity duration-500 
                        transform -translate-x-full hover:translate-x-full animation-delay-1000"></div>
      )}

      {/* Scan Line Effect */}
      {scanLines && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-neon-cyan shadow-neon-cyan 
                          animate-scan-line opacity-60"></div>
        </div>
      )}

      {/* Matrix Rain Background */}
      {matrixRain && (
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="matrix-rain w-full h-full"></div>
        </div>
      )}

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid opacity-5 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  );
};

export default CyberCard;