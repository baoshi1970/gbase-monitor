import React from 'react';
import { List, Badge, Typography, Space, Progress, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { getStatusColor } from '../../../hooks/useSystemOverview';

const { Text } = Typography;

interface ServiceStatusProps {
  services: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    uptime: number;
  }>;
}

const ServiceStatus: React.FC<ServiceStatusProps> = ({ services }) => {
  if (!services || services.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Text type="secondary">暂无服务状态数据</Text>
      </div>
    );
  }

  const getStatusIcon = (status: 'healthy' | 'degraded' | 'down') => {
    switch (status) {
      case 'healthy':
        return <CheckCircleOutlined style={{ color: getStatusColor('healthy') }} />;
      case 'degraded':
        return <ExclamationCircleOutlined style={{ color: getStatusColor('degraded') }} />;
      case 'down':
        return <CloseCircleOutlined style={{ color: getStatusColor('down') }} />;
      default:
        return <CheckCircleOutlined style={{ color: getStatusColor('healthy') }} />;
    }
  };

  const getStatusText = (status: 'healthy' | 'degraded' | 'down') => {
    switch (status) {
      case 'healthy':
        return '正常';
      case 'degraded':
        return '异常';
      case 'down':
        return '离线';
      default:
        return '未知';
    }
  };

  const getStatusBadgeStatus = (status: 'healthy' | 'degraded' | 'down') => {
    switch (status) {
      case 'healthy':
        return 'success' as const;
      case 'degraded':
        return 'warning' as const;
      case 'down':
        return 'error' as const;
      default:
        return 'default' as const;
    }
  };

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime <= 100) return getStatusColor('healthy');
    if (responseTime <= 300) return getStatusColor('degraded');
    return getStatusColor('down');
  };

  // 统计服务状态
  const healthyCount = services.filter(s => s.status === 'healthy').length;
  const degradedCount = services.filter(s => s.status === 'degraded').length;
  const downCount = services.filter(s => s.status === 'down').length;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 状态统计 */}
      <div style={{ 
        marginBottom: 16, 
        padding: '12px 16px', 
        background: '#fafafa', 
        borderRadius: 6,
        border: '1px solid #f0f0f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong style={{ fontSize: '14px' }}>服务总览</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            共 {services.length} 个服务
          </Text>
        </div>
        <div style={{ marginTop: 8 }}>
          <Space size={16}>
            <Badge 
              status="success" 
              text={
                <Text style={{ fontSize: '12px' }}>
                  正常 {healthyCount}
                </Text>
              }
            />
            <Badge 
              status="warning" 
              text={
                <Text style={{ fontSize: '12px' }}>
                  异常 {degradedCount}
                </Text>
              }
            />
            <Badge 
              status="error" 
              text={
                <Text style={{ fontSize: '12px' }}>
                  离线 {downCount}
                </Text>
              }
            />
          </Space>
        </div>
      </div>

      {/* 服务列表 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <List
          size="small"
          dataSource={services}
          renderItem={(service) => (
            <List.Item style={{ padding: '12px 0', border: 'none' }}>
              <div style={{ width: '100%' }}>
                {/* 服务名称和状态 */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 8
                }}>
                  <Space>
                    {getStatusIcon(service.status)}
                    <Text strong style={{ fontSize: '13px' }}>
                      {service.name}
                    </Text>
                  </Space>
                  <Badge 
                    status={getStatusBadgeStatus(service.status)} 
                    text={
                      <Text style={{ fontSize: '11px' }}>
                        {getStatusText(service.status)}
                      </Text>
                    }
                  />
                </div>

                {/* 性能指标 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Tooltip title="响应时间">
                    <Space size={4}>
                      <ClockCircleOutlined style={{ fontSize: '11px', color: '#8c8c8c' }} />
                      <Text style={{ 
                        fontSize: '11px',
                        color: getResponseTimeColor(service.responseTime)
                      }}>
                        {service.responseTime}ms
                      </Text>
                    </Space>
                  </Tooltip>
                  <Text style={{ fontSize: '11px', color: '#8c8c8c' }}>
                    运行时间: {service.uptime.toFixed(1)}%
                  </Text>
                </div>

                {/* 运行时间进度条 */}
                <Progress
                  percent={service.uptime}
                  strokeColor={getStatusColor(service.status)}
                  trailColor="#f0f0f0"
                  strokeWidth={4}
                  showInfo={false}
                  size="small"
                />
              </div>
            </List.Item>
          )}
        />
      </div>

      {/* 整体健康度 */}
      <div style={{
        marginTop: 16,
        padding: '12px 16px',
        background: healthyCount === services.length ? '#f6ffed' : 
                   downCount > 0 ? '#fff2e8' : '#fff7e6',
        borderRadius: 6,
        border: `1px solid ${
          healthyCount === services.length ? '#b7eb8f' :
          downCount > 0 ? '#ffd591' : '#ffe58f'
        }`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            {healthyCount === services.length ? (
              <CheckCircleOutlined style={{ color: getStatusColor('healthy') }} />
            ) : downCount > 0 ? (
              <CloseCircleOutlined style={{ color: getStatusColor('down') }} />
            ) : (
              <ExclamationCircleOutlined style={{ color: getStatusColor('degraded') }} />
            )}
            <Text strong style={{ fontSize: '12px' }}>
              {healthyCount === services.length ? '系统运行正常' :
               downCount > 0 ? '系统存在故障' : '系统运行异常'}
            </Text>
          </Space>
          <Text style={{ fontSize: '11px', color: '#8c8c8c' }}>
            {Math.round((healthyCount / services.length) * 100)}% 服务正常
          </Text>
        </div>
      </div>
    </div>
  );
};

export default ServiceStatus;