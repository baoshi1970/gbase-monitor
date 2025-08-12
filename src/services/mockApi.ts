// Mock API 服务实现
import type {
  BaseResponse,
  ResolutionRateRequest,
  ResolutionRateResponse,
  NegativeFeedbackRequest,
  NegativeFeedbackResponse,
  EscalationRateRequest,
  EscalationRateResponse,
  QualityScoreRequest,
  QualityScoreResponse,
  DomainAnalysisRequest,
  DomainAnalysisResponse,
  UserActivityRequest,
  UserActivityResponse,
  SystemHealthRequest,
  SystemHealthResponse,
  RealtimeDataRequest,
  RealtimeDataResponse,
  ReportGenerateRequest,
  ReportGenerateResponse,
  ReportListRequest,
  ReportListPaginatedResponse,
} from '../types/api';

// 工具函数：模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 工具函数：生成随机数
const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

// 工具函数：生成日期范围
const generateDateRange = (days: number): string[] => {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

// 工具函数：生成趋势数据
const generateTrendData = (baseValue: number, variance: number, days: number) => {
  return generateDateRange(days).map(date => ({
    date,
    value: Math.max(0, baseValue + (Math.random() - 0.5) * variance),
  }));
};

// 工具函数：生成百分比变化
const generateChange = () => {
  const change = (Math.random() - 0.5) * 30; // -15% to +15%
  return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
};

// Mock API响应包装器
const createMockResponse = <T>(data: T): BaseResponse<T> => ({
  success: true,
  data,
  message: 'Success',
  timestamp: new Date().toISOString(),
});

// Mock API服务类
export class MockApiService {
  // 质量指标API

  // 获取Session解决率数据
  static async getResolutionRate(params: ResolutionRateRequest): Promise<BaseResponse<ResolutionRateResponse>> {
    await delay(300 + Math.random() * 200);

    const days = Math.ceil((new Date(params.endDate).getTime() - new Date(params.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const current = randomBetween(85, 92);

    const response: ResolutionRateResponse = {
      current: Math.round(current * 10) / 10,
      target: 90.0,
      trend: generateTrendData(current, 4, Math.min(days, 30)),
      change: generateChange(),
      categoryBreakdown: [
        { category: '技术问题', rate: randomBetween(88, 94) },
        { category: '商务咨询', rate: randomBetween(82, 89) },
        { category: '产品使用', rate: randomBetween(85, 92) },
        { category: '账户问题', rate: randomBetween(90, 95) },
      ],
      regionBreakdown: [
        { region: '日本', rate: randomBetween(87, 93) },
        { region: '中国', rate: randomBetween(85, 91) },
        { region: '美国', rate: randomBetween(88, 94) },
        { region: '欧洲', rate: randomBetween(86, 92) },
      ],
    };

    return createMockResponse(response);
  }

  // 获取负反馈率数据
  static async getNegativeFeedback(params: NegativeFeedbackRequest): Promise<BaseResponse<NegativeFeedbackResponse>> {
    await delay(250 + Math.random() * 150);

    const days = Math.ceil((new Date(params.endDate).getTime() - new Date(params.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const current = randomBetween(3.5, 5.5);

    const reasons = [
      { name: '回答不准确', value: Math.round(randomBetween(30, 40)), percentage: 0 },
      { name: '理解有误', value: Math.round(randomBetween(25, 35)), percentage: 0 },
      { name: '回复太长', value: Math.round(randomBetween(15, 25)), percentage: 0 },
      { name: '态度问题', value: Math.round(randomBetween(10, 18)), percentage: 0 },
      { name: '其他', value: Math.round(randomBetween(5, 12)), percentage: 0 },
    ];

    // 计算百分比
    const total = reasons.reduce((sum, item) => sum + item.value, 0);
    reasons.forEach(reason => {
      reason.percentage = Math.round((reason.value / total) * 100);
    });

    const response: NegativeFeedbackResponse = {
      current: Math.round(current * 10) / 10,
      target: 5.0,
      trend: generateTrendData(current, 1, Math.min(days, 30)),
      change: generateChange(),
      reasons,
      severityDistribution: [
        { severity: 'high', count: Math.round(randomBetween(15, 25)) },
        { severity: 'medium', count: Math.round(randomBetween(45, 60)) },
        { severity: 'low', count: Math.round(randomBetween(20, 35)) },
      ],
      timeline: generateDateRange(Math.min(days, 14)).map(date => ({
        date,
        count: Math.round(randomBetween(8, 25)),
        reasons: reasons.slice(0, 3).map(r => r.name),
      })),
    };

    return createMockResponse(response);
  }

  // 获取转接率数据
  static async getEscalationRate(params: EscalationRateRequest): Promise<BaseResponse<EscalationRateResponse>> {
    await delay(280 + Math.random() * 180);

    const days = Math.ceil((new Date(params.endDate).getTime() - new Date(params.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const current = randomBetween(10, 15);

    const reasons = [
      { name: '复杂技术问题', value: Math.round(randomBetween(35, 45)), percentage: 0 },
      { name: '需要人工审核', value: Math.round(randomBetween(20, 30)), percentage: 0 },
      { name: '客户特殊要求', value: Math.round(randomBetween(15, 25)), percentage: 0 },
      { name: '系统故障', value: Math.round(randomBetween(8, 15)), percentage: 0 },
      { name: '其他', value: Math.round(randomBetween(3, 10)), percentage: 0 },
    ];

    const total = reasons.reduce((sum, item) => sum + item.value, 0);
    reasons.forEach(reason => {
      reason.percentage = Math.round((reason.value / total) * 100);
    });

    const response: EscalationRateResponse = {
      current: Math.round(current * 10) / 10,
      target: 15.0,
      trend: generateTrendData(current, 2, Math.min(days, 30)),
      change: generateChange(),
      reasons,
      urgencyDistribution: [
        { urgency: 'critical', count: Math.round(randomBetween(5, 12)) },
        { urgency: 'high', count: Math.round(randomBetween(20, 35)) },
        { urgency: 'medium', count: Math.round(randomBetween(40, 60)) },
        { urgency: 'low', count: Math.round(randomBetween(15, 30)) },
      ],
      avgResolutionTime: Math.round(randomBetween(45, 120)), // minutes
      peakHours: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: Math.round(randomBetween(2, 15) + Math.sin((hour - 14) * Math.PI / 12) * 8),
      })),
    };

    return createMockResponse(response);
  }

  // 获取AI质量得分
  static async getQualityScore(params: QualityScoreRequest): Promise<BaseResponse<QualityScoreResponse>> {
    await delay(320 + Math.random() * 200);

    const days = Math.ceil((new Date(params.endDate).getTime() - new Date(params.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const overall = randomBetween(88, 95);

    const components = [
      { name: '回答准确性', score: randomBetween(90, 97), target: 95.0, weight: 0.35 },
      { name: '响应速度', score: randomBetween(92, 98), target: 95.0, weight: 0.25 },
      { name: '用户满意度', score: randomBetween(85, 92), target: 90.0, weight: 0.25 },
      { name: '对话完整性', score: randomBetween(87, 94), target: 92.0, weight: 0.15 },
    ].map(component => ({
      ...component,
      score: Math.round(component.score * 10) / 10,
      trend: generateTrendData(component.score, 3, Math.min(days, 30)),
    }));

    const response: QualityScoreResponse = {
      overall: Math.round(overall * 10) / 10,
      target: 92.0,
      change: generateChange(),
      components,
      factors: {
        accuracy: Math.round(randomBetween(88, 96) * 10) / 10,
        responseTime: Math.round(randomBetween(150, 200)), // ms
        completeness: Math.round(randomBetween(85, 93) * 10) / 10,
        userSatisfaction: Math.round(randomBetween(87, 94) * 10) / 10,
      },
    };

    return createMockResponse(response);
  }

  // 用户行为分析API

  // 获取域名分析数据
  static async getDomainAnalysis(params: DomainAnalysisRequest): Promise<BaseResponse<DomainAnalysisResponse>> {
    await delay(400 + Math.random() * 250);

    const days = Math.ceil((new Date(params.endDate).getTime() - new Date(params.startDate).getTime()) / (1000 * 60 * 60 * 24));

    const industries = ['制造业', '金融服务', '科技互联网', '医疗健康', '教育培训', '电商零售'];
    
    const response: DomainAnalysisResponse = {
      distribution: {
        corporate: Math.round(randomBetween(60, 70) * 10) / 10,
        freemail: Math.round(randomBetween(25, 35) * 10) / 10,
        education: Math.round(randomBetween(3, 7) * 10) / 10,
        government: Math.round(randomBetween(1, 3) * 10) / 10,
      },
      topDomains: Array.from({ length: 10 }, (_, i) => ({
        domain: `company-${String.fromCharCode(97 + i)}.com`,
        users: Math.round(randomBetween(50, 300)),
        percentage: Math.round(randomBetween(2, 20) * 10) / 10,
        industry: industries[Math.floor(Math.random() * industries.length)],
        growth: generateChange(),
      })).sort((a, b) => b.users - a.users),
      newDomains: Array.from({ length: 5 }, (_, i) => ({
        domain: `newco-${i + 1}.jp`,
        users: Math.round(randomBetween(10, 50)),
        firstSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })),
      trends: generateDateRange(Math.min(days, 30)).map(date => ({
        date,
        corporate: randomBetween(60, 70),
        freemail: randomBetween(25, 35),
        education: randomBetween(3, 7),
        government: randomBetween(1, 3),
      })),
    };

    return createMockResponse(response);
  }

  // 获取用户活跃度数据
  static async getUserActivity(_params: UserActivityRequest): Promise<BaseResponse<UserActivityResponse>> {
    await delay(350 + Math.random() * 200);

    const response: UserActivityResponse = {
      activeUsers: {
        daily: Math.round(randomBetween(800, 1500)),
        weekly: Math.round(randomBetween(3000, 6000)),
        monthly: Math.round(randomBetween(8000, 15000)),
      },
      userTypes: {
        new: Math.round(randomBetween(20, 35)),
        returning: Math.round(randomBetween(50, 70)),
        power: Math.round(randomBetween(10, 20)),
      },
      activityByHour: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: Math.round(randomBetween(30, 120) + Math.sin((hour - 14) * Math.PI / 12) * 50),
      })),
      activityByDay: Array.from({ length: 7 }, (_, day) => ({
        dayOfWeek: day,
        count: Math.round(randomBetween(800, 1200) - (day === 5 || day === 6 ? 200 : 0)),
      })),
      sessionDuration: {
        avg: Math.round(randomBetween(8, 15) * 10) / 10, // minutes
        median: Math.round(randomBetween(5, 10) * 10) / 10,
        distribution: [
          { range: '0-2分钟', count: Math.round(randomBetween(150, 300)) },
          { range: '2-5分钟', count: Math.round(randomBetween(300, 500)) },
          { range: '5-10分钟', count: Math.round(randomBetween(200, 350)) },
          { range: '10-20分钟', count: Math.round(randomBetween(100, 200)) },
          { range: '20分钟+', count: Math.round(randomBetween(50, 120)) },
        ],
      },
      retentionRate: {
        day1: Math.round(randomBetween(65, 85) * 10) / 10,
        day7: Math.round(randomBetween(35, 55) * 10) / 10,
        day30: Math.round(randomBetween(15, 30) * 10) / 10,
      },
    };

    return createMockResponse(response);
  }

  // 系统概览API

  // 获取系统健康状况
  static async getSystemHealth(_params: SystemHealthRequest): Promise<BaseResponse<SystemHealthResponse>> {
    await delay(200 + Math.random() * 150);

    const services = [
      'API网关',
      'AI对话引擎', 
      '用户认证服务',
      '数据分析服务',
      '消息队列',
      '数据库集群',
      '缓存服务',
      '监控服务',
    ];

    const response: SystemHealthResponse = {
      uptime: randomBetween(99.8, 99.99),
      availability: randomBetween(99.9, 99.99),
      responseTime: {
        avg: Math.round(randomBetween(80, 200)),
        p95: Math.round(randomBetween(200, 500)),
        p99: Math.round(randomBetween(500, 1200)),
      },
      errorRate: randomBetween(0.01, 0.1),
      throughput: {
        current: Math.round(randomBetween(800, 1500)),
        peak: Math.round(randomBetween(1500, 3000)),
        avg: Math.round(randomBetween(900, 1200)),
      },
      resources: {
        cpu: Math.round(randomBetween(30, 80)),
        memory: Math.round(randomBetween(40, 85)),
        disk: Math.round(randomBetween(20, 60)),
        network: Math.round(randomBetween(10, 40)),
      },
      alerts: [
        { critical: Math.round(randomBetween(0, 3)), warning: Math.round(randomBetween(2, 8)), info: Math.round(randomBetween(5, 15)) },
      ],
      services: services.map(name => ({
        name,
        status: Math.random() > 0.1 ? 'healthy' : Math.random() > 0.5 ? 'degraded' : 'down' as any,
        responseTime: Math.round(randomBetween(50, 300)),
        uptime: randomBetween(98, 100),
      })),
    };

    return createMockResponse(response);
  }

  // 获取实时数据
  static async getRealtimeData(params: RealtimeDataRequest): Promise<BaseResponse<RealtimeDataResponse>> {
    await delay(100 + Math.random() * 100);

    const metrics: { [key: string]: { value: number; change: string; status: 'normal' | 'warning' | 'critical' } } = {};

    params.metrics.forEach(metric => {
      const value = randomBetween(0, 100);
      const status = value > 80 ? 'critical' : value > 60 ? 'warning' : 'normal';
      
      metrics[metric] = {
        value: Math.round(value * 10) / 10,
        change: generateChange(),
        status,
      };
    });

    const eventTypes = ['info', 'warning', 'error'] as const;

    const response: RealtimeDataResponse = {
      timestamp: new Date().toISOString(),
      metrics,
      events: Array.from({ length: Math.round(randomBetween(0, 5)) }, (_, i) => ({
        id: `event_${Date.now()}_${i}`,
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        message: `系统事件 ${i + 1}: ${Math.random() > 0.5 ? '正常运行' : '性能告警'}`,
        timestamp: new Date(Date.now() - Math.random() * 300000).toISOString(),
        metadata: { source: 'system-monitor' },
      })),
    };

    return createMockResponse(response);
  }

  // 报表API

  // 生成报表
  static async generateReport(_params: ReportGenerateRequest): Promise<BaseResponse<ReportGenerateResponse>> {
    await delay(500 + Math.random() * 300);

    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const response: ReportGenerateResponse = {
      reportId,
      status: 'generating',
      estimatedTime: Math.round(randomBetween(30, 180)), // seconds
    };

    // 模拟报表生成完成
    setTimeout(() => {
      // 这里可以添加WebSocket或轮询逻辑来更新状态
    }, response.estimatedTime! * 1000);

    return createMockResponse(response);
  }

  // 获取报表列表
  static async getReportList(params: ReportListRequest): Promise<BaseResponse<ReportListPaginatedResponse>> {
    await delay(250 + Math.random() * 150);

    const reportTypes = ['daily', 'weekly', 'monthly', 'custom'];
    const statuses = ['completed', 'generating', 'failed', 'pending'];
    
    const totalReports = Math.round(randomBetween(50, 200));
    const startIndex = (params.page - 1) * params.pageSize;
    
    const reports = Array.from({ length: Math.min(params.pageSize, totalReports - startIndex) }, (_, i) => {
      const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        id: `report_${startIndex + i + 1}`,
        name: `${reportTypes[Math.floor(Math.random() * reportTypes.length)]}报表_${startIndex + i + 1}`,
        type: reportTypes[Math.floor(Math.random() * reportTypes.length)],
        status,
        createdAt: createdDate.toISOString(),
        generatedAt: status === 'completed' ? new Date(createdDate.getTime() + Math.random() * 60000).toISOString() : undefined,
        downloadUrl: status === 'completed' ? `/api/reports/download/report_${startIndex + i + 1}` : undefined,
        fileSize: status === 'completed' ? Math.round(randomBetween(500, 5000)) : undefined, // KB
        expiresAt: status === 'completed' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      };
    });

    const response: ReportListPaginatedResponse = {
      items: reports,
      total: totalReports,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(totalReports / params.pageSize),
    };

    return createMockResponse(response);
  }
}