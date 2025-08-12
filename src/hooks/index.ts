// Hooks 导出文件

// 质量指标相关Hooks
export {
  useResolutionRate,
  useNegativeFeedback,
  useEscalationRate,
  useQualityScore,
  useQualityMetrics,
} from './useQualityMetrics';

// 用户行为分析相关Hooks
export {
  useDomainAnalysis,
  useUserActivity,
  useUserBehaviorAnalysis,
} from './useUserBehavior';

// 系统监控相关Hooks
export {
  useSystemHealth,
  useRealtimeData,
  useSystemOverview,
} from './useSystemMonitor';

// 报表相关Hooks
export {
  useReportGenerate,
  useReportList,
  useReportManagement,
} from './useReports';