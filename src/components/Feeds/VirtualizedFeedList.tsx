import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { ClusteredFeedItem, FeedCluster } from '../../services/topicDetectionService';
import FeedCard from './FeedCard';

interface VirtualizedFeedListProps {
  items: ClusteredFeedItem[];
  clusters?: FeedCluster[];
  viewMode: 'grouped' | 'timeline' | 'grid';
  height: number;
  width?: number;
  onItemClick?: (item: ClusteredFeedItem) => void;
  className?: string;
}

interface ListItem {
  type: 'item' | 'header' | 'separator';
  data: ClusteredFeedItem | FeedCluster | null;
  index: number;
  clusterId?: string;
}

const VirtualizedFeedList: React.FC<VirtualizedFeedListProps> = ({
  items,
  clusters,
  viewMode,
  height,
  width,
  onItemClick,
  className = ""
}) => {
  const listRef = useRef<List>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calculate item height based on view mode
  const getItemHeight = useCallback(() => {
    switch (viewMode) {
      case 'timeline':
        return 100; // Compact timeline items
      case 'grid':
        return 200; // Taller for more content
      case 'grouped':
      default:
        return 150; // Standard height
    }
  }, [viewMode]);

  // Prepare list data structure
  const listData = useMemo(() => {
    const data: ListItem[] = [];
    
    if (clusters && clusters.length > 0) {
      // Grouped view with clusters
      clusters.forEach((cluster, clusterIndex) => {
        // Add cluster header
        data.push({
          type: 'header',
          data: cluster,
          index: data.length,
          clusterId: cluster.topicId
        });

        // Add cluster items
        cluster.items.forEach((item, itemIndex) => {
          data.push({
            type: 'item',
            data: item,
            index: data.length,
            clusterId: cluster.topicId
          });
        });

        // Add separator between clusters (except for last)
        if (clusterIndex < clusters.length - 1) {
          data.push({
            type: 'separator',
            data: null,
            index: data.length
          });
        }
      });
    } else {
      // Flat list of items
      items.forEach((item, itemIndex) => {
        data.push({
          type: 'item',
          data: item,
          index: data.length
        });
      });
    }

    return data;
  }, [items, clusters]);

  // Item renderer for react-window
  const ItemRenderer = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const listItem = listData[index];
    if (!listItem) return null;

    const isHovered = hoveredIndex === index;

    const handleMouseEnter = () => setHoveredIndex(index);
    const handleMouseLeave = () => setHoveredIndex(null);

    switch (listItem.type) {
      case 'header':
        const headerCluster = listItem.data as FeedCluster;
        return (
          <div 
            style={style} 
            className="px-4 py-3 bg-bg1 border-b border-b1 sticky top-0 z-10"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{headerCluster.topic.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-t1">{headerCluster.topic.name}</h3>
                  <p className="text-sm text-t2">{headerCluster.totalItems} items</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityStyle(headerCluster.avgSeverity)}`}>
                  {headerCluster.avgSeverity}
                </span>
                <span className="text-xs text-t2">
                  {headerCluster.sources.length} sources
                </span>
              </div>
            </div>
          </div>
        );

      case 'separator':
        return (
          <div 
            style={style} 
            className="border-b border-b1"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        );

      case 'item':
        const item = listItem.data as ClusteredFeedItem;
        const cluster = clusters?.find(c => c.topicId === listItem.clusterId);
        
        return (
          <div 
            style={{
              ...style,
              padding: viewMode === 'timeline' ? '8px 16px' : '12px 16px'
            }}
            className={`transition-colors duration-200 ${isHovered ? 'bg-bg1' : 'bg-bg0'}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <FeedCard
              item={item}
              viewMode={viewMode}
              showTopicTags={!cluster}
              cluster={cluster}
              onClick={onItemClick}
            />
          </div>
        );

      default:
        return null;
    }
  }, [listData, hoveredIndex, viewMode, clusters, onItemClick]);

  // Scroll to top when data changes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(0);
    }
  }, [items, clusters]);

  // Get severity styling
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'LOW': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!listRef.current) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (hoveredIndex !== null && hoveredIndex < listData.length - 1) {
          setHoveredIndex(hoveredIndex + 1);
          listRef.current.scrollToItem(hoveredIndex + 1);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (hoveredIndex !== null && hoveredIndex > 0) {
          setHoveredIndex(hoveredIndex - 1);
          listRef.current.scrollToItem(hoveredIndex - 1);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (hoveredIndex !== null) {
          const listItem = listData[hoveredIndex];
          if (listItem?.type === 'item' && onItemClick) {
            onItemClick(listItem.data as ClusteredFeedItem);
          }
        }
        break;
      case 'Home':
        e.preventDefault();
        setHoveredIndex(0);
        listRef.current.scrollToItem(0);
        break;
      case 'End':
        e.preventDefault();
        setHoveredIndex(listData.length - 1);
        listRef.current.scrollToItem(listData.length - 1);
        break;
    }
  }, [hoveredIndex, listData, onItemClick]);

  if (listData.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-t1 mb-2">No items to display</h3>
          <p className="text-t2">No cybersecurity feeds match your current filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${className} focus:outline-none`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <List
        ref={listRef}
        height={height}
        width={width || '100%'}
        itemCount={listData.length}
        itemSize={getItemHeight()}
        itemData={listData}
        overscanCount={5} // Render 5 extra items outside viewport for smooth scrolling
      >
        {ItemRenderer}
      </List>
    </div>
  );
};

// Performance optimization hook for large datasets
export const useVirtualizedPerformance = (itemCount: number) => {
  const [isLargeDataset, setIsLargeDataset] = useState(false);
  const [shouldVirtualize, setShouldVirtualize] = useState(false);

  useEffect(() => {
    const isLarge = itemCount > 100;
    const shouldUseVirtualization = itemCount > 50;
    
    setIsLargeDataset(isLarge);
    setShouldVirtualize(shouldUseVirtualization);
  }, [itemCount]);

  return {
    isLargeDataset,
    shouldVirtualize,
    recommendedHeight: isLargeDataset ? 600 : 400,
    overscanCount: isLargeDataset ? 10 : 5
  };
};

// Memoized wrapper for performance
export const MemoizedVirtualizedFeedList = React.memo(VirtualizedFeedList, (prevProps, nextProps) => {
  // Custom comparison for better memoization
  return (
    prevProps.items.length === nextProps.items.length &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.height === nextProps.height &&
    prevProps.width === nextProps.width &&
    JSON.stringify(prevProps.clusters?.map(c => c.topicId)) === JSON.stringify(nextProps.clusters?.map(c => c.topicId))
  );
});

export default VirtualizedFeedList;