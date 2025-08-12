// 模拟数据文件
export interface QualityMetrics {
  resolutionRate: {
    current: number;
    target: number;
    trend: { date: string; value: number }[];
    change: string;
  };
  negativeFeedbackRate: {
    current: number;
    target: number;
    trend: { date: string; value: number }[];
    change: string;
    reasons: { name: string; value: number }[];
  };
  escalationRate: {
    current: number;
    target: number;
    trend: { date: string; value: number }[];
    change: string;
    reasons: { name: string; value: number }[];
  };
  activeUsers: {
    current: number;
    trend: { date: string; value: number }[];
    change: string;
  };
  aiQualityScore: {
    overall: number;
    components: { name: string; score: number; target: number }[];
  };
}

// 生成过去7天的日期
const generateDates = (days: number): string[] => {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

// 生成趋势数据
const generateTrendData = (baseValue: number, variance: number, days: number) => {
  return Array.from({ length: days }, () => {
    const randomVariation = (Math.random() - 0.5) * variance;
    return Math.max(0, baseValue + randomVariation);
  });
};

export const mockQualityMetrics: QualityMetrics = {
  resolutionRate: {
    current: 87.3,
    target: 90.0,
    trend: generateDates(7).map((date, index) => ({
      date,
      value: generateTrendData(87, 3, 7)[index],
    })),
    change: '+2.1%',
  },
  negativeFeedbackRate: {
    current: 4.2,
    target: 5.0,
    trend: generateDates(7).map((date, index) => ({
      date,
      value: generateTrendData(4.5, 1, 7)[index],
    })),
    change: '-12.5%',
    reasons: [
      { name: '回答不准确', value: 35 },
      { name: '理解有误', value: 28 },
      { name: '回复太长', value: 18 },
      { name: '态度问题', value: 12 },
      { name: '其他', value: 7 },
    ],
  },
  escalationRate: {
    current: 12.5,
    target: 15.0,
    trend: generateDates(7).map((date, index) => ({
      date,
      value: generateTrendData(12.8, 2, 7)[index],
    })),
    change: '-8.3%',
    reasons: [
      { name: '复杂技术问题', value: 42 },
      { name: '需要人工审核', value: 25 },
      { name: '客户特殊要求', value: 18 },
      { name: '系统故障', value: 10 },
      { name: '其他', value: 5 },
    ],
  },
  activeUsers: {
    current: 1248,
    trend: generateDates(7).map((date, index) => ({
      date,
      value: Math.round(generateTrendData(1200, 100, 7)[index]),
    })),
    change: '+15.6%',
  },
  aiQualityScore: {
    overall: 92.1,
    components: [
      { name: '回答准确性', score: 94.5, target: 95.0 },
      { name: '响应速度', score: 96.2, target: 95.0 },
      { name: '用户满意度', score: 88.7, target: 90.0 },
      { name: '对话完整性', score: 89.8, target: 92.0 },
    ],
  },
};

// 用户行为分析数据
export interface UserBehaviorData {
  domainAnalysis: {
    corporate: number;
    freemail: number;
    education: number;
    government: number;
  };
  topDomains: { domain: string; users: number; percentage: number }[];
  userActivity: { hour: number; count: number }[];
}

export const mockUserBehaviorData: UserBehaviorData = {
  domainAnalysis: {
    corporate: 65.3,
    freemail: 28.7,
    education: 4.2,
    government: 1.8,
  },
  topDomains: [
    { domain: 'company-a.com', users: 245, percentage: 19.6 },
    { domain: 'enterprise-b.co.jp', users: 198, percentage: 15.9 },
    { domain: 'corp-c.com', users: 156, percentage: 12.5 },
    { domain: 'business-d.com', users: 134, percentage: 10.7 },
    { domain: 'firm-e.jp', users: 89, percentage: 7.1 },
  ],
  userActivity: Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: Math.round(50 + Math.random() * 100 + Math.sin((hour - 12) * Math.PI / 12) * 30),
  })),
};