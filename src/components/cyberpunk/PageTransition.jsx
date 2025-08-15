import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const location = useLocation();

  useEffect(() => {
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Transition Overlay */}
      <div className={`
        fixed inset-0 z-50 pointer-events-none transition-all duration-300
        ${isTransitioning ? 'opacity-100' : 'opacity-0'}
      `}>
        {/* Matrix Digital Rain Effect */}
        <div className="absolute inset-0 matrix-rain"></div>
        
        {/* Scan Line Sweep */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-neon-cyan 
                          shadow-[0_0_20px_currentColor] animate-scan-line"></div>
        </div>
        
        {/* Cyber Grid Flash */}
        <div className="absolute inset-0 cyber-grid-animated opacity-20"></div>
        
        {/* Central Glow Effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-4 border-neon-cyan 
                          bg-neon-cyan/10 animate-neon-pulse"></div>
        </div>
      </div>

      {/* Page Content */}
      <div className={`
        transition-all duration-300 transform
        ${isTransitioning 
          ? 'opacity-0 scale-95 blur-sm' 
          : 'opacity-100 scale-100 blur-0'}
      `}>
        {displayChildren}
      </div>
    </div>
  );
};

export default PageTransition;