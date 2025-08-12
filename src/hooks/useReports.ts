import { useState, useEffect, useCallback } from 'react';
import { MockApiService } from '../services/mockApi';
import type {
  ReportGenerateRequest,
  ReportGenerateResponse,
  ReportListRequest,
  ReportListPaginatedResponse,
} from '../types/api';

// 通用Hook状态接口已在其他文件中定义，这里不需要重复定义

// 报表生成Hook
export const useReportGenerate = () => {
  const [data, setData] = useState<ReportGenerateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = useCallback(async (params: ReportGenerateRequest) => {
    try {
      setLoading(true);
      setError(null);
      setData(null);
      
      const response = await MockApiService.generateReport(params);
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to generate report');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    generateReport,
    reset,
  };
};

// 报表列表Hook
export const useReportList = (initialParams?: Partial<ReportListRequest>) => {
  const [data, setData] = useState<ReportListPaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<ReportListRequest>({
    page: 1,
    pageSize: 10,
    ...initialParams,
  });

  const fetchData = useCallback(async (requestParams?: Partial<ReportListRequest>) => {
    try {
      setLoading(true);
      setError(null);
      
      const finalParams = { ...params, ...requestParams };
      const response = await MockApiService.getReportList(finalParams);
      
      if (response.success) {
        setData(response.data);
        if (requestParams) {
          setParams(finalParams);
        }
      } else {
        setError(response.message || 'Failed to fetch report list');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, []);

  // 分页控制
  const goToPage = useCallback((page: number) => {
    fetchData({ page });
  }, [fetchData]);

  const changePageSize = useCallback((pageSize: number) => {
    fetchData({ page: 1, pageSize });
  }, [fetchData]);

  // 筛选控制
  const setFilters = useCallback((filters: Partial<ReportListRequest>) => {
    fetchData({ page: 1, ...filters });
  }, [fetchData]);

  // 排序控制
  const setSorting = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    fetchData({ sortBy, sortOrder });
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    params,
    refetch: () => fetchData(),
    goToPage,
    changePageSize,
    setFilters,
    setSorting,
  };
};

// 报表管理综合Hook
export const useReportManagement = () => {
  const reportGenerate = useReportGenerate();
  const reportList = useReportList();

  // 生成报表并刷新列表
  const generateAndRefresh = useCallback(async (params: ReportGenerateRequest) => {
    await reportGenerate.generateReport(params);
    
    // 生成成功后刷新列表
    if (reportGenerate.data?.status === 'generating' || reportGenerate.data?.status === 'completed') {
      setTimeout(() => {
        reportList.refetch();
      }, 1000);
    }
  }, [reportGenerate, reportList]);

  return {
    // 报表生成
    generateData: reportGenerate.data,
    generateLoading: reportGenerate.loading,
    generateError: reportGenerate.error,
    generateReport: generateAndRefresh,
    resetGenerate: reportGenerate.reset,

    // 报表列表
    listData: reportList.data,
    listLoading: reportList.loading,
    listError: reportList.error,
    listParams: reportList.params,
    refreshList: reportList.refetch,
    goToPage: reportList.goToPage,
    changePageSize: reportList.changePageSize,
    setFilters: reportList.setFilters,
    setSorting: reportList.setSorting,
  };
};