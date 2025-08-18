import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Spin,
  Alert,
  Button,
  Space,
  Tag,
  Tabs,
  Progress,
  message,
  Divider,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  ReloadOutlined,
  DownloadOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  HeartOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { TrendChart, BarChart, PieChart } from '../../components/Charts';
import TimeRangeSelector, { type TimeRangeValue } from '../../components/TimeRangeSelector';
import { useUserBehaviorAnalysis } from '../../hooks';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const UserBehaviorOverview: React.FC = () => {
  // 时间范围状态
  const [timeRange, setTimeRange] = useState<TimeRangeValue>({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    preset: 'last30days',
  });

  // 获取用户行为数据
  const {
    domainAnalysis,
    userActivity,
    loading,
    error,
    refetch,
  } = useUserBehaviorAnalysis({ timeRange });

  // 处理刷新
  const handleRefresh = async () => {
    try {
      await refetch();
      message.success('用户行为数据刷新成功');
    } catch (err) {
      message.error('数据刷新失败');
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
      domainAnalysis,
      userActivity,
      exportTime: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-behavior-analysis-${dayjs().format('YYYY-MM-DD')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    message.success('用户行为分析数据已导出');
  };

  // 计算用户增长率
  const calculateGrowthRate = (current: number, previous: number): string => {
    if (previous === 0) return '+0.0%';
    const growth = ((current - previous) / previous) * 100;
    return growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
  };

  // 获取用户类型图标
  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'new':
        return <EyeOutlined style={{ color: '#52c41a' }} />;
      case 'returning':
        return <HeartOutlined style={{ color: '#1890ff' }} />;
      case 'power':
        return <ThunderboltOutlined style={{ color: '#faad14' }} />;
      default:
        return <UserOutlined />;
    }
  };

  // 获取用户类型标签
  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'new':
        return '新用户';
      case 'returning':
        return '回访用户';
      case 'power':
        return '活跃用户';
      default:
        return type;
    }
  };

  if (error) {
    return (
      <div>
        <Title level={2} className="mb-8">
          用户行为分析总览
        </Title>
        <Alert
          message="数据加载失败"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={handleRefresh}>
              重试
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      {/* 页面标题和操作栏 */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <Title level={2} className="mb-2">
            用户行为分析总览
          </Title>
          <Text type="secondary" className="text-base">
            深入分析用户活跃度、域名分布和行为模式
          </Text>
        </div>
        <Space>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            disabled={loading}
          >
            导出分析报告
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

      {/* 时间范围选择器 */}
      <Card className="mb-6">
        <TimeRangeSelector
          value={timeRange}
          onChange={handleTimeRangeChange}
        />
      </Card>

      <Spin spinning={loading}>
        {/* 核心指标概览 */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={8} lg={6}>
            <Card>
              <Statistic
                title="月活跃用户"
                value={userActivity?.activeUsers.monthly || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="mt-2">
                <Tag color="blue">
                  {calculateGrowthRate(
                    userActivity?.activeUsers.monthly || 0, 
                    Math.floor((userActivity?.activeUsers.monthly || 0) * 0.9)
                  )}
                </Tag>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={8} lg={6}>
            <Card>
              <Statistic
                title="日活跃用户"
                value={userActivity?.activeUsers.daily || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <div className="mt-2">
                <Tag color="green">
                  DAU/MAU: {userActivity ? 
                    ((userActivity.activeUsers.daily / userActivity.activeUsers.monthly) * 100).toFixed(1) 
                    : 0}%
                </Tag>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={8} lg={6}>
            <Card>
              <Statistic
                title="平均会话时长"
                value={userActivity?.sessionDuration.avg || 0}
                suffix="分钟"
                prefix={<ClockCircleOutlined />}
                precision={1}
                valueStyle={{ color: '#faad14' }}
              />
              <div className="mt-2">
                <Text type="secondary">
                  中位数: {userActivity?.sessionDuration.median || 0}分钟
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={8} lg={6}>
            <Card>
              <Statistic
                title="企业用户占比"
                value={domainAnalysis ? 
                  ((domainAnalysis.distribution.corporate / 
                    (domainAnalysis.distribution.corporate + domainAnalysis.distribution.freemail)) * 100) 
                  : 0}
                suffix="%"
                prefix={<BarChartOutlined />}
                precision={1}
                valueStyle={{ color: '#722ed1' }}
              />
              <div className="mt-2">
                <Text type="secondary">
                  企业域名数量: {domainAnalysis?.distribution.corporate || 0}
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 详细分析标签页 */}
        <Card>
          <Tabs defaultActiveKey="activity" size="large">
            {/* 用户活跃度分析 */}
            <TabPane tab="活跃度分析" key="activity">
              <Row gutter={[16, 16]}>
                {/* 用户类型分布 */}
                <Col xs={24} lg={8}>
                  <Card title="用户类型分布" className="h-96">
                    <div className="space-y-4">
                      {userActivity && Object.entries(userActivity.userTypes).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getUserTypeIcon(type)}
                            <span className="font-medium">{getUserTypeLabel(type)}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{count}</div>
                            <div className="text-xs text-gray-500">
                              {((count / Object.values(userActivity.userTypes).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </Col>

                {/* 每小时活跃度 */}
                <Col xs={24} lg={16}>
                  <Card title="24小时活跃度分布" className="h-96">
                    <BarChart
                      data={{
                        categories: userActivity?.activityByHour?.map(item => `${item.hour}:00`) || [],
                        series: [{
                          name: '活跃用户数',
                          data: userActivity?.activityByHour?.map(item => item.count) || [],
                          color: '#1890ff',
                        }],
                      }}
                      height={300}
                      loading={loading}
                    />
                  </Card>
                </Col>

                {/* 留存率分析 */}
                <Col xs={24} lg={12}>
                  <Card title="用户留存率" className="h-64">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <Text>1天留存率</Text>
                          <Text strong>{userActivity?.retentionRate.day1 || 0}%</Text>
                        </div>
                        <Progress 
                          percent={userActivity?.retentionRate.day1 || 0} 
                          strokeColor="#52c41a"
                          showInfo={false}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <Text>7天留存率</Text>
                          <Text strong>{userActivity?.retentionRate.day7 || 0}%</Text>
                        </div>
                        <Progress 
                          percent={userActivity?.retentionRate.day7 || 0} 
                          strokeColor="#1890ff"
                          showInfo={false}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <Text>30天留存率</Text>
                          <Text strong>{userActivity?.retentionRate.day30 || 0}%</Text>
                        </div>
                        <Progress 
                          percent={userActivity?.retentionRate.day30 || 0} 
                          strokeColor="#faad14"
                          showInfo={false}
                        />
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* 会话时长分布 */}
                <Col xs={24} lg={12}>
                  <Card title="会话时长分布" className="h-64">
                    <PieChart
                      data={userActivity?.sessionDuration.distribution?.map(item => ({
                        name: item.range,
                        value: item.count,
                      })) || []}
                      height={200}
                      loading={loading}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            {/* 域名分析 */}
            <TabPane tab="域名分析" key="domain">
              <Row gutter={[16, 16]}>
                {/* 域名类型分布 */}
                <Col xs={24} lg={8}>
                  <Card title="域名类型分布" className="h-96">
                    <PieChart
                      data={domainAnalysis ? [
                        { name: '企业域名', value: domainAnalysis.distribution.corporate },
                        { name: '免费邮箱', value: domainAnalysis.distribution.freemail },
                        { name: '教育机构', value: domainAnalysis.distribution.education },
                        { name: '政府机构', value: domainAnalysis.distribution.government },
                      ] : []}
                      height={300}
                      loading={loading}
                    />
                  </Card>
                </Col>

                {/* 热门企业域名 */}
                <Col xs={24} lg={16}>
                  <Card title="热门企业域名" className="h-96">
                    <div className="space-y-3" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                      {domainAnalysis?.topDomains?.slice(0, 10).map((domain, index) => (
                        <div key={domain.domain} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{domain.domain}</div>
                              {domain.industry && (
                                <Tag size="small" color="blue">{domain.industry}</Tag>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{domain.users} 用户</div>
                            <div className="text-sm text-gray-500">{domain.percentage}%</div>
                            <Tag color={domain.growth.startsWith('+') ? 'green' : 'red'} size="small">
                              {domain.growth}
                            </Tag>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </Col>

                {/* 域名趋势分析 */}
                <Col span={24}>
                  <Card title="域名类型趋势变化">
                    <TrendChart
                      data={[
                        {
                          name: '企业域名',
                          dates: domainAnalysis?.trends?.map(item => dayjs(item.date).format('MM/DD')) || [],
                          values: domainAnalysis?.trends?.map(item => item.corporate) || [],
                          color: '#1890ff',
                        },
                        {
                          name: '免费邮箱',
                          dates: domainAnalysis?.trends?.map(item => dayjs(item.date).format('MM/DD')) || [],
                          values: domainAnalysis?.trends?.map(item => item.freemail) || [],
                          color: '#52c41a',
                        },
                        {
                          name: '教育机构',
                          dates: domainAnalysis?.trends?.map(item => dayjs(item.date).format('MM/DD')) || [],
                          values: domainAnalysis?.trends?.map(item => item.education) || [],
                          color: '#faad14',
                        },
                        {
                          name: '政府机构',
                          dates: domainAnalysis?.trends?.map(item => dayjs(item.date).format('MM/DD')) || [],
                          values: domainAnalysis?.trends?.map(item => item.government) || [],
                          color: '#722ed1',
                        },
                      ]}
                      height={400}
                      loading={loading}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            {/* 行为洞察 */}
            <TabPane tab="行为洞察" key="insights">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="数据洞察与建议">
                    <div className="space-y-4">
                      {/* 活跃度洞察 */}
                      {userActivity && (
                        <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                          <div className="flex items-center mb-2">
                            <TeamOutlined className="text-blue-500 mr-2" />
                            <Text strong className="text-blue-800">用户活跃度分析</Text>
                          </div>
                          <Text className="text-blue-700">
                            当前DAU/MAU比值为 {((userActivity.activeUsers.daily / userActivity.activeUsers.monthly) * 100).toFixed(1)}%，
                            {((userActivity.activeUsers.daily / userActivity.activeUsers.monthly) * 100) >= 20 
                              ? '表现良好，用户粘性较强。' 
                              : '建议加强用户激活和留存策略。'}
                          </Text>
                        </div>
                      )}

                      {/* 留存率洞察 */}
                      {userActivity?.retentionRate && (
                        <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded">
                          <div className="flex items-center mb-2">
                            <HeartOutlined className="text-green-500 mr-2" />
                            <Text strong className="text-green-800">用户留存分析</Text>
                          </div>
                          <Text className="text-green-700">
                            7天留存率为 {userActivity.retentionRate.day7}%，
                            {userActivity.retentionRate.day7 >= 40 
                              ? '用户留存表现优秀，产品价值得到认可。' 
                              : '需要优化新用户引导流程和价值传递。'}
                          </Text>
                        </div>
                      )}

                      {/* 企业用户洞察 */}
                      {domainAnalysis && (
                        <div className="p-4 bg-purple-50 border-l-4 border-purple-400 rounded">
                          <div className="flex items-center mb-2">
                            <BarChartOutlined className="text-purple-500 mr-2" />
                            <Text strong className="text-purple-800">企业用户分析</Text>
                          </div>
                          <Text className="text-purple-700">
                            企业用户占比 {((domainAnalysis.distribution.corporate / (domainAnalysis.distribution.corporate + domainAnalysis.distribution.freemail)) * 100).toFixed(1)}%，
                            {((domainAnalysis.distribution.corporate / (domainAnalysis.distribution.corporate + domainAnalysis.distribution.freemail)) * 100) >= 30
                              ? '企业客户基础扎实，具备良好的付费潜力。'
                              : '可考虑加强B2B市场推广策略。'}
                          </Text>
                        </div>
                      )}

                      {/* 新域名发现 */}
                      {domainAnalysis?.newDomains && domainAnalysis.newDomains.length > 0 && (
                        <div className="p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
                          <div className="flex items-center mb-2">
                            <EyeOutlined className="text-orange-500 mr-2" />
                            <Text strong className="text-orange-800">新域名发现</Text>
                          </div>
                          <Text className="text-orange-700">
                            发现 {domainAnalysis.newDomains.length} 个新企业域名，
                            建议重点关注这些潜在的新客户群体。
                          </Text>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {domainAnalysis.newDomains.slice(0, 5).map(domain => (
                              <Tag key={domain.domain} color="orange">
                                {domain.domain} ({domain.users}用户)
                              </Tag>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Card>
      </Spin>
    </div>
  );
};

export default UserBehaviorOverview;