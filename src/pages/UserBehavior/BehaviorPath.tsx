import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Spin,
  Alert,
  Button,
  Space,
  Tag,
  Select,
  Statistic,
  message,
  Steps,
  Timeline,
  Progress,
  Tooltip,
} from 'antd';
import {
  NodeIndexOutlined,
  BranchesOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { TrendChart, BarChart } from '../../components/Charts';
import TimeRangeSelector, { type TimeRangeValue } from '../../components/TimeRangeSelector';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

// 模拟用户行为路径数据
interface BehaviorStep {
  step: string;
  users: number;
  percentage: number;
  averageTime: number;
  dropRate: number;
}

interface UserJourney {
  id: string;
  name: string;
  description: string;
  steps: BehaviorStep[];
  conversionRate: number;
  averageDuration: number;
}

interface BehaviorPathData {
  journeys: UserJourney[];
  commonPaths: {
    path: string[];
    users: number;
    percentage: number;
    successRate: number;
  }[];
  dropOffPoints: {
    step: string;
    dropRate: number;
    users: number;
  }[];
  pageViews: {
    page: string;
    views: number;
    uniqueUsers: number;
    averageTime: number;
  }[];
}

const BehaviorPath: React.FC = () => {
  // 时间范围状态
  const [timeRange, setTimeRange] = useState<TimeRangeValue>({
    startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    preset: 'last7days',
  });

  // 筛选状态
  const [selectedJourney, setSelectedJourney] = useState<string>('onboarding');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');

  // 模拟加载状态
  const [loading, setLoading] = useState(false);

  // 模拟数据
  const mockData: BehaviorPathData = {
    journeys: [
      {
        id: 'onboarding',
        name: '用户注册流程',
        description: '新用户从注册到首次使用的完整路径',
        steps: [
          { step: '访问注册页', users: 1000, percentage: 100, averageTime: 30, dropRate: 0 },
          { step: '填写基本信息', users: 850, percentage: 85, averageTime: 120, dropRate: 15 },
          { step: '邮箱验证', users: 720, percentage: 72, averageTime: 45, dropRate: 15.3 },
          { step: '完善资料', users: 650, percentage: 65, averageTime: 180, dropRate: 9.7 },
          { step: '首次登录', users: 580, percentage: 58, averageTime: 60, dropRate: 10.8 },
          { step: '功能引导', users: 520, percentage: 52, averageTime: 240, dropRate: 10.3 },
          { step: '首次使用', users: 450, percentage: 45, averageTime: 300, dropRate: 13.5 },
        ],
        conversionRate: 45,
        averageDuration: 975, // 总用时（秒）
      },
      {
        id: 'conversion',
        name: '付费转化流程',
        description: '用户从免费试用到付费购买的转化路径',
        steps: [
          { step: '试用开始', users: 500, percentage: 100, averageTime: 0, dropRate: 0 },
          { step: '功能探索', users: 450, percentage: 90, averageTime: 600, dropRate: 10 },
          { step: '高级功能试用', users: 350, percentage: 70, averageTime: 900, dropRate: 22.2 },
          { step: '查看定价', users: 280, percentage: 56, averageTime: 180, dropRate: 20 },
          { step: '联系销售', users: 200, percentage: 40, averageTime: 300, dropRate: 28.6 },
          { step: '提交订单', users: 150, percentage: 30, averageTime: 420, dropRate: 25 },
          { step: '完成付费', users: 120, percentage: 24, averageTime: 240, dropRate: 20 },
        ],
        conversionRate: 24,
        averageDuration: 2640,
      },
      {
        id: 'support',
        name: '客服求助流程',
        description: '用户遇到问题寻求客服帮助的行为路径',
        steps: [
          { step: '遇到问题', users: 300, percentage: 100, averageTime: 0, dropRate: 0 },
          { step: '查看帮助文档', users: 240, percentage: 80, averageTime: 300, dropRate: 20 },
          { step: '搜索FAQ', users: 180, percentage: 60, averageTime: 180, dropRate: 25 },
          { step: '提交工单', users: 120, percentage: 40, averageTime: 420, dropRate: 33.3 },
          { step: '等待回复', users: 110, percentage: 36.7, averageTime: 7200, dropRate: 8.3 },
          { step: '问题解决', users: 95, percentage: 31.7, averageTime: 600, dropRate: 13.6 },
        ],
        conversionRate: 31.7,
        averageDuration: 8700,
      },
    ],
    commonPaths: [
      {
        path: ['首页', '产品介绍', '定价页面', '注册'],
        users: 450,
        percentage: 25.2,
        successRate: 78.5,
      },
      {
        path: ['首页', '登录', '仪表盘', '使用功能'],
        users: 380,
        percentage: 21.3,
        successRate: 92.1,
      },
      {
        path: ['搜索结果', '产品页', '试用申请'],
        users: 320,
        percentage: 17.9,
        successRate: 65.3,
      },
      {
        path: ['社交媒体', '博客文章', '首页', '注册'],
        users: 280,
        percentage: 15.7,
        successRate: 58.9,
      },
    ],
    dropOffPoints: [
      { step: '邮箱验证', dropRate: 15.3, users: 130 },
      { step: '首次使用', dropRate: 13.5, users: 70 },
      { step: '完善资料', dropRate: 9.7, users: 70 },
      { step: '功能引导', dropRate: 10.3, users: 60 },
    ],
    pageViews: [
      { page: '首页', views: 8500, uniqueUsers: 7200, averageTime: 45 },
      { page: '产品介绍', views: 5200, uniqueUsers: 4800, averageTime: 120 },
      { page: '定价页面', views: 3200, uniqueUsers: 2800, averageTime: 90 },
      { page: '登录页面', views: 2800, uniqueUsers: 2400, averageTime: 30 },
      { page: '注册页面', views: 1200, uniqueUsers: 1000, averageTime: 180 },
    ],
  };

  // 处理刷新
  const handleRefresh = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('用户行为路径数据刷新成功');
    } catch (err) {
      message.error('数据刷新失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理时间范围变化
  const handleTimeRangeChange = (newTimeRange: TimeRangeValue) => {
    setTimeRange(newTimeRange);
  };

  // 处理数据导出
  const handleExport = () => {
    const exportData = {
      timeRange,
      selectedJourney,
      selectedSegment,
      data: mockData,
      exportTime: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `behavior-path-analysis-${dayjs().format('YYYY-MM-DD')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    message.success('用户行为路径分析数据已导出');
  };

  // 获取选中的用户旅程
  const selectedJourneyData = mockData.journeys.find(j => j.id === selectedJourney) || mockData.journeys[0];

  // 计算转化漏斗数据
  const funnelData = selectedJourneyData.steps.map((step, index) => ({
    ...step,
    conversionRate: index === 0 ? 100 : (step.users / selectedJourneyData.steps[0].users) * 100,
  }));

  return (
    <div>
      {/* 页面标题和操作栏 */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <Title level={2} className="mb-2">
            用户行为路径分析
          </Title>
          <Text type="secondary" className="text-base">
            分析用户在产品中的行为路径，优化用户体验和转化流程
          </Text>
        </div>
        <Space>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            disabled={loading}
          >
            导出路径分析
          </Button>
          <Button 
            icon={<ReloadOutlined spin={loading} />} 
            onClick={handleRefresh}
            loading={loading}
          >
            刷新数据
          </Button>
        </Space>
      </div>

      {/* 时间范围和筛选器 */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-6">
          <TimeRangeSelector
            value={timeRange}
            onChange={handleTimeRangeChange}
          />
          
          <Space>
            <Text className="text-gray-600 font-medium">用户旅程:</Text>
            <Select
              value={selectedJourney}
              onChange={setSelectedJourney}
              style={{ width: 160 }}
            >
              <Option value="onboarding">用户注册流程</Option>
              <Option value="conversion">付费转化流程</Option>
              <Option value="support">客服求助流程</Option>
            </Select>
          </Space>

          <Space>
            <Text className="text-gray-600 font-medium">用户群体:</Text>
            <Select
              value={selectedSegment}
              onChange={setSelectedSegment}
              style={{ width: 120 }}
            >
              <Option value="all">全部用户</Option>
              <Option value="new">新用户</Option>
              <Option value="returning">老用户</Option>
              <Option value="enterprise">企业用户</Option>
            </Select>
          </Space>
        </div>
      </Card>

      <Spin spinning={loading}>
        {/* 关键指标概览 */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="整体转化率"
                value={selectedJourneyData.conversionRate}
                suffix="%"
                prefix={<NodeIndexOutlined />}
                precision={1}
                valueStyle={{ 
                  color: selectedJourneyData.conversionRate >= 50 ? '#52c41a' : 
                         selectedJourneyData.conversionRate >= 30 ? '#faad14' : '#ff4d4f'
                }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="平均完成时间"
                value={Math.round(selectedJourneyData.averageDuration / 60)}
                suffix="分钟"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="流程步骤数"
                value={selectedJourneyData.steps.length}
                prefix={<BranchesOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="起始用户数"
                value={selectedJourneyData.steps[0]?.users || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 用户旅程漏斗和步骤详情 */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} lg={16}>
            <Card title={`${selectedJourneyData.name} - 转化漏斗`}>
              <div className="mb-4">
                <Text type="secondary">{selectedJourneyData.description}</Text>
              </div>
              
              {/* 漏斗可视化 */}
              <div className="space-y-4">
                {funnelData.map((step, index) => {
                  const width = step.conversionRate;
                  const isDropOff = index > 0 && step.dropRate > 10;
                  
                  return (
                    <div key={step.step} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <Text strong>{step.step}</Text>
                          {isDropOff && (
                            <Tooltip title={`流失率较高: ${step.dropRate.toFixed(1)}%`}>
                              <ExclamationCircleOutlined className="text-red-500" />
                            </Tooltip>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <Text>
                            {step.users.toLocaleString()} 用户
                          </Text>
                          <Text type="secondary">
                            {step.averageTime}s
                          </Text>
                          <Text strong style={{ color: width >= 80 ? '#52c41a' : width >= 50 ? '#faad14' : '#ff4d4f' }}>
                            {width.toFixed(1)}%
                          </Text>
                        </div>
                      </div>
                      
                      <div className="relative bg-gray-100 rounded-lg h-12 overflow-hidden">
                        <div 
                          className={`h-full rounded-lg flex items-center justify-center text-white font-medium transition-all duration-500 ${
                            width >= 80 ? 'bg-green-500' : width >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.max(width, 10)}%` }}
                        >
                          {width.toFixed(1)}%
                        </div>
                        {index < funnelData.length - 1 && step.dropRate > 0 && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <Tag color="red" size="small">
                              流失 {step.dropRate.toFixed(1)}%
                            </Tag>
                          </div>
                        )}
                      </div>
                      
                      {index < funnelData.length - 1 && (
                        <div className="flex justify-center mt-2">
                          <ArrowRightOutlined className="text-gray-400 transform rotate-90" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="流程优化建议" className="h-full">
              <div className="space-y-4">
                {/* 主要流失点 */}
                <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
                  <div className="flex items-center mb-1">
                    <ExclamationCircleOutlined className="text-red-500 mr-1" />
                    <Text strong className="text-red-800">主要流失点</Text>
                  </div>
                  {selectedJourneyData.steps
                    .filter(step => step.dropRate > 10)
                    .slice(0, 2)
                    .map(step => (
                      <div key={step.step} className="text-red-700 text-sm">
                        • {step.step}: {step.dropRate.toFixed(1)}% 流失
                      </div>
                    ))}
                </div>

                {/* 优化建议 */}
                <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <div className="flex items-center mb-1">
                    <InfoCircleOutlined className="text-blue-500 mr-1" />
                    <Text strong className="text-blue-800">优化建议</Text>
                  </div>
                  <div className="space-y-1 text-blue-700 text-sm">
                    {selectedJourney === 'onboarding' && (
                      <>
                        <div>• 简化邮箱验证流程</div>
                        <div>• 优化首次使用引导</div>
                        <div>• 减少注册表单字段</div>
                      </>
                    )}
                    {selectedJourney === 'conversion' && (
                      <>
                        <div>• 提供更多试用功能</div>
                        <div>• 优化定价页面设计</div>
                        <div>• 增加客户成功案例</div>
                      </>
                    )}
                    {selectedJourney === 'support' && (
                      <>
                        <div>• 改善帮助文档搜索</div>
                        <div>• 增加实时聊天支持</div>
                        <div>• 优化FAQ内容</div>
                      </>
                    )}
                  </div>
                </div>

                {/* 转化率评估 */}
                <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                  <div className="flex items-center mb-1">
                    <CheckCircleOutlined className="text-green-500 mr-1" />
                    <Text strong className="text-green-800">转化率评估</Text>
                  </div>
                  <Text className="text-green-700 text-sm">
                    当前转化率 {selectedJourneyData.conversionRate.toFixed(1)}%
                    {selectedJourneyData.conversionRate >= 50 
                      ? '，表现优秀' 
                      : selectedJourneyData.conversionRate >= 30 
                        ? '，有提升空间' 
                        : '，需要重点优化'}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 常见路径和页面流量 */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} lg={12}>
            <Card title="用户常见路径">
              <div className="space-y-4">
                {mockData.commonPaths.map((path, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Text strong>路径 {index + 1}</Text>
                      <div className="flex items-center space-x-2">
                        <Tag color="blue">{path.users} 用户</Tag>
                        <Tag color="green">{path.successRate.toFixed(1)}% 成功率</Tag>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      {path.path.map((step, stepIndex) => (
                        <React.Fragment key={stepIndex}>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {step}
                          </span>
                          {stepIndex < path.path.length - 1 && (
                            <ArrowRightOutlined className="text-gray-400" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="mt-2">
                      <Progress 
                        percent={path.successRate} 
                        strokeColor={path.successRate >= 70 ? '#52c41a' : path.successRate >= 50 ? '#faad14' : '#ff4d4f'}
                        format={() => `${path.percentage.toFixed(1)}% 用户选择`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="页面流量分析">
              <div className="space-y-3">
                {mockData.pageViews.map((page, index) => (
                  <div key={page.page} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{page.page}</div>
                        <div className="text-sm text-gray-500">
                          平均停留: {page.averageTime}秒
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{page.views.toLocaleString()} 次访问</div>
                      <div className="text-sm text-gray-500">
                        {page.uniqueUsers.toLocaleString()} 独立用户
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {/* 流失点分析 */}
        <Card title="关键流失点分析">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <BarChart
                data={{
                  categories: mockData.dropOffPoints.map(point => point.step),
                  series: [{
                    name: '流失率',
                    data: mockData.dropOffPoints.map(point => point.dropRate),
                    color: '#ff4d4f',
                  }],
                }}
                height={300}
                yAxisFormatter={(value) => `${value}%`}
                loading={loading}
              />
            </Col>
            <Col xs={24} lg={8}>
              <div className="space-y-4">
                <Text strong className="block text-lg">流失点详情</Text>
                {mockData.dropOffPoints.map((point, index) => (
                  <div key={point.step} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Text strong>{point.step}</Text>
                      <Tag color="red">{point.dropRate.toFixed(1)}%</Tag>
                    </div>
                    <Text type="secondary">
                      {point.users} 用户在此步骤流失
                    </Text>
                    <Progress 
                      percent={point.dropRate * 5} // 放大显示
                      strokeColor="#ff4d4f"
                      showInfo={false}
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Card>
      </Spin>
    </div>
  );
};

export default BehaviorPath;