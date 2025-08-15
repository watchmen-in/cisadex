import { useState, useEffect } from 'react';
import { apiService, HealthStatus } from '../services/apiService';

export function useApiHealth() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await apiService.getHealth();
        setHealthStatus(health);
        setIsConnected(health.status === 'healthy');
        setLastCheck(new Date());
      } catch (error) {
        console.error('Health check failed:', error);
        setIsConnected(false);
        setHealthStatus({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          uptime: 0
        });
        setLastCheck(new Date());
      }
    };

    // Initial check
    checkHealth();

    // Set up periodic health checks
    const interval = setInterval(checkHealth, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    healthStatus,
    isConnected,
    lastCheck
  };
}