import React from 'react';
import { Row, Col, Statistic, Progress, Space, Typography, Divider } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { getStatusColor, getResourceStatus, getResponseTimeStatus } from '../../../hooks/useSystemOverview';
import type { RealtimeDataResponse, SystemHealthResponse } from '../../../types/api';

const { Text } = Typography;

interface RealtimeMetricsProps {
  data: RealtimeDataResponse | null;
  systemHealth: SystemHealthResponse | null;
}

const RealtimeMetrics: React.FC<RealtimeMetricsProps> = ({ data, systemHealth }) => {
  if (!data || !systemHealth) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Text type="secondary">暂无实时数据</Text>
      </div>
    );
  }

  const renderTrendIcon = (change: string) => {
    const isPositive = change.startsWith('+');
    return isPositive ? (
      <RiseOutlined style={{ color: '#52c41a', marginLeft: 4 }} />
    ) : (
      <FallOutlined style={{ color: '#f5222d', marginLeft: 4 }} />
    );
  };

  const formatChange = (change: string) => {
    return change.replace(/[+-]/, '');
  };

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* 活跃用户数 */}
        <Col xs={12} lg={6}>
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <Statistic
              title="活跃用户"
              value={data.metrics.activeUsers?.value || 0}
              precision={0}
              valueStyle={{ fontSize: '20px', color: '#1890ff' }}
              prefix={<UserOutlined />}
            />
            <Space>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {formatChange(data.metrics.activeUsers?.change || '0%')}
              </Text>
              {renderTrendIcon(data.metrics.activeUsers?.change || '0%')}
            </Space>
          </div>
        </Col>

        {/* 响应时间 */}
        <Col xs={12} lg={6}>
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <Statistic
              title="响应时间"
              value={systemHealth.responseTime.avg}
              suffix="ms"
              precision={0}
              valueStyle={{ 
                fontSize: '20px', 
                color: getStatusColor(getResponseTimeStatus(systemHealth.responseTime.avg))
              }}
              prefix={<ClockCircleOutlined />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              P95: {systemHealth.responseTime.p95}ms
            </Text>
          </div>
        </Col>

        {/* 错误率 */}
        <Col xs={12} lg={6}>
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <Statistic
              title="错误率"
              value={systemHealth.errorRate}
              suffix="%"
              precision={2}
              valueStyle={{ 
                fontSize: '20px', 
                color: systemHealth.errorRate > 1 ? getStatusColor('critical') : 
                       systemHealth.errorRate > 0.5 ? getStatusColor('warning') : 
                       getStatusColor('normal')
              }}
              prefix={<ExclamationCircleOutlined />}
            />
            <Space>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {formatChange(data.metrics.errorRate?.change || '0%')}
              </Text>
              {renderTrendIcon(data.metrics.errorRate?.change || '0%')}
            </Space>
          </div>
        </Col>

        {/* 吞吐量 */}
        <Col xs={12} lg={6}>
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <Statistic
              title="请求/秒"
              value={systemHealth.throughput.current}
              precision={0}
              valueStyle={{ fontSize: '20px', color: '#722ed1' }}
              prefix={<ThunderboltOutlined />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              峰值: {systemHealth.throughput.peak}
            </Text>
          </div>
        </Col>
      </Row>

      <Divider style={{ margin: '16px 0' }} />

      {/* 资源使用率进度条 */}
      <Row gutter={[16, 12]}>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text strong style={{ fontSize: '13px' }}>CPU 使用率</Text>
              <Text style={{ fontSize: '13px', color: getStatusColor(getResourceStatus(systemHealth.resources.cpu)) }}>
                {systemHealth.resources.cpu}%
              </Text>
            </div>
            <Progress
              percent={systemHealth.resources.cpu}
              strokeColor={getStatusColor(getResourceStatus(systemHealth.resources.cpu))}
              trailColor="#f0f0f0"
              strokeWidth={8}
              showInfo={false}
            />
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text strong style={{ fontSize: '13px' }}>内存使用率</Text>
              <Text style={{ fontSize: '13px', color: getStatusColor(getResourceStatus(systemHealth.resources.memory)) }}>
                {systemHealth.resources.memory}%
              </Text>
            </div>
            <Progress
              percent={systemHealth.resources.memory}
              strokeColor={getStatusColor(getResourceStatus(systemHealth.resources.memory))}
              trailColor="#f0f0f0"
              strokeWidth={8}
              showInfo={false}
            />
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text strong style={{ fontSize: '13px' }}>磁盘使用率</Text>
              <Text style={{ fontSize: '13px', color: getStatusColor(getResourceStatus(systemHealth.resources.disk)) }}>
                {systemHealth.resources.disk}%
              </Text>
            </div>
            <Progress
              percent={systemHealth.resources.disk}
              strokeColor={getStatusColor(getResourceStatus(systemHealth.resources.disk))}
              trailColor="#f0f0f0"
              strokeWidth={8}
              showInfo={false}
            />
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text strong style={{ fontSize: '13px' }}>网络使用率</Text>
              <Text style={{ fontSize: '13px', color: getStatusColor(getResourceStatus(systemHealth.resources.network)) }}>
                {systemHealth.resources.network}%
              </Text>
            </div>
            <Progress
              percent={systemHealth.resources.network}
              strokeColor={getStatusColor(getResourceStatus(systemHealth.resources.network))}
              trailColor="#f0f0f0"
              strokeWidth={8}
              showInfo={false}
            />
          </div>
        </Col>
      </Row>

      {/* 系统概况 */}
      <div style={{ 
        marginTop: 16, 
        padding: '12px 16px', 
        background: '#fafafa', 
        borderRadius: 6,
        border: '1px solid #f0f0f0'
      }}>
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Text type="secondary" style={{ fontSize: '12px' }}>可用性</Text>
            <div>
              <Text strong style={{ color: getStatusColor('normal') }}>
                {systemHealth.availability.toFixed(2)}%
              </Text>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <Text type="secondary" style={{ fontSize: '12px' }}>运行时间</Text>
            <div>
              <Text strong style={{ color: getStatusColor('normal') }}>
                {systemHealth.uptime.toFixed(2)}%
              </Text>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <Text type="secondary" style={{ fontSize: '12px' }}>平均响应</Text>
            <div>
              <Text strong>{systemHealth.responseTime.avg}ms</Text>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <Text type="secondary" style={{ fontSize: '12px' }}>处理能力</Text>
            <div>
              <Text strong style={{ color: '#722ed1' }}>
                {systemHealth.throughput.avg}/s
              </Text>
            </div>
          </Col>
        </Row>
      </div>

      {/* 更新时间 */}
      <div style={{ textAlign: 'right', marginTop: 12 }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          最后更新: {new Date(data.timestamp).toLocaleTimeString()}
        </Text>
      </div>
    </div>
  );
};

export default RealtimeMetrics;