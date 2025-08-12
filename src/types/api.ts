// API请求和响应类型定义

export interface BaseResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
  timestamp?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// 分页请求参数
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 分页响应数据
export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 时间范围参数
export interface TimeRangeParams {
  startDate: string;
  endDate: string;
  granularity?: 'hour' | 'day' | 'week' | 'month';
}

// 用户相关接口
export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

// 质量指标API接口类型

// 获取解决率数据
export interface ResolutionRateRequest extends TimeRangeParams {
  category?: string;
  region?: string;
}

export interface ResolutionRateResponse {
  current: number;
  target: number;
  trend: { date: string; value: number }[];
  change: string;
  categoryBreakdown?: { category: string; rate: number }[];
  regionBreakdown?: { region: string; rate: number }[];
}

// 获取负反馈数据
export interface NegativeFeedbackRequest extends TimeRangeParams {
  reason?: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface NegativeFeedbackResponse {
  current: number;
  target: number;
  trend: { date: string; value: number }[];
  change: string;
  reasons: { name: string; value: number; percentage: number }[];
  severityDistribution: { severity: string; count: number }[];
  timeline: { date: string; count: number; reasons: string[] }[];
}

// 获取转接率数据
export interface EscalationRateRequest extends TimeRangeParams {
  reason?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
}

export interface EscalationRateResponse {
  current: number;
  target: number;
  trend: { date: string; value: number }[];
  change: string;
  reasons: { name: string; value: number; percentage: number }[];
  urgencyDistribution: { urgency: string; count: number }[];
  avgResolutionTime: number;
  peakHours: { hour: number; count: number }[];
}

// AI质量得分
export interface QualityScoreRequest extends TimeRangeParams {
  component?: string;
}

export interface QualityScoreResponse {
  overall: number;
  target: number;
  change: string;
  components: {
    name: string;
    score: number;
    target: number;
    weight: number;
    trend: { date: string; value: number }[];
  }[];
  factors: {
    accuracy: number;
    responseTime: number;
    completeness: number;
    userSatisfaction: number;
  };
}

// 用户行为分析API接口

// 域名分析
export interface DomainAnalysisRequest extends TimeRangeParams {
  domainType?: 'corporate' | 'freemail' | 'education' | 'government';
}

export interface DomainAnalysisResponse {
  distribution: {
    corporate: number;
    freemail: number;
    education: number;
    government: number;
  };
  topDomains: {
    domain: string;
    users: number;
    percentage: number;
    industry?: string;
    growth: string;
  }[];
  newDomains: {
    domain: string;
    users: number;
    firstSeen: string;
  }[];
  trends: {
    date: string;
    corporate: number;
    freemail: number;
    education: number;
    government: number;
  }[];
}

// 用户活跃度
export interface UserActivityRequest extends TimeRangeParams {
  userType?: 'new' | 'returning' | 'power';
}

export interface UserActivityResponse {
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  userTypes: {
    new: number;
    returning: number;
    power: number;
  };
  activityByHour: { hour: number; count: number }[];
  activityByDay: { dayOfWeek: number; count: number }[];
  sessionDuration: {
    avg: number;
    median: number;
    distribution: { range: string; count: number }[];
  };
  retentionRate: {
    day1: number;
    day7: number;
    day30: number;
  };
}

// 系统概览API接口

// 系统健康状况
export interface SystemHealthRequest {
  includeAlerts?: boolean;
}

export interface SystemHealthResponse {
  uptime: number;
  availability: number;
  responseTime: {
    avg: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
  throughput: {
    current: number;
    peak: number;
    avg: number;
  };
  resources: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  alerts: {
    critical: number;
    warning: number;
    info: number;
  }[];
  services: {
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    uptime: number;
  }[];
}

// 实时数据
export interface RealtimeDataRequest {
  metrics: string[];
  interval?: number;
}

export interface RealtimeDataResponse {
  timestamp: string;
  metrics: {
    [key: string]: {
      value: number;
      change: string;
      status: 'normal' | 'warning' | 'critical';
    };
  };
  events: {
    id: string;
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
    metadata?: any;
  }[];
}

// 报表API接口

// 报表生成请求
export interface ReportGenerateRequest {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  template: string;
  parameters: {
    timeRange: TimeRangeParams;
    metrics: string[];
    format: 'pdf' | 'excel' | 'csv';
    recipients?: string[];
    schedule?: {
      frequency: 'once' | 'daily' | 'weekly' | 'monthly';
      time?: string;
      timezone?: string;
    };
  };
}

export interface ReportGenerateResponse {
  reportId: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
  generatedAt?: string;
  fileSize?: number;
  estimatedTime?: number;
}

// 报表列表
export interface ReportListRequest extends PaginationParams {
  type?: string;
  status?: string;
  dateRange?: TimeRangeParams;
}

export interface ReportListResponse {
  reports: {
    id: string;
    name: string;
    type: string;
    status: string;
    createdAt: string;
    generatedAt?: string;
    downloadUrl?: string;
    fileSize?: number;
    expiresAt?: string;
  }[];
}

export type ReportListPaginatedResponse = PaginationResponse<ReportListResponse['reports'][0]>;
