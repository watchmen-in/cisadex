import React, { useState, useEffect, useRef } from 'react';
import { topicDetectionService } from '../../services/topicDetectionService';

interface FeedSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const FeedSearch: React.FC<FeedSearchProps> = ({
  value,
  onChange,
  placeholder = "Search feeds...",
  className = ""
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Common cybersecurity search terms
  const commonTerms = [
    'ransomware', 'malware', 'vulnerability', 'exploit', 'phishing',
    'apt', 'zero-day', 'data breach', 'supply chain', 'iot security',
    'cloud security', 'mobile security', 'critical infrastructure',
    'threat intelligence', 'incident response', 'forensics'
  ];

  // CVE pattern
  const cvePattern = /CVE-\d{4}-\d+/gi;

  // Generate search suggestions based on input
  const generateSuggestions = (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const newSuggestions: string[] = [];

    // Check if query looks like a CVE
    if (query.match(/^cve-?\d*/i)) {
      newSuggestions.push('CVE-2024-', 'CVE-2023-', 'CVE-2022-');
    }

    // Add matching common terms
    const matchingTerms = commonTerms.filter(term => 
      term.toLowerCase().includes(lowerQuery)
    );
    newSuggestions.push(...matchingTerms);

    // Add topic suggestions
    const matchingTopics = topicDetectionService.searchTopics(query);
    newSuggestions.push(...matchingTopics.slice(0, 3).map(topic => topic.name));

    // Add organization/vendor suggestions
    if (lowerQuery.includes('micro')) newSuggestions.push('Microsoft', 'Microsoft Security');
    if (lowerQuery.includes('google')) newSuggestions.push('Google', 'Google Project Zero');
    if (lowerQuery.includes('aws')) newSuggestions.push('AWS Security', 'Amazon Security');
    if (lowerQuery.includes('cisco')) newSuggestions.push('Cisco', 'Cisco Talos');
    if (lowerQuery.includes('cisa')) newSuggestions.push('CISA Alerts', 'CISA KEV');

    // Remove duplicates and limit to 8 suggestions
    setSuggestions([...new Set(newSuggestions)].slice(0, 8));
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    generateSuggestions(newValue);
    setShowSuggestions(true);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
    
    if (e.key === 'Enter' && suggestions.length > 0 && showSuggestions) {
      e.preventDefault();
      handleSuggestionClick(suggestions[0]);
    }
  };

  // Handle focus/blur
  const handleFocus = () => {
    setIsFocused(true);
    if (value.trim() && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 150);
  };

  // Clear search
  const clearSearch = () => {
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Highlight CVE patterns in suggestions
  const highlightCVE = (text: string) => {
    const parts = text.split(cvePattern);
    const matches = text.match(cvePattern) || [];
    
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {matches[index] && (
          <span className="font-mono text-err bg-err/10 px-1 rounded">
            {matches[index]}
          </span>
        )}
      </React.Fragment>
    ));
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-t2 text-lg">🔍</span>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3 bg-bg2 border rounded-lg text-t1 placeholder-t2 transition-all duration-200 focus:outline-none ${
            isFocused || value
              ? 'border-brand shadow-lg'
              : 'border-b1 hover:border-brand/50'
          }`}
        />
        
        {value && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-t2 hover:text-t1 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-bg1 border border-b1 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          <div className="p-2">
            <div className="text-xs text-t2 mb-2 px-2">Search suggestions</div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-bg2 rounded transition-colors text-sm text-t1 flex items-center gap-2"
              >
                <span className="text-t2">🔍</span>
                <span>{highlightCVE(suggestion)}</span>
              </button>
            ))}
          </div>
          
          {/* Search tips */}
          <div className="border-t border-b1 p-3 bg-bg2/50">
            <div className="text-xs text-t2 space-y-1">
              <div><strong>Tips:</strong></div>
              <div>• Search for CVEs: "CVE-2024-1234"</div>
              <div>• Search by threat type: "ransomware", "phishing"</div>
              <div>• Search by source: "CISA", "Microsoft"</div>
              <div>• Use keywords: "critical", "zero-day", "apt"</div>
            </div>
          </div>
        </div>
      )}

      {/* Search shortcuts indicator */}
      {!isFocused && !value && (
        <div className="absolute top-full left-0 mt-1 text-xs text-t2">
          Press / to focus search
        </div>
      )}
    </div>
  );
};

// Add global keyboard shortcut for search focus
export const useSearchShortcut = (searchRef: React.RefObject<HTMLInputElement>) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          searchRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchRef]);
};

export default FeedSearch;