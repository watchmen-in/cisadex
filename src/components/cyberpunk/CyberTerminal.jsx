import React, { useState, useEffect, useRef } from 'react';

const CyberTerminal = ({ 
  title = 'CYBER TERMINAL', 
  lines = [],
  autoScroll = true,
  typewriter = false,
  className = '',
  height = '300px',
  prompt = '> ',
  ...props 
}) => {
  const [displayLines, setDisplayLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const terminalRef = useRef(null);

  // Typewriter effect
  useEffect(() => {
    if (!typewriter || currentLineIndex >= lines.length) return;

    const currentLine = lines[currentLineIndex];
    if (currentCharIndex < currentLine.length) {
      const timer = setTimeout(() => {
        setDisplayLines(prev => {
          const newLines = [...prev];
          if (!newLines[currentLineIndex]) {
            newLines[currentLineIndex] = '';
          }
          newLines[currentLineIndex] = currentLine.substring(0, currentCharIndex + 1);
          return newLines;
        });
        setCurrentCharIndex(prev => prev + 1);
      }, 50 + Math.random() * 100); // Variable speed for realism

      return () => clearTimeout(timer);
    } else {
      // Move to next line
      setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, 500);
    }
  }, [typewriter, lines, currentLineIndex, currentCharIndex]);

  // Auto scroll to bottom
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [displayLines, autoScroll]);

  // Initialize display lines
  useEffect(() => {
    if (!typewriter) {
      setDisplayLines(lines);
    }
  }, [lines, typewriter]);

  const renderLine = (line, index) => {
    const isCommand = line.startsWith(prompt);
    const isError = line.includes('ERROR') || line.includes('FAILED');
    const isWarning = line.includes('WARNING') || line.includes('WARN');
    const isSuccess = line.includes('SUCCESS') || line.includes('COMPLETE');

    let lineClass = 'text-neon-green';
    if (isCommand) lineClass = 'text-neon-cyan';
    if (isError) lineClass = 'text-neon-magenta';
    if (isWarning) lineClass = 'text-neon-yellow';
    if (isSuccess) lineClass = 'text-neon-green animate-neon-glow';

    return (
      <div 
        key={index} 
        className={`font-mono text-sm leading-relaxed ${lineClass} hover:drop-shadow-[0_0_8px_currentColor] transition-all duration-200`}
      >
        {line}
        {typewriter && index === currentLineIndex && (
          <span className="animate-pulse text-neon-cyan">_</span>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`
        terminal-window
        ${className}
      `}
      style={{ height }}
      {...props}
    >
      {/* Terminal Header */}
      <div className="terminal-header">
        <div className="flex items-center gap-2">
          <div className="terminal-dot bg-neon-magenta"></div>
          <div className="terminal-dot bg-neon-yellow"></div>
          <div className="terminal-dot bg-neon-green"></div>
        </div>
        <div className="flex-1 text-center">
          <span className="neon-text-cyan font-bold text-sm uppercase tracking-wider">
            ◈ {title} ◈
          </span>
        </div>
        <div className="w-16"></div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="terminal-content overflow-y-auto custom-scrollbar data-stream"
        style={{ height: 'calc(100% - 40px)' }}
      >
        {/* Cyber Grid Background */}
        <div className="absolute inset-0 cyber-grid-animated opacity-5 pointer-events-none"></div>
        
        {/* Terminal Lines */}
        <div className="relative z-10 space-y-1">
          {displayLines.map((line, index) => renderLine(line, index))}
          
          {/* Cursor for non-typewriter mode */}
          {!typewriter && (
            <div className="flex items-center">
              <span className="text-neon-cyan mr-2">{prompt}</span>
              <span className="animate-pulse text-neon-cyan">_</span>
            </div>
          )}
        </div>

        {/* Scan Line Effect */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-neon-green 
                        shadow-[0_0_10px_currentColor] animate-scan-line opacity-30"></div>
      </div>
    </div>
  );
};

export default CyberTerminal;