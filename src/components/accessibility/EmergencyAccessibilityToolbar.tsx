import React, { useState } from 'react';
import { 
  useAccessibility, 
  useEmergencyAccessibility, 
  useThemeAccessibility,
  useKeyboardNavigation 
} from '../../hooks/useAccessibility';
import AccessibleButton from './AccessibleButton';
import { ARIA_ROLES, HIGH_CONTRAST_THEMES } from '../../utils/accessibility';

interface EmergencyAccessibilityToolbarProps {
  className?: string;
  position?: 'top' | 'bottom' | 'floating';
  showInEmergencyOnly?: boolean;
}

const EmergencyAccessibilityToolbar: React.FC<EmergencyAccessibilityToolbarProps> = ({
  className = '',
  position = 'top',
  showInEmergencyOnly = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  
  const { 
    isHighContrast, 
    isReducedMotion, 
    isScreenReaderActive, 
    announce,
    toggleHighContrast,
    enableSOCMode 
  } = useAccessibility();
  
  const {
    emergencyMode,
    enableEmergencyMode,
    disableEmergencyMode,
    quickActions
  } = useEmergencyAccessibility();

  const {
    currentTheme,
    switchTheme,
    availableThemes
  } = useThemeAccessibility();

  // Keyboard navigation for the toolbar
  useKeyboardNavigation({
    onEscape: () => setIsExpanded(false),
    enabled: isExpanded
  });

  // Don't render if emergency only and not in emergency mode
  if (showInEmergencyOnly && !emergencyMode) {
    return null;
  }

  const positionClasses = {
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0',
    floating: 'top-4 right-4'
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    announce(isExpanded ? 'Accessibility toolbar collapsed' : 'Accessibility toolbar expanded');
  };

  return (
    <div 
      className={`
        fixed z-50 ${positionClasses[position]} 
        ${emergencyMode ? 'bg-red-900 border-red-500' : 'bg-gray-900 border-gray-700'}
        border-b-2 shadow-lg transition-all duration-300
        ${className}
      `}
      role={ARIA_ROLES.EMERGENCY_ACTIONS}
      aria-label="Emergency accessibility toolbar"
    >
      {/* Collapsed state - always visible */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          {emergencyMode && (
            <span className="flex items-center gap-1 text-red-400 animate-pulse">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-sm font-medium">EMERGENCY MODE</span>
            </span>
          )}
          
          {/* Quick status indicators */}
          <div className="flex items-center gap-1 text-xs text-gray-300">
            {isHighContrast && <span title="High Contrast Active">🔆</span>}
            {isReducedMotion && <span title="Reduced Motion Active">⏸️</span>}
            {isScreenReaderActive && <span title="Screen Reader Detected">🔊</span>}
          </div>
        </div>

        {/* Quick emergency actions */}
        <div className="flex items-center gap-2">
          {emergencyMode && (
            <>
              <AccessibleButton
                variant="emergency"
                size="sm"
                onClick={quickActions.refreshData}
                shortcut="Ctrl+Shift+R"
                ariaLabel="Refresh critical threat data"
                description="Immediately refresh all critical threat intelligence data"
              >
                📊 Refresh
              </AccessibleButton>
              
              <AccessibleButton
                variant="emergency"
                size="sm"
                onClick={quickActions.escalateIncident}
                shortcut="Ctrl+Shift+I"
                ariaLabel="Escalate current incident"
                description="Escalate the current incident to the next level of response"
                emergencyAction
              >
                🚨 Escalate
              </AccessibleButton>
            </>
          )}

          {/* Expand/collapse button */}
          <AccessibleButton
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            ariaLabel={isExpanded ? 'Collapse accessibility toolbar' : 'Expand accessibility toolbar'}
            className="text-white hover:text-gray-200"
          >
            {isExpanded ? '▲' : '▼'}
          </AccessibleButton>
        </div>
      </div>

      {/* Expanded state */}
      {isExpanded && (
        <div className="border-t border-gray-700 bg-gray-800 px-4 py-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Emergency Controls */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-200">Emergency Controls</h3>
              <div className="flex flex-wrap gap-2">
                <AccessibleButton
                  variant={emergencyMode ? "danger" : "primary"}
                  size="sm"
                  onClick={emergencyMode ? disableEmergencyMode : enableEmergencyMode}
                  shortcut="Ctrl+Shift+E"
                  emergencyAction={!emergencyMode}
                  description={`${emergencyMode ? 'Disable' : 'Enable'} emergency mode for critical incident response`}
                >
                  {emergencyMode ? '🔴 Exit Emergency' : '🚨 Emergency Mode'}
                </AccessibleButton>
                
                {emergencyMode && (
                  <AccessibleButton
                    variant="emergency"
                    size="sm"
                    onClick={quickActions.activateDefenses}
                    description="Activate automated defensive measures"
                    emergencyAction
                  >
                    🛡️ Activate Defenses
                  </AccessibleButton>
                )}
              </div>
            </div>

            {/* Accessibility Features */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-200">Accessibility</h3>
              <div className="flex flex-wrap gap-2">
                <AccessibleButton
                  variant={isHighContrast ? "danger" : "secondary"}
                  size="sm"
                  onClick={toggleHighContrast}
                  shortcut="Ctrl+Shift+H"
                  description="Toggle high contrast mode for better visibility"
                >
                  {isHighContrast ? '🔆 Disable HC' : '🔆 High Contrast'}
                </AccessibleButton>
                
                <AccessibleButton
                  variant="secondary"
                  size="sm"
                  onClick={enableSOCMode}
                  description="Enable SOC-optimized display settings"
                >
                  🖥️ SOC Mode
                </AccessibleButton>
                
                <AccessibleButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  description="Show theme selection options"
                >
                  🎨 Themes
                </AccessibleButton>
              </div>

              {/* Theme Selector */}
              {showThemeSelector && isHighContrast && (
                <div className="mt-2 p-2 bg-gray-700 rounded border">
                  <div className="text-xs text-gray-300 mb-2">High Contrast Themes:</div>
                  <div className="flex flex-wrap gap-1">
                    {availableThemes.map((theme) => (
                      <button
                        key={theme}
                        onClick={() => switchTheme(theme)}
                        className={`
                          px-2 py-1 text-xs rounded border
                          ${currentTheme === theme 
                            ? 'bg-blue-600 text-white border-blue-400' 
                            : 'bg-gray-600 text-gray-200 border-gray-500 hover:bg-gray-500'
                          }
                        `}
                        aria-pressed={currentTheme === theme}
                      >
                        {HIGH_CONTRAST_THEMES[theme].name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Aids */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-200">Navigation</h3>
              <div className="flex flex-wrap gap-2">
                <AccessibleButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const mainContent = document.querySelector('[role="main"], main');
                    if (mainContent instanceof HTMLElement) {
                      mainContent.focus();
                      mainContent.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  shortcut="Alt+M"
                  description="Skip to main content area"
                >
                  ⏭️ Skip to Main
                </AccessibleButton>
                
                <AccessibleButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    announce('Keyboard shortcuts: Emergency mode Ctrl+Shift+E, High contrast Ctrl+Shift+H, Refresh data Ctrl+Shift+R, Skip to main Alt+M, Help F1', 'assertive');
                  }}
                  shortcut="F1"
                  description="Announce keyboard shortcuts"
                >
                  ❓ Help
                </AccessibleButton>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
            <div className="flex justify-between items-center">
              <span>
                Status: {emergencyMode ? 'Emergency Mode Active' : 'Normal Operations'} | 
                Theme: {isHighContrast ? HIGH_CONTRAST_THEMES[currentTheme].name : 'Standard'} |
                Motion: {isReducedMotion ? 'Reduced' : 'Standard'}
              </span>
              <span>
                Press Escape to close this toolbar
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Screen reader instructions */}
      <div className="sr-only">
        Emergency accessibility toolbar. 
        {emergencyMode && 'Emergency mode is currently active. '}
        Use Tab to navigate through controls. 
        Press Escape to close expanded toolbar.
        Press F1 for help and keyboard shortcuts.
      </div>
    </div>
  );
};

export default EmergencyAccessibilityToolbar;