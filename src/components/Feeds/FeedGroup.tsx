import React, { useState, useMemo } from 'react';
import { FeedCluster } from '../../services/topicDetectionService';
import FeedCard from './FeedCard';

interface FeedGroupProps {
  cluster: FeedCluster;
  viewMode: 'grouped' | 'timeline' | 'grid';
  onTopicClick?: (topicId: string) => void;
}

const FeedGroup: React.FC<FeedGroupProps> = ({ cluster, viewMode, onTopicClick }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAllItems, setShowAllItems] = useState(false);

  // Determine how many items to show initially
  const initialDisplayCount = viewMode === 'grid' ? 6 : 4;
  const displayedItems = showAllItems ? cluster.items : cluster.items.slice(0, initialDisplayCount);
  const hasMoreItems = cluster.items.length > initialDisplayCount;

  // Get severity color scheme
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'LOW': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  // Get trend indicator
  const getTrendIndicator = () => {
    if (!cluster.trends.changePercent) return null;
    
    const isIncreasing = cluster.trends.increasing;
    const color = isIncreasing ? 'text-red-500' : 'text-green-500';
    const arrow = isIncreasing ? '↗' : '↘';
    
    return (
      <span className={`text-xs ${color} font-medium`}>
        {arrow} {cluster.trends.changePercent}%
      </span>
    );
  };

  // Calculate time distribution for timeline view
  const timeDistribution = useMemo(() => {
    if (viewMode !== 'timeline') return null;

    const now = new Date();
    const last24h = cluster.items.filter(item => 
      (now.getTime() - new Date(item.date).getTime()) <= 24 * 60 * 60 * 1000
    ).length;
    const lastWeek = cluster.items.filter(item => 
      (now.getTime() - new Date(item.date).getTime()) <= 7 * 24 * 60 * 60 * 1000
    ).length;

    return { last24h, lastWeek };
  }, [cluster.items, viewMode]);

  // Get grid layout classes based on view mode
  const getGridClasses = () => {
    switch (viewMode) {
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
      case 'timeline':
        return 'space-y-3';
      case 'grouped':
      default:
        return 'grid grid-cols-1 lg:grid-cols-2 gap-4';
    }
  };

  return (
    <div className="bg-bg1 border border-b1 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-b1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 hover:bg-bg2 rounded-lg p-1 transition-colors"
            >
              <span className="text-2xl">{cluster.topic.icon}</span>
              <div>
                <h3 className="text-lg font-semibold text-t1 text-left">
                  {cluster.topic.name}
                </h3>
                <p className="text-sm text-t2 text-left max-w-md">
                  {cluster.topic.description}
                </p>
              </div>
              <span className={`ml-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                ▶
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Timeline distribution */}
            {viewMode === 'timeline' && timeDistribution && (
              <div className="text-xs text-t2">
                <span className="mr-3">24h: {timeDistribution.last24h}</span>
                <span>7d: {timeDistribution.lastWeek}</span>
              </div>
            )}

            {/* Trend indicator */}
            {getTrendIndicator()}

            {/* Severity indicator */}
            <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(cluster.avgSeverity)}`}>
              {cluster.avgSeverity}
            </span>

            {/* Item count */}
            <span className="px-3 py-1 bg-brand/10 text-brand text-sm font-medium rounded-full">
              {cluster.totalItems} items
            </span>

            {/* Sources count */}
            <span className="px-2 py-1 bg-bg2 text-t2 text-xs rounded">
              {cluster.sources.length} sources
            </span>

            {/* Topic filter button */}
            {onTopicClick && (
              <button
                onClick={() => onTopicClick(cluster.topicId)}
                className="p-1 hover:bg-bg2 rounded text-xs text-t2 hover:text-t1 transition-colors"
                title="Filter by this topic"
              >
                🔍
              </button>
            )}
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="mt-3 flex items-center gap-4 text-xs text-t2">
          <span>Latest: {cluster.latestUpdate.toLocaleDateString()}</span>
          <span>•</span>
          <span>Sources: {cluster.sources.slice(0, 3).join(', ')}{cluster.sources.length > 3 ? '...' : ''}</span>
          {cluster.items.some(item => item.cve) && (
            <>
              <span>•</span>
              <span className="text-err">
                CVEs: {cluster.items.filter(item => item.cve).length}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Items Grid */}
          <div className={getGridClasses()}>
            {displayedItems.map((item, index) => (
              <FeedCard
                key={`${item.id}-${index}`}
                item={item}
                viewMode={viewMode}
                showTopicTags={false} // Don't show topic tags since we're already grouped
                cluster={cluster}
              />
            ))}
          </div>

          {/* Load More / Show Less */}
          {hasMoreItems && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAllItems(!showAllItems)}
                className="px-4 py-2 text-sm text-brand hover:text-t1 hover:bg-brand/10 border border-brand/30 rounded-lg transition-all duration-200"
              >
                {showAllItems ? (
                  <>
                    Show Less ({cluster.items.length - initialDisplayCount} hidden)
                  </>
                ) : (
                  <>
                    Show {cluster.items.length - initialDisplayCount} More Items
                  </>
                )}
              </button>
            </div>
          )}

          {/* Timeline view specific footer */}
          {viewMode === 'timeline' && timeDistribution && (
            <div className="mt-4 pt-3 border-t border-b1">
              <div className="flex items-center justify-between text-xs text-t2">
                <div>
                  Activity: {timeDistribution.last24h} items in last 24h, {timeDistribution.lastWeek} in last week
                </div>
                <div className="flex items-center gap-2">
                  {cluster.trends.increasing ? (
                    <span className="text-red-500">📈 Increasing activity</span>
                  ) : (
                    <span className="text-green-500">📉 Decreasing activity</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Grid view specific footer */}
          {viewMode === 'grid' && (
            <div className="mt-4 pt-3 border-t border-b1 flex items-center justify-between text-xs text-t2">
              <div>
                Topic relevance: {Math.round(cluster.items.reduce((sum, item) => 
                  sum + (item.topicScores[cluster.topicId] || 0), 0) / cluster.items.length)}% avg
              </div>
              <div>
                Severity distribution: {
                  ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => {
                    const count = cluster.items.filter(item => item.severity === sev).length;
                    return count > 0 ? `${sev}: ${count}` : null;
                  }).filter(Boolean).join(', ')
                }
              </div>
            </div>
          )}

          {/* Empty state */}
          {cluster.items.length === 0 && (
            <div className="text-center py-8 text-t2">
              <div className="text-3xl mb-2">{cluster.topic.icon}</div>
              <p>No items found for this topic</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedGroup;