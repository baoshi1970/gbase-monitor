import React from 'react';
import { List, Badge, Typography, Space, Empty, Tag, Timeline } from 'antd';
import {
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface AlertsPanelProps {
  alerts?: {
    critical: number;
    warning: number;
    info: number;
  };
  events: Array<{
    id: string;
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
    metadata?: { source?: string };
  }>;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, events }) => {
  const getEventIcon = (type: 'info' | 'warning' | 'error') => {
    switch (type) {
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'info':
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getEventColor = (type: 'info' | 'warning' | 'error') => {
    switch (type) {
      case 'error':
        return '#f5222d';
      case 'warning':
        return '#faad14';
      case 'info':
      default:
        return '#1890ff';
    }
  };

  const getEventBadgeStatus = (type: 'info' | 'warning' | 'error') => {
    switch (type) {
      case 'error':
        return 'error' as const;
      case 'warning':
        return 'warning' as const;
      case 'info':
      default:
        return 'processing' as const;
    }
  };

  const formatTime = (timestamp: string) => {
    const now = dayjs();
    const eventTime = dayjs(timestamp);
    const diffMinutes = now.diff(eventTime, 'minute');
    
    if (diffMinutes < 1) {
      return '刚刚';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分钟前`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}小时前`;
    } else {
      return eventTime.format('MM-DD HH:mm');
    }
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 告警统计 */}
      {alerts && (
        <div style={{ 
          marginBottom: 16, 
          padding: '12px 16px', 
          background: '#fafafa', 
          borderRadius: 6,
          border: '1px solid #f0f0f0'
        }}>
          <Title level={5} style={{ margin: 0, marginBottom: 8, fontSize: '14px' }}>
            活动告警
          </Title>
          <Space size={16} wrap>
            <Badge 
              status="error" 
              text={
                <Space size={4}>
                  <Text style={{ fontSize: '12px' }}>严重</Text>
                  <Tag color="red" size="small" style={{ margin: 0 }}>
                    {alerts.critical}
                  </Tag>
                </Space>
              }
            />
            <Badge 
              status="warning" 
              text={
                <Space size={4}>
                  <Text style={{ fontSize: '12px' }}>警告</Text>
                  <Tag color="orange" size="small" style={{ margin: 0 }}>
                    {alerts.warning}
                  </Tag>
                </Space>
              }
            />
            <Badge 
              status="processing" 
              text={
                <Space size={4}>
                  <Text style={{ fontSize: '12px' }}>信息</Text>
                  <Tag color="blue" size="small" style={{ margin: 0 }}>
                    {alerts.info}
                  </Tag>
                </Space>
              }
            />
          </Space>
        </div>
      )}

      {/* 事件列表 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ marginBottom: 8 }}>
          <Title level={5} style={{ margin: 0, fontSize: '14px' }}>
            最新事件
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 'normal', marginLeft: 8 }}>
              ({sortedEvents.length}条)
            </Text>
          </Title>
        </div>
        
        <div style={{ height: 'calc(100% - 32px)', overflowY: 'auto' }}>
          {sortedEvents.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无事件"
              style={{ padding: '20px 0' }}
            />
          ) : (
            <Timeline
              mode="left"
              items={sortedEvents.slice(0, 10).map((event) => ({
                dot: getEventIcon(event.type),
                color: getEventColor(event.type),
                children: (
                  <div style={{ paddingBottom: 8 }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: 4 
                    }}>
                      <Text style={{ fontSize: '13px', lineHeight: '18px' }}>
                        {event.message}
                      </Text>
                      <Badge 
                        status={getEventBadgeStatus(event.type)} 
                        size="small"
                        style={{ flexShrink: 0, marginLeft: 8 }}
                      />
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Space size={4}>
                        <ClockCircleOutlined style={{ fontSize: '10px', color: '#bfbfbf' }} />
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {formatTime(event.timestamp)}
                        </Text>
                      </Space>
                      {event.metadata?.source && (
                        <Tag size="small" color="default" style={{ margin: 0, fontSize: '10px' }}>
                          {event.metadata.source}
                        </Tag>
                      )}
                    </div>
                  </div>
                ),
              }))}
            />
          )}
        </div>
      </div>

      {/* 底部状态 */}
      <div style={{
        marginTop: 12,
        padding: '8px 12px',
        background: alerts && (alerts.critical > 0 || alerts.warning > 0) ? '#fff7e6' : '#f6ffed',
        borderRadius: 4,
        border: `1px solid ${alerts && (alerts.critical > 0 || alerts.warning > 0) ? '#ffe58f' : '#b7eb8f'}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size={4}>
            {alerts && alerts.critical > 0 ? (
              <ExclamationCircleOutlined style={{ color: '#f5222d', fontSize: '12px' }} />
            ) : alerts && alerts.warning > 0 ? (
              <WarningOutlined style={{ color: '#faad14', fontSize: '12px' }} />
            ) : (
              <InfoCircleOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
            )}
            <Text style={{ fontSize: '11px' }}>
              {alerts && alerts.critical > 0 
                ? '系统存在严重告警' 
                : alerts && alerts.warning > 0 
                ? '系统存在警告' 
                : '系统运行正常'}
            </Text>
          </Space>
          <Text type="secondary" style={{ fontSize: '10px' }}>
            {dayjs().format('HH:mm:ss')} 更新
          </Text>
        </div>
      </div>
    </div>
  );
};

export default AlertsPanel;