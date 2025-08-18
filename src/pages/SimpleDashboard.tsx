import React, { useState, useEffect, useCallback } from 'react';
import {
  Row,
  Col,
  Statistic,
  Typography,
  Spin,
  Alert,
  Button,
  Space,
  Card,
} from 'antd';
import {
  UsergroupDeleteOutlined,
  LineChartOutlined,
  RiseOutlined,
  AlertOutlined,
  ReloadOutlined,
  SettingOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { TrendChart, PieChart, GaugeChart } from '../components';
import { useQualityMetrics, useSystemHealth, useUserActivity } from '../hooks';

const { Title } = Typography;

const SimpleDashboard: React.FC = () => {
  const { t } = useTranslation(['common', 'quality']);
  
  // 状态管理
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);

  // 使用Hooks获取数据
  const {
    resolutionRate,
    negativeFeedback,
    escalationRate,
    qualityScore,
    loading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useQualityMetrics();

  const {
    data: systemHealth,
    loading: systemLoading,
    error: systemError,
    refetch: refetchSystem,
  } = useSystemHealth();

  const {
    data: userActivity,
    loading: userActivityLoading,
    error: userActivityError,
    refetch: refetchUserActivity,
  } = useUserActivity();

  const loading = metricsLoading || systemLoading || userActivityLoading;
  const error = metricsError || systemError || userActivityError;

  // 自动刷新
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        handleRefresh();
      }, refreshInterval * 1000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // 处理刷新
  const handleRefresh = useCallback(() => {
    refetchMetrics();
    refetchSystem();
    refetchUserActivity();
  }, [refetchMetrics, refetchSystem, refetchUserActivity]);

  if (error) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <Title level={2} className="mb-0">
            <DashboardOutlined className="mr-2" />
            {t('menu.dashboard')}
          </Title>
        </div>
        <Alert
          message="数据加载失败"
          description={error}
          type="error"
          showIcon
          action={
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              重试
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      {/* 头部控制栏 */}
      <div className="flex justify-between items-start mb-6">
        <Title level={2} className="mb-0">
          <DashboardOutlined className="mr-2" />
          {t('menu.dashboard')} - 增强版
        </Title>
        
        <Space>
          <Button 
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            刷新
          </Button>
          <Button 
            icon={<SettingOutlined />}
            type={autoRefresh ? 'primary' : 'default'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            自动刷新: {autoRefresh ? '开启' : '关闭'}
          </Button>
        </Space>
      </div>

      {/* 仪表板内容 */}
      <Spin spinning={loading}>
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('metrics.resolutionRate', { ns: 'quality' })}
                value={resolutionRate?.current || 0}
                suffix="%"
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
              <div className="text-sm text-gray-500 mt-2">
                目标: {resolutionRate?.target || 90}% ({resolutionRate?.change || '+0%'})
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('metrics.negativeFeedbackRate', { ns: 'quality' })}
                value={negativeFeedback?.current || 0}
                suffix="%"
                prefix={<LineChartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="text-sm text-gray-500 mt-2">
                目标: {negativeFeedback?.target || 5}% ({negativeFeedback?.change || '+0%'})
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('metrics.escalationRate', { ns: 'quality' })}
                value={escalationRate?.current || 0}
                suffix="%"
                prefix={<UsergroupDeleteOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
              <div className="text-sm text-gray-500 mt-2">
                目标: {escalationRate?.target || 15}% ({escalationRate?.change || '+0%'})
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="活跃用户"
                value={userActivity?.activeUsers?.daily || systemHealth?.throughput?.current || 0}
                prefix={<AlertOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
              <div className="text-sm text-gray-500 mt-2">
                在线用户数 (实时)
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mb-8">
          <Col span={16}>
            <Card title="质量指标趋势" className="h-96">
              <TrendChart
                data={[
                  {
                    name: 'Session解决率',
                    dates: resolutionRate?.trend?.map(item => 
                      new Date(item.date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
                    ) || [],
                    values: resolutionRate?.trend?.map(item => item.value) || [],
                    color: '#10b981',
                  },
                  {
                    name: '负反馈率', 
                    dates: negativeFeedback?.trend?.map(item =>
                      new Date(item.date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
                    ) || [],
                    values: negativeFeedback?.trend?.map(item => item.value) || [],
                    color: '#ef4444',
                  },
                ]}
                height={320}
                loading={metricsLoading}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="AI质量得分" className="h-96">
              <GaugeChart
                value={qualityScore?.overall || 0}
                height={320}
                colors={['#ef4444', '#f59e0b', '#10b981']}
                loading={metricsLoading}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card title="负反馈原因分析">
              <PieChart
                data={negativeFeedback?.reasons?.map(reason => ({
                  name: reason.name,
                  value: reason.value,
                })) || []}
                height={300}
                loading={metricsLoading}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="人工转接原因分析">
              <PieChart
                data={escalationRate?.reasons?.map(reason => ({
                  name: reason.name,
                  value: reason.value,
                })) || []}
                height={300}
                loading={metricsLoading}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default SimpleDashboard;