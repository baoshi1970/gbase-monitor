# GBase AI监控系统 - API接口需求清单

## 📋 项目概述

本文档基于《GBase AI聊天服务监控和统计后台产品需求文档》，详细列出系统所需的全部API接口。GBase AI监控系统旨在实现对AI对话服务的全面监控、用户行为分析、系统性能追踪和智能告警管理。

**文档版本**: v1.0  
**创建日期**: 2025-01-07  
**适用系统**: GBase AI监控和统计后台  

---

## 🎯 接口分类说明

根据业务优先级和功能模块，API接口分为以下6大类：

- **🌟 A类 - 核心质量监控**: Session解决率、负反馈率等核心指标
- **💬 B类 - 对话数据管理**: 对话内容、反馈、质量评估
- **👥 C类 - 用户行为分析**: 用户活跃度、行为模式、企业分析
- **🖥️ D类 - 系统监控**: AI模型性能、服务可用性、基础设施
- **📊 E类 - 统计报表**: 数据分析、趋势统计、报表生成
- **⚙️ F类 - 配置管理**: 系统配置、权限管理、告警设置

---

## 🌟 A类：核心质量监控API (P0优先级)

### A.1 Session解决率接口
```http
GET /api/v1/quality/resolution-rate
```

**功能**: 获取对话解决率统计数据（北极星指标）  
**参数**:
- `timeRange`: 时间范围 (1h|24h|7d|30d)
- `category`: 问题分类 (technical|business|usage)  
- `region`: 地域筛选 (JP|ALL)

**响应**:
```json
{
  "current": 87.3,
  "target": 90.0,
  "trend": [85.1, 86.2, 87.3],
  "breakdown": [
    {
      "category": "technical",
      "rate": 82.5,
      "count": 1250
    }
  ]
}
```

### A.2 负反馈率接口
```http
GET /api/v1/quality/negative-feedback
```

**功能**: 获取用户负反馈统计数据  
**参数**:
- `timeRange`: 时间范围
- `reason`: 反馈原因筛选

**响应**:
```json
{
  "rate": 4.2,
  "target": 5.0,
  "reasons": [
    {
      "type": "unhelpful_response",
      "count": 156,
      "percentage": 45.2
    }
  ],
  "timeline": [
    {
      "timestamp": "2025-01-07T10:00:00Z",
      "rate": 4.1
    }
  ]
}
```

### A.3 人工转接率接口
```http
GET /api/v1/quality/escalation-rate
```

**功能**: 获取AI到人工客服的转接率数据  
**参数**:
- `timeRange`: 时间范围
- `trigger`: 转接触发原因

**响应**:
```json
{
  "rate": 12.8,
  "target": 15.0,
  "reasons": [
    {
      "trigger": "complex_query",
      "count": 89,
      "percentage": 34.1
    }
  ],
  "average_escalation_time": 145
}
```

### A.4 无答案回复率接口
```http
GET /api/v1/quality/no-answer-rate
```

**功能**: 获取AI无法回答问题的统计  
**参数**:
- `timeRange`: 时间范围
- `knowledge_area`: 知识领域

**响应**:
```json
{
  "rate": 8.5,
  "target": 10.0,
  "knowledge_gaps": [
    {
      "area": "product_features",
      "gap_rate": 15.2,
      "sample_queries": ["How to use advanced settings?"]
    }
  ]
}
```

### A.5 综合质量得分接口
```http
GET /api/v1/quality/score
```

**功能**: 获取AI服务综合质量评分  
**响应**:
```json
{
  "overall_score": 92.1,
  "components": [
    {
      "metric": "resolution_rate",
      "score": 87.3,
      "weight": 0.4
    },
    {
      "metric": "response_accuracy",
      "score": 94.2,
      "weight": 0.3
    }
  ],
  "trend": [89.5, 91.2, 92.1]
}
```

### A.6 实时质量监控WebSocket
```websocket
WS /ws/quality/realtime
```

**功能**: 实时推送质量指标更新  
**事件类型**:
- `resolution_rate_update`: 解决率实时更新
- `negative_feedback_alert`: 负反馈异常告警
- `escalation_spike`: 转接率突增提醒
- `quality_threshold_breach`: 质量阈值突破告警

---

## 💬 B类：对话数据管理API (P1优先级)

### B.1 对话详情接口
```http
GET /api/v1/conversations/{sessionId}
```

**功能**: 获取特定对话会话的完整信息  
**响应**:
```json
{
  "session_id": "conv_123456",
  "user_id": "user_789",
  "start_time": "2025-01-07T10:00:00Z",
  "end_time": "2025-01-07T10:15:00Z",
  "message_count": 8,
  "resolution_status": "resolved",
  "quality_score": 4.2,
  "escalated": false,
  "messages": [
    {
      "timestamp": "2025-01-07T10:00:00Z",
      "role": "user",
      "content": "How to reset my password?",
      "intent": "password_reset"
    }
  ]
}
```

### B.2 对话反馈管理接口
```http
GET /api/v1/conversations/{sessionId}/feedback
POST /api/v1/conversations/{sessionId}/feedback
```

**功能**: 获取或提交对话反馈  
**POST请求体**:
```json
{
  "rating": 4,
  "feedback_type": "positive",
  "comment": "Very helpful response",
  "categories": ["accuracy", "helpfulness"]
}
```

### B.3 对话质量指标接口
```http
GET /api/v1/conversations/{sessionId}/quality-metrics
```

**功能**: 获取单次对话的详细质量指标  
**响应**:
```json
{
  "response_time_avg": 1.2,
  "accuracy_score": 0.91,
  "relevance_score": 0.88,
  "user_satisfaction": 4.1,
  "completion_rate": true,
  "follow_up_needed": false
}
```

### B.4 对话搜索接口
```http
POST /api/v1/conversations/search
```

**功能**: 基于内容、时间、用户等条件搜索对话  
**请求体**:
```json
{
  "query": "password reset",
  "time_range": "7d",
  "user_type": "enterprise",
  "resolution_status": "unresolved",
  "limit": 50
}
```

### B.5 对话统计接口
```http
GET /api/v1/conversations/stats
```

**功能**: 获取对话的统计汇总数据  
**参数**:
- `timeRange`: 统计时间范围
- `granularity`: 聚合粒度 (hour|day|week)

---

## 👥 C类：用户行为分析API (P1优先级)

### C.1 用户活跃度统计
```http
GET /api/v1/users/activity-stats
```

**功能**: 获取用户活跃度相关统计  
**参数**:
- `timeRange`: 时间范围
- `user_type`: 用户类型 (free|premium|enterprise)

**响应**:
```json
{
  "dau": 12500,
  "mau": 45000,
  "new_users_today": 250,
  "retention_rate_7d": 0.72,
  "avg_session_duration": 420,
  "active_sessions": 890
}
```

### C.2 用户行为模式分析
```http
GET /api/v1/users/{userId}/behavior-pattern
```

**功能**: 获取特定用户的行为模式分析  
**响应**:
```json
{
  "usage_frequency": "daily",
  "peak_hours": [9, 14, 20],
  "preferred_features": ["chat", "document_analysis"],
  "conversation_length_avg": 8.5,
  "topics_of_interest": ["technology", "business"],
  "engagement_score": 0.85
}
```

### C.3 用户留存分析
```http
GET /api/v1/users/retention-analysis
```

**功能**: 获取用户留存率分析数据  
**响应**:
```json
{
  "cohort_analysis": [
    {
      "cohort_month": "2024-12",
      "users": 1200,
      "retention_rates": {
        "day_1": 0.85,
        "day_7": 0.72,
        "day_30": 0.58
      }
    }
  ],
  "churn_risk_users": [
    {
      "user_id": "user_123",
      "risk_score": 0.78,
      "last_activity": "2025-01-05T15:30:00Z"
    }
  ]
}
```

### C.4 用户分群接口
```http
GET /api/v1/users/segmentation
```

**功能**: 获取用户分群和画像数据  
**响应**:
```json
{
  "segments": [
    {
      "name": "Power Users",
      "count": 2500,
      "characteristics": {
        "avg_daily_conversations": 15,
        "feature_adoption": 0.92,
        "satisfaction_score": 4.6
      }
    }
  ],
  "demographics": {
    "age_distribution": [
      {"range": "18-25", "percentage": 15.2},
      {"range": "26-35", "percentage": 42.1}
    ],
    "device_types": {
      "mobile": 0.65,
      "desktop": 0.35
    }
  }
}
```

### C.5 企业域名分析
```http
GET /api/v1/enterprise/domain-analysis
```

**功能**: 分析企业用户的域名分布和使用情况  
**响应**:
```json
{
  "total_domains": 1250,
  "corporate_domains": 890,
  "top_companies": [
    {
      "domain": "toyota.co.jp",
      "company_name": "Toyota Motor Corporation",
      "user_count": 45,
      "usage_volume": 1200,
      "industry": "automotive"
    }
  ],
  "industry_breakdown": [
    {
      "industry": "technology",
      "percentage": 28.5,
      "growth_rate": 0.15
    }
  ]
}
```

---

## 🖥️ D类：系统监控API (P1优先级)

### D.1 系统健康状态
```http
GET /api/v1/system/health
```

**功能**: 获取系统整体健康状态  
**响应**:
```json
{
  "overall_status": "healthy",
  "uptime": 0.9997,
  "services": [
    {
      "name": "ai_service",
      "status": "healthy",
      "response_time": 156,
      "error_rate": 0.001
    },
    {
      "name": "database",
      "status": "healthy",
      "connections": 45,
      "query_time_avg": 12
    }
  ],
  "alerts": [
    {
      "level": "warning",
      "message": "CPU usage above 80%",
      "timestamp": "2025-01-07T10:45:00Z"
    }
  ]
}
```

### D.2 AI模型性能监控
```http
GET /api/v1/ai-models/performance
```

**功能**: 获取AI模型性能指标  
**响应**:
```json
{
  "models": [
    {
      "model_id": "gbase-chat-v2.1",
      "inference_time_avg": 0.85,
      "accuracy_score": 0.94,
      "throughput": 1200,
      "gpu_utilization": 0.76,
      "memory_usage": 0.68
    }
  ],
  "performance_trends": [
    {
      "timestamp": "2025-01-07T10:00:00Z",
      "response_time": 0.82,
      "accuracy": 0.93
    }
  ]
}
```

### D.3 服务可用性监控
```http
GET /api/v1/services/availability
```

**功能**: 监控各个服务的可用性状态  
**响应**:
```json
{
  "services": [
    {
      "name": "chat_api",
      "uptime": 0.9999,
      "last_downtime": "2025-01-05T14:22:00Z",
      "response_time_p95": 245,
      "error_rate_24h": 0.002
    }
  ],
  "sla_metrics": {
    "target_uptime": 0.999,
    "current_uptime": 0.9997,
    "mtbf": 720,
    "mttr": 5.2
  }
}
```

### D.4 基础设施监控
```http
GET /api/v1/infrastructure/metrics
```

**功能**: 获取基础设施监控指标  
**响应**:
```json
{
  "servers": [
    {
      "hostname": "gbase-app-01",
      "cpu_usage": 0.72,
      "memory_usage": 0.68,
      "disk_usage": 0.45,
      "network_io": {
        "rx_bytes_per_sec": 1048576,
        "tx_bytes_per_sec": 2097152
      }
    }
  ],
  "database": {
    "connections_active": 45,
    "query_time_avg": 12.5,
    "cache_hit_ratio": 0.95,
    "replication_lag": 0.1
  },
  "cache": {
    "hit_ratio": 0.92,
    "memory_used": "4.2GB",
    "keys_count": 125000
  }
}
```

### D.5 当前告警信息
```http
GET /api/v1/alerts/current
```

**功能**: 获取当前活跃告警列表  
**响应**:
```json
{
  "active_alerts": [
    {
      "alert_id": "alert_001",
      "level": "warning",
      "title": "High CPU Usage",
      "description": "CPU usage on gbase-app-01 exceeds 80%",
      "triggered_at": "2025-01-07T10:30:00Z",
      "source": "infrastructure"
    }
  ],
  "alert_summary": {
    "critical": 0,
    "warning": 3,
    "info": 1
  }
}
```

---

## 📊 E类：统计报表API (P2优先级)

### E.1 总体统计概览
```http
GET /api/v1/analytics/overview
```

**功能**: 获取系统总体统计概览  
**参数**:
- `timeRange`: 统计时间范围
- `compare_with`: 对比时间段

**响应**:
```json
{
  "summary": {
    "total_conversations": 125000,
    "active_users": 12500,
    "resolution_rate": 87.3,
    "satisfaction_score": 4.2,
    "revenue_impact": 1250000
  },
  "comparison": {
    "conversations_growth": 0.15,
    "user_growth": 0.08,
    "quality_improvement": 0.02
  },
  "key_insights": [
    {
      "type": "positive",
      "message": "Resolution rate improved by 2.1% this week",
      "impact": "high"
    }
  ]
}
```

### E.2 趋势分析数据
```http
GET /api/v1/analytics/trends
```

**功能**: 获取各项指标的趋势分析  
**参数**:
- `metrics`: 指标列表 (resolution_rate|user_growth|satisfaction)
- `timeRange`: 分析时间范围
- `granularity`: 数据粒度

**响应**:
```json
{
  "trends": [
    {
      "metric": "resolution_rate",
      "current_value": 87.3,
      "trend_direction": "up",
      "change_rate": 0.021,
      "data_points": [
        {
          "timestamp": "2025-01-06T00:00:00Z",
          "value": 85.2
        }
      ],
      "forecast": [
        {
          "timestamp": "2025-01-08T00:00:00Z",
          "predicted_value": 88.1,
          "confidence": 0.85
        }
      ]
    }
  ]
}
```

### E.3 报表生成请求
```http
POST /api/v1/reports/generate
```

**功能**: 生成自定义报表  
**请求体**:
```json
{
  "report_type": "quality_weekly",
  "time_range": {
    "start": "2025-01-01T00:00:00Z",
    "end": "2025-01-07T23:59:59Z"
  },
  "include_sections": [
    "quality_metrics",
    "user_analytics",
    "system_performance"
  ],
  "format": "pdf",
  "recipients": ["manager@gbase.ai"]
}
```

**响应**:
```json
{
  "report_id": "report_20250107_001",
  "status": "generating",
  "estimated_completion": "2025-01-07T11:05:00Z",
  "download_url": null
}
```

### E.4 报表下载
```http
GET /api/v1/reports/{reportId}
```

**功能**: 下载已生成的报表文件  
**响应**: 二进制文件流 (PDF/Excel/CSV)

### E.5 数据导出接口
```http
POST /api/v1/exports/data
```

**功能**: 导出原始数据用于分析  
**请求体**:
```json
{
  "data_type": "conversations",
  "filters": {
    "time_range": "7d",
    "resolution_status": "resolved",
    "user_type": "enterprise"
  },
  "format": "csv",
  "fields": ["session_id", "user_id", "resolution_time", "quality_score"]
}
```

---

## ⚙️ F类：配置管理API (P2优先级)

### F.1 仪表盘配置管理
```http
GET /api/v1/config/dashboard
PUT /api/v1/config/dashboard
```

**功能**: 获取或更新仪表盘配置  
**PUT请求体**:
```json
{
  "layout": [
    {
      "widget_id": "quality_score",
      "position": {"x": 0, "y": 0, "w": 6, "h": 4},
      "config": {
        "time_range": "24h",
        "show_trend": true
      }
    }
  ],
  "theme": "light",
  "refresh_interval": 30
}
```

### F.2 告警规则配置
```http
GET /api/v1/config/alerts
POST /api/v1/config/alerts
PUT /api/v1/config/alerts/{alertId}
```

**功能**: 管理告警规则  
**POST请求体**:
```json
{
  "name": "Resolution Rate Drop",
  "condition": {
    "metric": "resolution_rate",
    "operator": "less_than",
    "threshold": 85.0,
    "duration": "5m"
  },
  "notifications": [
    {
      "type": "email",
      "recipients": ["team@gbase.ai"],
      "template": "quality_alert"
    }
  ],
  "severity": "warning",
  "enabled": true
}
```

### F.3 阈值配置管理
```http
GET /api/v1/config/thresholds
PUT /api/v1/config/thresholds
```

**功能**: 管理各项指标的阈值设置  
**PUT请求体**:
```json
{
  "resolution_rate": {
    "excellent": 95.0,
    "good": 90.0,
    "warning": 85.0,
    "critical": 80.0
  },
  "response_time": {
    "excellent": 100,
    "good": 200,
    "warning": 500,
    "critical": 1000
  }
}
```

### F.4 权限验证接口
```http
GET /api/v1/auth/permissions
```

**功能**: 验证当前用户权限  
**响应**:
```json
{
  "user_id": "admin_123",
  "role": "admin",
  "permissions": [
    "view_quality_metrics",
    "manage_alerts",
    "export_data",
    "configure_dashboard"
  ],
  "access_level": "full"
}
```

---

## 🔌 实时数据WebSocket接口

### 实时指标推送
```websocket
WS /ws/realtime/metrics
```

**功能**: 推送实时监控指标更新  
**消息格式**:
```json
{
  "type": "metric_update",
  "metric": "resolution_rate",
  "value": 87.3,
  "timestamp": "2025-01-07T11:00:00Z",
  "change": "+0.2"
}
```

### 实时告警推送
```websocket
WS /ws/realtime/alerts
```

**功能**: 推送实时告警信息  
**消息格式**:
```json
{
  "type": "alert",
  "level": "warning",
  "title": "Quality Score Below Threshold",
  "message": "Resolution rate dropped to 84.5%",
  "timestamp": "2025-01-07T11:00:00Z",
  "actions": ["investigate", "acknowledge"]
}
```

### 实时对话状态
```websocket
WS /ws/realtime/conversations
```

**功能**: 推送对话状态实时更新  
**消息格式**:
```json
{
  "type": "conversation_event",
  "event": "escalation",
  "session_id": "conv_123456",
  "details": {
    "reason": "complex_technical_issue",
    "agent_assigned": "human_agent_007"
  },
  "timestamp": "2025-01-07T11:00:00Z"
}
```

---

## 📝 通用接口规范

### 请求格式
- **基础URL**: `https://api.gbase.ai`
- **认证方式**: Bearer Token / API Key
- **内容类型**: `application/json`
- **字符编码**: UTF-8

### 响应格式
```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "timestamp": "2025-01-07T11:00:00Z",
  "request_id": "req_123456789"
}
```

### 错误处理
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Invalid time range parameter",
    "details": "Time range must be one of: 1h, 24h, 7d, 30d"
  },
  "timestamp": "2025-01-07T11:00:00Z",
  "request_id": "req_123456789"
}
```

### 通用参数
- **时间范围**: `timeRange=1h|24h|7d|30d|custom`
- **分页**: `page=1&limit=20&offset=0`
- **排序**: `sort_by=timestamp&sort_order=desc`
- **筛选**: `region=JP&status=active&category=technical`

### HTTP状态码
- **200**: 成功
- **400**: 请求参数错误
- **401**: 未授权访问
- **403**: 权限不足
- **404**: 资源不存在
- **429**: 请求频率限制
- **500**: 服务器内部错误

---

## 🚀 实施优先级

### 第一阶段 (1个月) - P0接口
- ✅ Session解决率接口
- ✅ 负反馈率接口  
- ✅ 人工转接率接口
- ✅ 综合质量得分接口
- ✅ 实时质量监控WebSocket

### 第二阶段 (2-3个月) - P1接口
- 📋 对话数据管理API (5个接口)
- 📋 用户行为分析API (5个接口)
- 📋 系统监控API (5个接口)

### 第三阶段 (4个月+) - P2接口  
- 📋 统计报表API (5个接口)
- 📋 配置管理API (4个接口)
- 📋 高级分析和预测功能

---

## 📊 接口性能要求

### 响应时间标准
- **实时指标接口**: < 100ms (P95)
- **统计分析接口**: < 500ms (P95)  
- **报表生成接口**: < 5s (同步) / < 30s (异步)
- **数据导出接口**: < 10s (小数据) / 异步处理 (大数据)

### 并发处理能力
- **峰值QPS**: 1000+ requests/second
- **并发用户**: 500+ simultaneous users  
- **WebSocket连接**: 1000+ concurrent connections

### 数据一致性
- **实时数据延迟**: < 5秒
- **统计数据延迟**: < 10分钟
- **历史数据**: 最终一致性

---

## 🔐 安全要求

### 认证授权
- **API密钥管理**: 支持密钥轮换和权限控制
- **JWT Token**: 支持Token过期和刷新机制
- **OAuth 2.0**: 支持第三方应用集成

### 数据保护
- **传输加密**: 全部接口使用HTTPS/WSS
- **数据脱敏**: 敏感用户数据自动脱敏
- **访问日志**: 完整的API访问审计日志

### 速率限制
- **通用接口**: 1000 requests/hour/user
- **实时接口**: 10 requests/second/user  
- **导出接口**: 10 requests/day/user

---

## 📈 监控指标

### 接口性能监控
- **响应时间分布**: P50, P95, P99
- **成功率**: 目标 > 99.9%
- **错误率分析**: 4xx, 5xx错误分类
- **吞吐量**: QPS统计和趋势

### 业务指标监控  
- **用户活跃度**: API调用用户数和频次
- **功能使用率**: 各接口调用占比
- **数据质量**: 数据完整性和准确性检查

---

## 📚 开发参考

### 技术栈建议
- **后端框架**: Spring Boot / FastAPI / Express.js
- **数据库**: PostgreSQL + Redis + InfluxDB
- **消息队列**: Apache Kafka / RabbitMQ
- **API网关**: Nginx / Kong / AWS API Gateway

### 开发工具
- **API文档**: Swagger/OpenAPI 3.0
- **测试工具**: Postman / Newman / Jest
- **监控工具**: Prometheus + Grafana
- **日志分析**: ELK Stack

---

**📞 联系方式**  
如有API接口相关问题，请联系开发团队：  
- **技术负责人**: [待定]
- **产品负责人**: [待定]  
- **邮箱**: dev-team@gbase.ai

---

**📄 文档更新历史**  
- **v1.0** (2025-01-07): 初版API接口需求清单
- **下个版本预告**: 详细的API Schema定义和示例代码