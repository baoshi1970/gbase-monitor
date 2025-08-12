import { useState, useEffect } from 'react';
import { MockApiService } from '../services/mockApi';
import type {
  DomainAnalysisRequest,
  DomainAnalysisResponse,
  UserActivityRequest,
  UserActivityResponse,
} from '../types/api';

// 通用Hook状态接口
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// 获取默认时间范围（最近30天）
const getDefaultTimeRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
};

// 域名分析Hook
export const useDomainAnalysis = (params?: Partial<DomainAnalysisRequest>): UseApiState<DomainAnalysisResponse> => {
  const [data, setData] = useState<DomainAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams: DomainAnalysisRequest = {
        ...getDefaultTimeRange(),
        ...params,
      };
      
      const response = await MockApiService.getDomainAnalysis(requestParams);
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch domain analysis data');
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

// 用户活跃度Hook
export const useUserActivity = (params?: Partial<UserActivityRequest>): UseApiState<UserActivityResponse> => {
  const [data, setData] = useState<UserActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams: UserActivityRequest = {
        ...getDefaultTimeRange(),
        ...params,
      };
      
      const response = await MockApiService.getUserActivity(requestParams);
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch user activity data');
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

// 综合用户行为分析Hook
export const useUserBehaviorAnalysis = (params?: { 
  timeRange?: { startDate: string; endDate: string };
}) => {
  const timeRange = params?.timeRange || getDefaultTimeRange();
  
  const domainAnalysis = useDomainAnalysis(timeRange);
  const userActivity = useUserActivity(timeRange);

  const loading = domainAnalysis.loading || userActivity.loading;
  const error = domainAnalysis.error || userActivity.error;

  const refetchAll = async () => {
    await Promise.all([
      domainAnalysis.refetch(),
      userActivity.refetch(),
    ]);
  };

  return {
    domainAnalysis: domainAnalysis.data,
    userActivity: userActivity.data,
    loading,
    error,
    refetch: refetchAll,
  };
};