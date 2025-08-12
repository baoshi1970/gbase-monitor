import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Badge, Alert, Spin, Button, Space, Typography } from 'antd';
import {
  AppstoreOutlined,
  ApiOutlined,
  DashboardOutlined,
  AlertOutlined,
  ReloadOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useSystemOverview, getStatusColor, getResourceStatus, getResponseTimeStatus } from '../../hooks/useSystemOverview';
import { useQualityMetrics } from '../../hooks/useQualityMetrics';
import SystemHealthChart from './components/SystemHealthChart';
import ServiceStatus from './components/ServiceStatus';
import RealtimeMetrics from './components/RealtimeMetrics';
import AlertsPanel from './components/AlertsPanel';
import './Overview.css';

const { Title, Text } = Typography;

const Overview: React.FC = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30秒

  // 系统概览数据
  const {
    systemHealth,
    realtimeData,
    loading: systemLoading,
    error: systemError,
    refetch: refetchSystem,
  } = useSystemOverview({
    realtimeMetrics: ['cpu', 'memory', 'activeUsers', 'responseTime', 'errorRate'],
    realtimeInterval: refreshInterval,
  });

  // 质量指标数据
  const {
    resolutionRate,
    negativeFeedback,
    escalationRate,
    qualityScore,
    loading: qualityLoading,
    error: qualityError,
    refetch: refetchQuality,
  } = useQualityMetrics();

  // 手动刷新
  const handleRefresh = async () => {
    await Promise.all([refetchSystem(), refetchQuality()]);
  };

  // 自动刷新控制
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchQuality();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetchQuality]);

  const loading = systemLoading || qualityLoading;
  const error = systemError || qualityError;

  // 渲染状态指示器
  const renderStatusIndicator = (status: 'normal' | 'warning' | 'critical', text: string) => {
    const iconMap = {
      normal: <CheckCircleOutlined style={{ color: getStatusColor('normal') }} />,
      warning: <ExclamationCircleOutlined style={{ color: getStatusColor('warning') }} />,
      critical: <CloseCircleOutlined style={{ color: getStatusColor('critical') }} />,
    };

    return (
      <Space>
        {iconMap[status]}
        <Text>{text}</Text>
      </Space>
    );
  };

  // 计算综合健康得分
  const calculateHealthScore = () => {
    if (!systemHealth) return 0;
    
    const uptimeScore = systemHealth.uptime;
    const errorScore = Math.max(0, 100 - systemHealth.errorRate * 1000);
    const responseScore = Math.max(0, 100 - (systemHealth.responseTime.avg / 10));
    
    return Math.round((uptimeScore + errorScore + responseScore) / 3);
  };

  if (error) {
    return (
      <div className="overview-container">
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
    <div className="overview-container">
      {/* 页面标题和操作栏 */}
      <div className="overview-header">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <DashboardOutlined className="page-icon" />
            系统概要总览
          </Title>
          <Text type="secondary">实时监控系统健康状况和核心指标</Text>
        </div>
        <Space>
          <Button 
            icon={<ReloadOutlined spin={loading} />} 
            onClick={handleRefresh}
            loading={loading}
          >
            刷新数据
          </Button>
          <Badge 
            status={autoRefresh ? 'processing' : 'default'} 
            text={autoRefresh ? '自动刷新' : '手动刷新'}
          />
        </Space>
      </div>

      <Spin spinning={loading}>
        {/* 核心指标卡片 */}
        <Row gutter={[16, 16]} className="overview-metrics">
          <Col xs={24} sm={12} lg={6}>
            <Card className="metric-card health-card">
              <Statistic
                title="系统健康得分"
                value={calculateHealthScore()}
                suffix="/100"
                precision={0}
                valueStyle={{ color: getStatusColor(calculateHealthScore() > 90 ? 'normal' : calculateHealthScore() > 70 ? 'warning' : 'critical') }}
                prefix={<AppstoreOutlined />}
              />
              <div className="metric-status">
                {renderStatusIndicator(
                  calculateHealthScore() > 90 ? 'normal' : calculateHealthScore() > 70 ? 'warning' : 'critical',
                  calculateHealthScore() > 90 ? '运行正常' : calculateHealthScore() > 70 ? '需要关注' : '需要处理'
                )}
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="metric-card uptime-card">
              <Statistic
                title="系统可用性"
                value={systemHealth?.uptime || 0}
                suffix="%"
                precision={2}
                valueStyle={{ color: getStatusColor('normal') }}
                prefix={<ApiOutlined />}
              />
              <div className="metric-trend">
                <RiseOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary">相比昨日</Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="metric-card quality-card">
              <Statistic
                title="AI质量得分"
                value={qualityScore?.overall || 0}
                suffix="/100"
                precision={1}
                valueStyle={{ color: getStatusColor('normal') }}
                prefix={<DashboardOutlined />}
              />
              <div className="metric-change">
                <Text type="secondary">{qualityScore?.change || '+0.0%'}</Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="metric-card alert-card">
              <Statistic
                title="告警数量"
                value={systemHealth?.alerts[0]?.critical || 0}
                valueStyle={{ 
                  color: (systemHealth?.alerts[0]?.critical || 0) > 0 ? getStatusColor('critical') : getStatusColor('normal')
                }}
                prefix={<AlertOutlined />}
              />
              <div className="alert-breakdown">
                <Space size={12}>
                  <Badge count={systemHealth?.alerts[0]?.warning || 0} color="orange" />
                  <Badge count={systemHealth?.alerts[0]?.info || 0} color="blue" />
                </Space>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 实时监控和服务状态 */}
        <Row gutter={[16, 16]} className="overview-monitoring">
          <Col xs={24} lg={16}>
            <Card title="实时系统监控" className="monitoring-card">
              <RealtimeMetrics 
                data={realtimeData} 
                systemHealth={systemHealth}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="服务状态" className="services-card">
              <ServiceStatus services={systemHealth?.services || []} />
            </Card>
          </Col>
        </Row>

        {/* 系统健康趋势 */}
        <Row gutter={[16, 16]} className="overview-charts">
          <Col xs={24} lg={16}>
            <Card title="系统健康趋势" className="trend-card">
              <SystemHealthChart 
                systemHealth={systemHealth}
                qualityMetrics={{
                  resolutionRate,
                  negativeFeedback,
                  escalationRate,
                  qualityScore,
                }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="告警和事件" className="alerts-card">
              <AlertsPanel 
                alerts={systemHealth?.alerts[0]}
                events={realtimeData?.events || []}
              />
            </Card>
          </Col>
        </Row>

        {/* 资源使用情况 */}
        <Row gutter={[16, 16]} className="overview-resources">
          <Col xs={24}>
            <Card title="资源使用情况" className="resources-card">
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <div className="resource-item">
                    <div className="resource-header">
                      <Text strong>CPU使用率</Text>
                      <Text>{systemHealth?.resources.cpu || 0}%</Text>
                    </div>
                    <Progress 
                      percent={systemHealth?.resources.cpu || 0}
                      strokeColor={getStatusColor(getResourceStatus(systemHealth?.resources.cpu || 0))}
                      showInfo={false}
                    />
                  </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <div className="resource-item">
                    <div className="resource-header">
                      <Text strong>内存使用率</Text>
                      <Text>{systemHealth?.resources.memory || 0}%</Text>
                    </div>
                    <Progress 
                      percent={systemHealth?.resources.memory || 0}
                      strokeColor={getStatusColor(getResourceStatus(systemHealth?.resources.memory || 0))}
                      showInfo={false}
                    />
                  </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <div className="resource-item">
                    <div className="resource-header">
                      <Text strong>磁盘使用率</Text>
                      <Text>{systemHealth?.resources.disk || 0}%</Text>
                    </div>
                    <Progress 
                      percent={systemHealth?.resources.disk || 0}
                      strokeColor={getStatusColor(getResourceStatus(systemHealth?.resources.disk || 0))}
                      showInfo={false}
                    />
                  </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <div className="resource-item">
                    <div className="resource-header">
                      <Text strong>网络使用率</Text>
                      <Text>{systemHealth?.resources.network || 0}%</Text>
                    </div>
                    <Progress 
                      percent={systemHealth?.resources.network || 0}
                      strokeColor={getStatusColor(getResourceStatus(systemHealth?.resources.network || 0))}
                      showInfo={false}
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Overview;