# 🔌 GBase AI监控系统 - API集成指南

## 📋 概述

本文档用于指导GBase AI监控系统与真实GBase API的集成工作。当前系统使用Mock数据进行开发，需要替换为真实的API调用以获取生产环境数据。

## 🎯 集成目标

将以下模块从Mock API切换到真实GBase API：
- 📊 质量指标分析模块
- 👥 用户行为分析模块  
- 🖥️ 系统监控模块
- 📋 报表管理模块

---

## 📋 需要提供的API信息

### 1. **API基础信息**

#### 必需信息：
- **API Base URL**  
  ```
  示例：https://api.gbase.com/v1 
  或：http://your-server:8080/api
  ```
- **API文档地址**  
  ```
  Swagger/OpenAPI文档链接（如果有）
  ```
- **API版本**  
  ```
  使用的API版本号
  ```

#### 环境信息：
- **开发环境API地址**：用于集成测试
- **生产环境API地址**：正式部署使用
- **测试数据范围**：可用于测试的数据时间范围

---

### 2. **认证机制**

#### 认证方式 (请选择一种)：
- [ ] **Bearer Token** - JWT令牌认证
- [ ] **API Key** - 静态密钥认证
- [ ] **Basic Auth** - 用户名密码认证
- [ ] **OAuth2** - OAuth2授权流程
- [ ] **其他** - 请说明具体方式

#### 认证详细信息：
```yaml
# Bearer Token 示例
认证方式: Bearer Token
登录端点: POST /auth/login
Token过期时间: 3600秒 (1小时)
刷新端点: POST /auth/refresh
请求头格式: Authorization: Bearer <token>

# API Key 示例  
认证方式: API Key
API密钥: your-api-key-here
请求头格式: X-API-Key: <api-key>
```

---

### 3. **API端点清单**

#### **3.1 质量指标API**

| 功能 | HTTP方法 | 端点 | 说明 |
|------|---------|------|------|
| Session解决率 | GET | `/quality/resolution-rate` | 获取Session解决率数据及趋势 |
| 负反馈率 | GET | `/quality/negative-feedback` | 获取负反馈率统计和原因分析 |
| 人工转接率 | GET | `/quality/escalation-rate` | 获取人工转接率和转接原因 |
| AI质量得分 | GET | `/quality/ai-score` | 获取AI服务质量综合得分 |

**请求参数示例**：
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31", 
  "granularity": "day",
  "category": "all"
}
```

#### **3.2 用户行为分析API**

| 功能 | HTTP方法 | 端点 | 说明 |
|------|---------|------|------|
| 用户活跃度 | GET | `/user-behavior/activity` | 获取用户活跃度统计 |
| 域名分析 | GET | `/user-behavior/domains` | 获取企业域名分布分析 |
| 行为路径 | GET | `/user-behavior/paths` | 获取用户行为路径数据 |
| 留存率分析 | GET | `/user-behavior/retention` | 获取用户留存率统计 |

#### **3.3 系统监控API**

| 功能 | HTTP方法 | 端点 | 说明 |
|------|---------|------|------|
| 系统健康状况 | GET | `/system/health` | 获取系统整体健康状态 |
| 实时监控数据 | GET | `/system/realtime` | 获取实时系统指标 |
| 资源使用情况 | GET | `/system/resources` | 获取CPU、内存等资源使用 |
| 服务状态 | GET | `/system/services` | 获取各服务运行状态 |

#### **3.4 报表管理API**

| 功能 | HTTP方法 | 端点 | 说明 |
|------|---------|------|------|
| 生成报表 | POST | `/reports/generate` | 提交报表生成任务 |
| 报表列表 | GET | `/reports/list` | 获取报表列表 |
| 报表详情 | GET | `/reports/:id` | 获取指定报表详情 |
| 下载报表 | GET | `/reports/download/:id` | 下载报表文件 |
| 删除报表 | DELETE | `/reports/:id` | 删除指定报表 |

---

### 4. **API请求/响应格式示例**

#### **4.1 质量指标API响应示例**

**请求**：
```http
GET /quality/resolution-rate?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**响应**：
```json
{
  "success": true,
  "data": {
    "current": 87.5,
    "target": 90.0,
    "change": "+2.3%",
    "trend": [
      {"date": "2024-01-01", "value": 85.2},
      {"date": "2024-01-02", "value": 86.1},
      {"date": "2024-01-03", "value": 87.5}
    ],
    "categoryBreakdown": [
      {"category": "技术支持", "rate": 92.1},
      {"category": "产品咨询", "rate": 83.7}
    ]
  },
  "message": "获取数据成功",
  "timestamp": "2024-01-31T10:30:00Z"
}
```

#### **4.2 用户行为API响应示例**

**请求**：
```http
GET /user-behavior/activity?timeRange=last_7d
Authorization: Bearer <token>
```

**响应**：
```json
{
  "success": true,
  "data": {
    "activeUsers": {
      "daily": 1234,
      "weekly": 8567,
      "monthly": 28901
    },
    "userTypes": {
      "new": 234,
      "returning": 789,
      "power": 211
    },
    "activityByHour": [
      {"hour": 0, "count": 45},
      {"hour": 1, "count": 23}
    ],
    "retentionRate": {
      "day1": 85.2,
      "day7": 72.1,
      "day30": 45.6
    }
  }
}
```

#### **4.3 错误响应格式**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "请求参数无效",
    "details": {
      "field": "startDate",
      "reason": "日期格式不正确"
    }
  },
  "timestamp": "2024-01-31T10:30:00Z"
}
```

---

## 🛠️ 技术实施计划

### **阶段1: 基础API服务搭建 (预计1-2小时)**

#### 1.1 创建API服务基础类
```typescript
// src/services/gbaseApi.ts
export class GBaseApiService {
  private baseURL: string;
  private authToken: string | null = null;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  // 认证方法
  async authenticate(credentials: LoginRequest): Promise<AuthResponse>
  async refreshToken(): Promise<TokenResponse>
  
  // HTTP请求基础方法
  private async request<T>(endpoint: string, options?: RequestOptions): Promise<T>
  private handleError(error: any): never
}
```

#### 1.2 环境配置更新
```env
# .env.development
VITE_API_BASE_URL=http://dev-api.gbase.com/v1
VITE_API_KEY=dev-api-key

# .env.production  
VITE_API_BASE_URL=https://api.gbase.com/v1
VITE_API_KEY=prod-api-key
```

#### 1.3 请求拦截器配置
- 自动添加认证头
- 统一错误处理
- 请求/响应日志记录
- Token自动刷新

### **阶段2: API接口逐步替换 (预计2-3小时)**

#### 2.1 质量指标API集成
- [ ] Session解决率接口
- [ ] 负反馈率接口  
- [ ] 人工转接率接口
- [ ] AI质量得分接口

#### 2.2 用户行为API集成
- [ ] 用户活跃度接口
- [ ] 域名分析接口
- [ ] 行为路径接口
- [ ] 留存率分析接口

#### 2.3 系统监控API集成
- [ ] 系统健康状况接口
- [ ] 实时监控数据接口
- [ ] 资源使用情况接口

#### 2.4 报表管理API集成
- [ ] 报表生成接口
- [ ] 报表列表接口
- [ ] 报表下载接口

### **阶段3: 优化与测试 (预计1小时)**

#### 3.1 错误处理优化
- 网络超时处理
- API限流处理
- 数据格式校验
- 友好错误提示

#### 3.2 性能优化
- 请求缓存策略
- 数据预加载
- 防抖和节流
- 分页加载优化

#### 3.3 测试验证
- API连通性测试
- 数据格式验证
- 错误场景测试
- 性能测试

---

## 📝 数据格式映射

### **当前Mock数据格式 → 真实API格式**

如果真实API的响应格式与当前Mock数据不同，我们将创建数据适配层：

```typescript
// src/adapters/apiAdapter.ts
export class ApiDataAdapter {
  // 将API响应转换为前端期望的格式
  static adaptResolutionRateData(apiResponse: any): ResolutionRateResponse {
    return {
      current: apiResponse.data.currentRate,
      target: apiResponse.data.targetRate,
      trend: apiResponse.data.trendData.map(item => ({
        date: item.timestamp,
        value: item.rate
      })),
      change: apiResponse.data.changePercentage
    };
  }
}
```

---

## 🚨 安全考虑

### **API安全最佳实践**
- [ ] **HTTPS强制**：所有API调用必须使用HTTPS
- [ ] **Token安全存储**：使用安全的存储方式（如httpOnly cookie）
- [ ] **请求签名**：如果API支持，添加请求签名验证
- [ ] **敏感信息过滤**：日志中过滤敏感信息
- [ ] **CORS配置**：确保跨域请求配置正确

### **错误信息处理**
- 生产环境中隐藏详细错误信息
- 不在前端暴露API密钥等敏感信息
- 统一的错误码处理机制

---

## ✅ 集成检查清单

### **集成前准备**
- [ ] 获得API基础信息（Base URL、认证方式）
- [ ] 获得API文档或接口清单
- [ ] 获得测试环境访问权限
- [ ] 确认API响应数据格式示例

### **开发阶段**
- [ ] 创建API服务基础架构
- [ ] 实现认证机制
- [ ] 逐个接口集成和测试
- [ ] 添加错误处理和重试机制
- [ ] 数据格式适配（如需要）

### **测试阶段** 
- [ ] API连通性测试
- [ ] 数据完整性验证
- [ ] 错误场景测试
- [ ] 性能基准测试
- [ ] 跨浏览器兼容性测试

### **部署阶段**
- [ ] 生产环境配置
- [ ] API监控和日志配置
- [ ] 性能监控设置
- [ ] 回滚方案准备

---

## 📞 联系与支持

### **集成过程中如需技术支持：**
- 🛠️ **技术实施**：前端开发团队负责具体实现
- 📋 **API对接**：需要后端API提供方配合
- 🐛 **问题排查**：提供详细错误日志和重现步骤
- 📊 **数据验证**：对比Mock数据与真实API数据的差异

### **常见问题解决**
- **跨域问题**：需要后端配置CORS或使用代理
- **认证失败**：检查API密钥和认证方式
- **数据格式不匹配**：创建数据适配层
- **性能问题**：优化请求频率和缓存策略

---

## 📊 进度追踪

| 模块 | 状态 | 预计完成时间 | 备注 |
|------|------|-------------|------|
| API基础服务 | ⏳ 待开始 | 1-2小时 | 需要先获得API信息 |
| 质量指标API | ⏳ 待开始 | 1小时 | 4个核心接口 |
| 用户行为API | ⏳ 待开始 | 1小时 | 4个分析接口 |
| 系统监控API | ⏳ 待开始 | 30分钟 | 3个监控接口 |
| 报表管理API | ⏳ 待开始 | 1小时 | 5个管理接口 |
| 测试优化 | ⏳ 待开始 | 1小时 | 全面测试和优化 |

**总预计时间：4.5-5.5小时**

---

*📝 本文档将根据API集成进度持续更新*  
*🔄 最后更新时间：2024-01-31*