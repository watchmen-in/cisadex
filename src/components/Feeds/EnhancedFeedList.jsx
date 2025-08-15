import { useEffect, useState } from "react";
import { feedManager } from "../../services/feedManager";

export default function EnhancedFeedList({ category = "all", filters = {} }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    const loadFeeds = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let feedData = [];
        
        if (category === "all" || category === "priority") {
          feedData = await feedManager.fetchPriorityFeeds();
        } else if (category === "government") {
          feedData = await feedManager.fetchAllByCategory("government");
        } else if (category === "news") {
          feedData = await feedManager.fetchAllByCategory("news");
        } else if (category === "threat_intel") {
          feedData = await feedManager.fetchAllByCategory("threat_intel");
        } else if (category === "vendor") {
          feedData = await feedManager.fetchAllByCategory("vendor");
        } else {
          // Fetch all categories
          const [gov, news, intel] = await Promise.all([
            feedManager.fetchAllByCategory("government"),
            feedManager.fetchAllByCategory("news"),
            feedManager.fetchAllByCategory("threat_intel")
          ]);
          feedData = [...gov, ...news, ...intel].sort((a, b) => b.date - a.date);
        }
        
        // Apply filters
        if (filters.exploited) {
          feedData = feedData.filter(item => item.exploited);
        }
        if (filters.has_cve) {
          feedData = feedData.filter(item => item.cve);
        }
        if (filters.severity) {
          feedData = feedData.filter(item => item.severity === filters.severity);
        }
        
        setItems(feedData.slice(0, 50));
        
        // Get health status
        const status = feedManager.getHealthStatus();
        setHealthStatus(status);
        
      } catch (err) {
        console.error("Error loading feeds:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadFeeds();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadFeeds, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [category, filters]);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} minutes ago`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} hours ago`;
    } else if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)} days ago`;
    }
    return d.toLocaleDateString();
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600/20 border-red-600/40 text-red-400';
      case 'HIGH': return 'bg-orange-600/20 border-orange-600/40 text-orange-400';
      case 'MEDIUM': return 'bg-yellow-600/20 border-yellow-600/40 text-yellow-400';
      case 'LOW': return 'bg-blue-600/20 border-blue-600/40 text-blue-400';
      default: return 'bg-gray-600/20 border-gray-600/40 text-gray-400';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'government': return '🏛️';
      case 'news': return '📰';
      case 'threat_intel': return '🔍';
      case 'vendor': return '🏢';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="border border-b1 rounded-lg p-4">
              <div className="h-4 bg-bg2 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-bg2 rounded w-full mb-2"></div>
              <div className="h-3 bg-bg2 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-err/10 border border-err/30 rounded-lg p-4 text-err">
          <p className="font-semibold">Error loading feeds</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-3 py-1 bg-err/20 hover:bg-err/30 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-b1">
      {healthStatus && (
        <div className="px-4 py-2 bg-bg2/30 text-xs text-t2">
          <span>Feed Status: </span>
          <span className="text-green-400">{healthStatus.successful} active</span>
          {healthStatus.failed > 0 && (
            <span className="text-red-400 ml-2">{healthStatus.failed} failed</span>
          )}
          <span className="ml-2">• Last update: {formatDate(new Date())}</span>
        </div>
      )}
      
      {items.length === 0 ? (
        <div className="p-6 text-center text-t2">
          <p className="text-lg mb-2">No feed items available</p>
          <p className="text-sm">Feeds are being loaded. Please check back in a moment.</p>
        </div>
      ) : (
        items.map(item => (
          <article key={item.id} className="p-4 hover:bg-bg2/40 transition-colors">
            <div className="flex items-center gap-2 text-xs text-t2 mb-2">
              <span className="text-base">{getCategoryIcon(item.category)}</span>
              <span className="font-semibold uppercase tracking-wide">{item.source}</span>
              <span>•</span>
              <span>{formatDate(item.date)}</span>
            </div>
            
            <a 
              href={item.link} 
              target="_blank" 
              rel="noreferrer" 
              className="block text-t1 font-medium hover:text-brand transition-colors"
            >
              {item.title}
            </a>
            
            <div className="mt-1 text-sm text-t2 line-clamp-2">
              {item.description}
            </div>
            
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {item.cve && (
                <span className="px-2 py-0.5 rounded-full bg-bg2 border border-b1">
                  {item.cve}
                </span>
              )}
              {item.exploited && (
                <span className="px-2 py-0.5 rounded-full bg-err/20 border border-err/40 text-err">
                  🔥 Actively Exploited
                </span>
              )}
              {item.severity && (
                <span className={`px-2 py-0.5 rounded-full border ${getSeverityColor(item.severity)}`}>
                  {item.severity}
                </span>
              )}
              {item.dueDate && (
                <span className="px-2 py-0.5 rounded-full bg-warn/20 border border-warn/40 text-warn">
                  Due: {new Date(item.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </article>
        ))
      )}
    </div>
  );
}