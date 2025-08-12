import { useState, useEffect } from 'react';
import { MockApiService } from '../services/mockApi';
import type {
  ResolutionRateRequest,
  ResolutionRateResponse,
  NegativeFeedbackRequest,
  NegativeFeedbackResponse,
  EscalationRateRequest,
  EscalationRateResponse,
  QualityScoreRequest,
  QualityScoreResponse,
} from '../types/api';

// 通用Hook状态接口
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// 获取默认时间范围（最近7天）
const getDefaultTimeRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
};

// Session解决率Hook
export const useResolutionRate = (params?: Partial<ResolutionRateRequest>): UseApiState<ResolutionRateResponse> => {
  const [data, setData] = useState<ResolutionRateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams: ResolutionRateRequest = {
        ...getDefaultTimeRange(),
        ...params,
      };
      
      const response = await MockApiService.getResolutionRate(requestParams);
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch resolution rate data');
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

// 负反馈率Hook
export const useNegativeFeedback = (params?: Partial<NegativeFeedbackRequest>): UseApiState<NegativeFeedbackResponse> => {
  const [data, setData] = useState<NegativeFeedbackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams: NegativeFeedbackRequest = {
        ...getDefaultTimeRange(),
        ...params,
      };
      
      const response = await MockApiService.getNegativeFeedback(requestParams);
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch negative feedback data');
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

// 转接率Hook
export const useEscalationRate = (params?: Partial<EscalationRateRequest>): UseApiState<EscalationRateResponse> => {
  const [data, setData] = useState<EscalationRateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams: EscalationRateRequest = {
        ...getDefaultTimeRange(),
        ...params,
      };
      
      const response = await MockApiService.getEscalationRate(requestParams);
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch escalation rate data');
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

// AI质量得分Hook
export const useQualityScore = (params?: Partial<QualityScoreRequest>): UseApiState<QualityScoreResponse> => {
  const [data, setData] = useState<QualityScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams: QualityScoreRequest = {
        ...getDefaultTimeRange(),
        ...params,
      };
      
      const response = await MockApiService.getQualityScore(requestParams);
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch quality score data');
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

// 综合质量指标Hook（同时获取多个指标）
export const useQualityMetrics = (params?: { 
  timeRange?: { startDate: string; endDate: string };
}) => {
  const timeRange = params?.timeRange || getDefaultTimeRange();
  
  const resolutionRate = useResolutionRate(timeRange);
  const negativeFeedback = useNegativeFeedback(timeRange);
  const escalationRate = useEscalationRate(timeRange);
  const qualityScore = useQualityScore(timeRange);

  const loading = resolutionRate.loading || negativeFeedback.loading || escalationRate.loading || qualityScore.loading;
  const error = resolutionRate.error || negativeFeedback.error || escalationRate.error || qualityScore.error;

  const refetchAll = async () => {
    await Promise.all([
      resolutionRate.refetch(),
      negativeFeedback.refetch(),
      escalationRate.refetch(),
      qualityScore.refetch(),
    ]);
  };

  return {
    resolutionRate: resolutionRate.data,
    negativeFeedback: negativeFeedback.data,
    escalationRate: escalationRate.data,
    qualityScore: qualityScore.data,
    loading,
    error,
    refetch: refetchAll,
  };
};