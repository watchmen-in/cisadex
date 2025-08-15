import React from 'react';
import { useApiHealth } from '../hooks/useApiHealth';

export default function ApiConnectionStatus() {
  const { healthStatus, isConnected, lastCheck } = useApiHealth();

  if (!healthStatus) {
    return (
      <div className="flex items-center gap-2 text-xs text-t2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span>Connecting to API...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-t2">
      <div className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-green-500' : 'bg-red-500'
      } ${isConnected ? 'animate-pulse' : ''}`}></div>
      <span>
        API: {isConnected ? 'Connected' : 'Disconnected'} • 
        Last check: {lastCheck.toLocaleTimeString()}
      </span>
      {healthStatus.uptime && (
        <span className="text-t3">
          • Uptime: {Math.floor(healthStatus.uptime / 3600)}h
        </span>
      )}
    </div>
  );
}