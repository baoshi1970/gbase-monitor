import { useState, useEffect, useCallback } from 'react';
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
export const useSystemHealth = (params?: Partial<SystemHealthRequest>): UseApiState<SystemHealthResponse> => {
  const [data, setData] = useState<SystemHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams: SystemHealthRequest = {
        ...params,
      };
      
      const response = await MockApiService.getSystemHealth(requestParams);
      
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
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

// 实时数据Hook
export const useRealtimeData = (
  metrics: string[] = ['cpu', 'memory', 'activeUsers', 'responseTime', 'errorRate'],
  interval: number = 30000 // 30秒更新一次
): UseApiState<RealtimeDataResponse> => {
  const [data, setData] = useState<RealtimeDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      if (loading) {
        // 只在第一次加载时显示loading状态
      }
      
      const requestParams: RealtimeDataRequest = {
        metrics,
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
  }, [metrics.join(','), loading]);

  useEffect(() => {
    fetchData();
    
    // 设置定时更新
    const intervalId = setInterval(fetchData, interval);
    
    return () => clearInterval(intervalId);
  }, [fetchData, interval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

// 系统概览综合Hook
export const useSystemOverview = (params?: {
  realtimeMetrics?: string[];
  realtimeInterval?: number;
}) => {
  const systemHealth = useSystemHealth();
  const realtimeData = useRealtimeData(
    params?.realtimeMetrics,
    params?.realtimeInterval
  );

  const loading = systemHealth.loading;
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
  };
};

// 系统状态颜色工具函数
export const getStatusColor = (status: 'healthy' | 'degraded' | 'down' | 'normal' | 'warning' | 'critical') => {
  switch (status) {
    case 'healthy':
    case 'normal':
      return '#52c41a'; // 绿色
    case 'degraded':
    case 'warning':
      return '#faad14'; // 黄色
    case 'down':
    case 'critical':
      return '#f5222d'; // 红色
    default:
      return '#d9d9d9'; // 灰色
  }
};

// 资源使用率状态判断
export const getResourceStatus = (usage: number): 'normal' | 'warning' | 'critical' => {
  if (usage >= 90) return 'critical';
  if (usage >= 75) return 'warning';
  return 'normal';
};

// 响应时间状态判断
export const getResponseTimeStatus = (responseTime: number): 'normal' | 'warning' | 'critical' => {
  if (responseTime >= 1000) return 'critical'; // 1秒以上
  if (responseTime >= 500) return 'warning';   // 500ms以上
  return 'normal';
};