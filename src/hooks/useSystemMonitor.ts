import { useState, useEffect, useRef, useCallback } from 'react';
import { MockApiService } from '../services/mockApi';
import type {
  SystemHealthRequest,
  SystemHealthResponse,
  RealtimeDataRequest,
  RealtimeDataResponse,
} from '../types/api';

// 通用Hook状态接口
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// 系统健康状况Hook
export const useSystemHealth = (params?: SystemHealthRequest): UseApiState<SystemHealthResponse> => {
  const [data, setData] = useState<SystemHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await MockApiService.getSystemHealth(params || {});
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch system health data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(params)]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

// 实时数据Hook
interface UseRealtimeDataOptions {
  metrics: string[];
  interval?: number; // 刷新间隔（毫秒）
  autoRefresh?: boolean;
}

export const useRealtimeData = (options: UseRealtimeDataOptions): UseApiState<RealtimeDataResponse> & {
  isAutoRefreshing: boolean;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
} => {
  const [data, setData] = useState<RealtimeDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(options.autoRefresh || false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { metrics, interval = 5000 } = options;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams: RealtimeDataRequest = {
        metrics,
        interval,
      };
      
      const response = await MockApiService.getRealtimeData(requestParams);
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch realtime data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [metrics, interval]);

  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setIsAutoRefreshing(true);
    intervalRef.current = setInterval(fetchData, interval);
  }, [fetchData, interval]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsAutoRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
    
    if (options.autoRefresh) {
      startAutoRefresh();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, options.autoRefresh, startAutoRefresh]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    isAutoRefreshing,
    startAutoRefresh,
    stopAutoRefresh,
  };
};

// 系统概览综合Hook
export const useSystemOverview = (options?: {
  includeAlerts?: boolean;
  realtimeMetrics?: string[];
  autoRefresh?: boolean;
  refreshInterval?: number;
}) => {
  const systemHealth = useSystemHealth({ 
    includeAlerts: options?.includeAlerts || true 
  });
  
  const realtimeData = useRealtimeData({
    metrics: options?.realtimeMetrics || [
      'activeUsers',
      'responseTime', 
      'errorRate',
      'throughput'
    ],
    interval: options?.refreshInterval || 5000,
    autoRefresh: options?.autoRefresh || false,
  });

  const loading = systemHealth.loading || realtimeData.loading;
  const error = systemHealth.error || realtimeData.error;

  const refetchAll = async () => {
    await Promise.all([
      systemHealth.refetch(),
      realtimeData.refetch(),
    ]);
  };

  return {
    systemHealth: systemHealth.data,
    realtimeData: realtimeData.data,
    loading,
    error,
    refetch: refetchAll,
    isAutoRefreshing: realtimeData.isAutoRefreshing,
    startAutoRefresh: realtimeData.startAutoRefresh,
    stopAutoRefresh: realtimeData.stopAutoRefresh,
  };
};