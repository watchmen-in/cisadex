import React, { useState } from 'react';
import { ClusteredFeedItem, FeedCluster } from '../../services/topicDetectionService';

interface FeedCardProps {
  item: ClusteredFeedItem;
  viewMode: 'grouped' | 'timeline' | 'grid';
  showTopicTags?: boolean;
  cluster?: FeedCluster;
  onClick?: (item: ClusteredFeedItem) => void;
}

const FeedCard: React.FC<FeedCardProps> = ({ 
  item, 
  viewMode, 
  showTopicTags = true, 
  cluster,
  onClick 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format relative time
  const getRelativeTime = (date: Date | string) => {
    const now = new Date();
    const itemDate = new Date(date);
    const diffMs = now.getTime() - itemDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return itemDate.toLocaleDateString();
    }
  };

  // Get severity styling
  const getSeverityStyle = (severity?: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/10 border-red-500/20 text-red-500';
      case 'HIGH':
        return 'bg-orange-500/10 border-orange-500/20 text-orange-500';
      case 'MEDIUM':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500';
      case 'LOW':
        return 'bg-green-500/10 border-green-500/20 text-green-500';
      default:
        return 'bg-gray-500/10 border-gray-500/20 text-gray-500';
    }
  };

  // Get source icon
  const getSourceIcon = (source: string) => {
    const sourceLower = source.toLowerCase();
    if (sourceLower.includes('cisa')) return '🛡️';
    if (sourceLower.includes('fbi')) return '🕵️';
    if (sourceLower.includes('nist')) return '📊';
    if (sourceLower.includes('cert')) return '⚠️';
    if (sourceLower.includes('microsoft')) return '🪟';
    if (sourceLower.includes('google')) return '🔍';
    if (sourceLower.includes('aws')) return '☁️';
    if (sourceLower.includes('github')) return '💻';
    if (sourceLower.includes('malware')) return '🦠';
    if (sourceLower.includes('phish')) return '🎣';
    return '📡';
  };

  // Truncate text with option to expand
  const getTruncatedText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    
    if (isExpanded) {
      return text;
    } else {
      return text.substring(0, maxLength) + '...';
    }
  };

  // Get card layout based on view mode
  const getCardClasses = () => {
    const baseClasses = "bg-bg2 border border-b1 rounded-lg p-4 hover:shadow-lg hover:border-brand/50 transition-all duration-200 cursor-pointer";
    
    switch (viewMode) {
      case 'timeline':
        return `${baseClasses} flex items-start gap-4`;
      case 'grid':
        return `${baseClasses} h-full flex flex-col`;
      case 'grouped':
      default:
        return baseClasses;
    }
  };

  // Handle card click
  const handleClick = () => {
    if (onClick) {
      onClick(item);
    } else {
      window.open(item.link, '_blank', 'noopener,noreferrer');
    }
  };

  // Timeline layout
  if (viewMode === 'timeline') {
    return (
      <div className={getCardClasses()} onClick={handleClick}>
        {/* Timeline indicator */}
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 bg-brand rounded-full"></div>
          <div className="w-0.5 h-8 bg-brand/20"></div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-t1 line-clamp-2 mb-1">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-sm text-t2 line-clamp-2 mb-2">
                  {getTruncatedText(item.description, 120)}
                </p>
              )}
              
              <div className="flex items-center gap-3 text-xs text-t2">
                <span className="flex items-center gap-1">
                  {getSourceIcon(item.source)} {item.source}
                </span>
                <span>{getRelativeTime(item.date)}</span>
                {item.cve && (
                  <span className="text-err font-mono">{item.cve}</span>
                )}
              </div>
            </div>

            {item.severity && (
              <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityStyle(item.severity)}`}>
                {item.severity}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Standard card layout (grouped/grid)
  return (
    <div className={getCardClasses()} onClick={handleClick}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className="font-medium text-t1 line-clamp-2 flex-1">
          {item.title}
        </h4>
        {item.severity && (
          <span className={`px-2 py-1 text-xs font-medium rounded border flex-shrink-0 ${getSeverityStyle(item.severity)}`}>
            {item.severity}
          </span>
        )}
      </div>

      {/* Description */}
      {item.description && (
        <div className="mb-3">
          <p className="text-sm text-t2 leading-relaxed">
            {getTruncatedText(item.description, viewMode === 'grid' ? 150 : 200)}
          </p>
          {item.description.length > (viewMode === 'grid' ? 150 : 200) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="mt-1 text-xs text-brand hover:text-brand/80 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {/* Tags and CVE */}
      {(item.cve || (showTopicTags && item.topics.length > 0)) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {item.cve && (
            <span className="px-2 py-1 bg-err/10 text-err text-xs font-mono rounded border border-err/20">
              {item.cve}
            </span>
          )}
          {showTopicTags && item.topics.slice(0, 2).map(topicId => {
            const topic = cluster ? cluster.topic : null;
            return topic && topic.id === topicId ? (
              <span key={topicId} className="px-2 py-1 bg-brand/10 text-brand text-xs rounded border border-brand/20">
                {topic.name}
              </span>
            ) : null;
          })}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-t2 mt-auto">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            {getSourceIcon(item.source)} {item.source}
          </span>
          {cluster && item.topicScores[cluster.topicId] && (
            <span className="text-brand">
              {Math.round(item.topicScores[cluster.topicId])}% relevant
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {getRelativeTime(item.date)}
          <span className="text-brand/50">→</span>
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-brand text-xs">🔗</span>
      </div>
    </div>
  );
};

export default FeedCard;