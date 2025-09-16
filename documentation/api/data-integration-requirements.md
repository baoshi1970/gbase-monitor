# GBase监控平台数据对接需求文档

## 1. 项目背景

GBase监控平台作为GBaseSupport产品的辅助监控系统，需要定期获取GBaseSupport的业务数据来实现北极星指标监控和质量分析功能。本文档旨在明确数据对接的具体需求和技术方案。

## 2. 核心监控指标

### 2.1 北极星指标
- **月度有效解决Session数** = 有效Session总数 × Session解决率
- **目标管理**：
  - 增长目标：Session数月度增长15%+
  - 质量目标：Session解决率稳定在85%+
  - 综合目标：有效解决Session数月度增长20%+

### 2.2 质量指标
- Session解决率（12/24/48小时维度）
- 平均首字符响应时间
- 用户反馈统计（点赞/点踩率）
- 转人工率

### 2.3 业务指标
- 每日活跃用户数
- 大客户专项监控（HIS-Mobile、AI-Inside）
- 90天累积转化率

## 3. 数据对接方案

### 3.1 推荐架构：轻度加工 + 原始备份

```
GBaseSupport原始数据 → 数据清洗ETL → 轻度加工数据 → 监控平台
                                  ↓
                              原始数据备份
```

### 3.2 数据获取层次

#### 原始数据层（完整保留）
- Session基础信息（ID、时间戳、用户ID、来源等）
- 消息记录（问题、回答、时间戳）
- 用户反馈（点赞、点踩、转人工标记）
- 系统日志（错误、响应时间等）

#### 轻度加工层（推荐重点）
- Session状态标记（有效/无效，完成/进行中）
- 基础指标计算（解决率、响应时间统计）
- 时间维度聚合（按小时、天、月预聚合）
- 用户企业域名解析

## 4. 数据同步需求

### 4.1 同步频率
- **实时数据**：5-15分钟同步（系统健康、活跃用户）
- **历史数据**：每小时同步（Session完成状态）
- **统计数据**：每日凌晨计算（北极星指标）

### 4.2 时间处理
- **时区标准**：零时区（UTC）
- **统计周期**：按自然月/日统计
- **支持查询**：未结束月份的实时数据

## 5. 有效Session定义

### 5.1 有效Session标准
- ✅ 有用户点赞的Session
- ✅ 正常完成对话的Session
- ✅ 无系统错误的Session

### 5.2 无效Session标准（优先级排序）
1. **用户点踩** - 最高优先级（即使有点赞也标记为无效）
2. **转人工处理** - 标记为无效
3. **有当月订正** - 追加到FAQ的问题标记为无效
4. **系统错误** - 回答字段为空、系统bug等
5. **测试数据** - 内部测试产生的Session

## 6. 需要的数据接口

### 6.1 实时监控接口
```http
GET /api/monitor/realtime/metrics
```

**响应数据：**
```json
{
  "active_users": 1234,
  "current_sessions": 56,
  "avg_response_time": 1200,
  "error_rate": 0.5,
  "timestamp": "2025-01-15T10:00:00Z"
}
```

### 6.2 Session汇总接口
```http
GET /api/monitor/sessions/summary?date=2025-01&processed=true
```

**响应数据：**
```json
{
  "date": "2025-01-15",
  "total_sessions": 1500,
  "valid_sessions": 1275,
  "resolved_sessions": 1084,
  "resolution_rate": 85.0,
  "avg_first_char_time": 1200,
  "user_feedback": {
    "thumbs_up": 890,
    "thumbs_down": 123,
    "escalated": 67
  }
}
```

### 6.3 北极星指标接口
```http
GET /api/monitor/north-star?month=2025-01
```

**响应数据：**
```json
{
  "month": "2025-01",
  "effective_resolved_sessions": 11475,
  "total_valid_sessions": 13500,
  "resolution_rate": 85.0,
  "growth_rate": 15.2,
  "daily_breakdown": [
    {
      "date": "2025-01-01",
      "effective_resolved": 800,
      "valid_sessions": 1000,
      "resolution_rate": 80.0
    }
  ]
}
```

### 6.4 大客户专项接口
```http
GET /api/monitor/enterprise?client=HIS-Mobile&date=2025-01-15
```

**响应数据：**
```json
{
  "client_name": "HIS-Mobile",
  "sessions": 234,
  "resolution_rate": 92.0,
  "avg_response_time": 800,
  "satisfaction_score": 4.7
}
```

## 7. 数据结构示例

### 7.1 Session汇总数据结构
```json
{
  "session_id": "sess_20250115_001",
  "start_time": "2025-01-15T10:00:00Z",
  "end_time": "2025-01-15T10:15:00Z",
  "user_id": "user_12345",
  "user_domain": "company.com",
  "client_type": "HIS-Mobile",
  "source": "web",
  "is_valid": true,
  "is_resolved": true,
  "resolution_type": "ai_direct",
  "feedback": "thumbs_up",
  "response_time_first_char": 1200,
  "message_count": 5,
  "escalated": false,
  "has_correction": false,
  "error_occurred": false
}
```

## 8. 权限和安全要求

### 8.1 API访问权限
- 监控平台使用专用API密钥
- 北极星指标API仅超级管理员可调用
- 数据传输使用HTTPS加密

### 8.2 数据脱敏
- 用户个人信息脱敏处理
- 仅保留业务分析必要的字段
- 企业信息仅保留域名后缀用于分组

## 9. 实施时间表

### Phase 1: 基础数据对接（优先级P0）
- [ ] 实时监控数据接口
- [ ] Session汇总数据接口
- [ ] 北极星指标计算逻辑

### Phase 2: 增强功能（优先级P1）
- [ ] 大客户专项监控
- [ ] 多时间维度解决率
- [ ] 响应时间细化统计

### Phase 3: 扩展功能（优先级P2）
- [ ] 转化率指标
- [ ] 多产品监控支持
- [ ] 告警体系预留

## 10. 技术支持需求

### 10.1 开发协调
- 需要GBaseSupport技术团队配合接口开发
- 建议建立定期沟通机制
- 数据格式和字段定义需要双方确认

### 10.2 测试环境
- 提供测试环境数据接口
- 支持数据回填测试
- 性能压力测试配合

## 11. 联系方式

**项目负责人**：[待填写]  
**技术对接人**：[待填写]  
**业务对接人**：水溶

---

**文档版本**：v1.0  
**更新日期**：2025-01-15  
**下次评审**：[待安排]