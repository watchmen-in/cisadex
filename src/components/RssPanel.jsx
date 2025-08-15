import { useEffect, useState } from "react";
import { fetchFeeds } from "../utils/rssFetcher";

// Cybersecurity-themed icons for different feed types
const FeedIcon = ({ feedTitle }) => {
  if (feedTitle?.toLowerCase().includes('cisa')) {
    return <span className="text-amber-500">🛡️</span>;
  }
  if (feedTitle?.toLowerCase().includes('fbi')) {
    return <span className="text-blue-500">🕵️</span>;
  }
  if (feedTitle?.toLowerCase().includes('cert')) {
    return <span className="text-red-500">⚠️</span>;
  }
  return <span className="text-green-500">📡</span>;
};

// Enhanced loading skeleton
function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-8 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <div className="h-6 bg-bg2 rounded w-1/3"></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((j) => (
              <div key={j} className="bg-bg2 border border-b1 rounded-lg p-4">
                <div className="h-4 bg-bg1 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-bg1 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FeedSection({ feed }) {
  const items = Array.isArray(feed?.items) ? feed.items : [];
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? items : items.slice(0, 6);
  
  // Format date to be more readable
  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="space-y-4 fade-enter">
      <div className="flex items-center gap-2">
        <FeedIcon feedTitle={feed?.title} />
        <h2 className="text-lg font-semibold text-t1">{feed?.title || "Feed"}</h2>
        <span className="px-2 py-1 text-xs bg-brand/20 text-brand rounded-full">
          {items.length} items
        </span>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((it, i) => (
          <a
            key={(it?.link || it?.title || i) + i}
            href={it?.link || "#"}
            target="_blank"
            rel="noreferrer"
            className="group focus-ring block bg-bg2 border border-b1 rounded-lg p-4 shadow-e1 hover:shadow-e2 hover:border-brand/50 transition-all duration-200 card-hover"
          >
            <h3 className="font-medium text-t1 group-hover:text-brand transition-colors duration-200 line-clamp-2">
              {it?.title || "Untitled"}
            </h3>
            {it?.contentSnippet && (
              <p className="text-sm text-t2 mt-2 line-clamp-2">
                {it.contentSnippet}
              </p>
            )}
            {it?.pubDate && (
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-t2">
                  {formatDate(it.pubDate)}
                </p>
                <span className="text-xs text-brand opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Read more →
                </span>
              </div>
            )}
          </a>
        ))}
      </div>
      
      {items.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="px-4 py-2 text-sm text-brand hover:text-t1 hover:bg-brand/10 border border-brand/30 rounded-lg transition-all duration-200 focus-ring"
        >
          {showAll ? `Show less (${items.length - 6} hidden)` : `Show ${items.length - 6} more`}
        </button>
      )}
    </section>
  );
}

export default function RssPanel() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refreshFeeds = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFeeds();
      setFeeds(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load feeds');
      console.error('RSS fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFeeds();
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-err/10 border border-err/20 rounded-lg p-4 text-center">
          <span className="text-4xl mb-2 block">⚠️</span>
          <h3 className="text-err font-medium mb-2">Unable to Load Feeds</h3>
          <p className="text-t2 text-sm mb-4">{error}</p>
          <button
            onClick={refreshFeeds}
            className="px-4 py-2 bg-err text-white rounded-lg hover:bg-err/80 transition-colors focus-ring"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8">
      {/* Header with refresh functionality */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-t1">Cybersecurity News & Alerts</h1>
          {lastUpdated && (
            <p className="text-sm text-t2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={refreshFeeds}
          disabled={loading}
          className="px-3 py-2 text-sm bg-brand/10 text-brand hover:bg-brand/20 border border-brand/30 rounded-lg transition-colors focus-ring disabled:opacity-50"
        >
          🔄 Refresh
        </button>
      </div>

      {feeds.map((feed, idx) => (
        <FeedSection key={feed?.title || idx} feed={feed} />
      ))}
      
      {feeds.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">📡</span>
          <h3 className="text-t2 font-medium mb-2">No feeds available</h3>
          <p className="text-t2 text-sm">Check your connection and try refreshing.</p>
        </div>
      )}
    </div>
  );
}
