import React, { useState, useEffect } from 'react';
import { feedManager } from '../services/feedManager';

export default function FeedHealthDashboard() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [feedDetails, setFeedDetails] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    refreshHealthStatus();
    const interval = setInterval(refreshHealthStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const refreshHealthStatus = async () => {
    setIsRefreshing(true);
    try {
      const status = feedManager.getHealthStatus();
      setHealthStatus(status);
      
      // Get detailed feed information
      const details = await Promise.allSettled(
        feedManager.feeds.slice(0, 10).map(async (feed) => {
          const lastUpdate = status.lastUpdates[feed.name];
          const isFailed = status.failedFeeds.includes(feed.name);
          const timeSinceUpdate = lastUpdate ? Date.now() - lastUpdate : null;
          
          return {
            id: feed.id || feed.name,
            name: feed.name,
            category: feed.category,
            priority: feed.priority,
            url: feed.url,
            status: isFailed ? 'failed' : timeSinceUpdate > 7200000 ? 'stale' : 'healthy',
            lastUpdate: lastUpdate ? new Date(lastUpdate).toLocaleString() : 'Never',
            timeSinceUpdate: timeSinceUpdate ? formatTimeDiff(timeSinceUpdate) : 'N/A',
            error: isFailed ? 'Feed fetch failed' : null
          };
        })
      );
      
      setFeedDetails(details.map(r => r.status === 'fulfilled' ? r.value : null).filter(Boolean));
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to refresh health status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTimeDiff = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    return `${minutes}m ago`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'stale': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-blue-100 text-blue-800'
    };
    const labels = { 1: 'Critical', 2: 'High', 3: 'Normal' };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[priority] || colors[3]}`}>
        {labels[priority] || 'Normal'}
      </span>
    );
  };

  if (!healthStatus) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const healthPercentage = Math.round((healthStatus.successful / healthStatus.total) * 100);

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Threat Feed Health Monitor
          </h3>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdate?.toLocaleTimeString()}
            </span>
            <button
              onClick={refreshHealthStatus}
              disabled={isRefreshing}
              className={`px-3 py-1 text-sm rounded-md ${
                isRefreshing
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {healthStatus.total}
            </div>
            <div className="text-sm text-gray-600">Total Feeds</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {healthStatus.successful}
            </div>
            <div className="text-sm text-gray-600">Healthy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {healthStatus.failed}
            </div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {healthPercentage}%
            </div>
            <div className="text-sm text-gray-600">Health Score</div>
          </div>
        </div>
      </div>

      {/* Health Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">System Health:</span>
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                healthPercentage >= 90 ? 'bg-green-500' :
                healthPercentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${healthPercentage}%` }}
            ></div>
          </div>
          <span className={`text-sm font-medium ${
            healthPercentage >= 90 ? 'text-green-600' :
            healthPercentage >= 70 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {healthPercentage >= 90 ? 'Excellent' :
             healthPercentage >= 70 ? 'Good' : 'Poor'}
          </span>
        </div>
      </div>

      {/* Feed Details Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Feed Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Update
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {feedDetails.map((feed) => (
              <tr key={feed.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {feed.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {feed.url}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 capitalize">
                    {feed.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPriorityBadge(feed.priority)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(feed.status)}`}>
                    {feed.status}
                  </span>
                  {feed.error && (
                    <div className="text-xs text-red-600 mt-1">
                      {feed.error}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>{feed.lastUpdate}</div>
                  <div className="text-xs text-gray-500">{feed.timeSinceUpdate}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}