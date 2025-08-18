import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  List,
  Tag,
  Button,
  Badge,
  Tooltip,
  Empty,
  Switch,
  Drawer,
  Typography,
  Space,
  Divider,
  notification,
} from 'antd';
import {
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  BellOutlined,
  BellFilled,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  source: string;
  acknowledged: boolean;
  resolved: boolean;
  metadata?: Record<string, any>;
}

interface AlertsSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  types: {
    critical: boolean;
    warning: boolean;
    info: boolean;
  };
  sources: string[];
}

interface RealTimeAlertsProps {
  height?: number;
  maxItems?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const RealTimeAlerts: React.FC<RealTimeAlertsProps> = ({
  height = 400,
  maxItems = 10,
  autoRefresh = true,
  refreshInterval = 30000,
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settings, setSettings] = useState<AlertsSettings>({
    enabled: true,
    sound: true,
    desktop: false,
    types: {
      critical: true,
      warning: true,
      info: true,
    },
    sources: ['system', 'quality', 'user-behavior'],
  });

  // 模拟实时告警数据
  const mockAlerts: Alert[] = [
    {
      id: 'alert_001',
      type: 'critical',
      title: 'Session解决率异常下降',
      message: 'Session解决率在过去30分钟内下降了15%，当前值为72%，低于目标值85%',
      timestamp: dayjs().subtract(5, 'minute').toISOString(),
      source: 'quality',
      acknowledged: false,
      resolved: false,
      metadata: { metric: 'resolution_rate', current: 72, target: 85 },
    },
    {
      id: 'alert_002',
      type: 'warning',
      title: '负反馈率超过阈值',
      message: '负反馈率达到8.5%，超过警告阈值8%',
      timestamp: dayjs().subtract(12, 'minute').toISOString(),
      source: 'quality',
      acknowledged: true,
      resolved: false,
      metadata: { metric: 'negative_feedback', current: 8.5, threshold: 8 },
    },
    {
      id: 'alert_003',
      type: 'critical',
      title: '系统响应时间异常',
      message: '平均响应时间超过3秒，影响用户体验',
      timestamp: dayjs().subtract(18, 'minute').toISOString(),
      source: 'system',
      acknowledged: false,
      resolved: false,
      metadata: { metric: 'response_time', current: 3200, threshold: 2000 },
    },
    {
      id: 'alert_004',
      type: 'info',
      title: '新用户域名检测',
      message: '检测到50个新的企业域名，建议进行分类标记',
      timestamp: dayjs().subtract(25, 'minute').toISOString(),
      source: 'user-behavior',
      acknowledged: false,
      resolved: false,
      metadata: { type: 'new_domains', count: 50 },
    },
    {
      id: 'alert_005',
      type: 'warning',
      title: 'AI质量得分下降',
      message: 'AI质量得分在过去1小时内从91分下降到87分',
      timestamp: dayjs().subtract(35, 'minute').toISOString(),
      source: 'quality',
      acknowledged: true,
      resolved: true,
      metadata: { metric: 'quality_score', from: 91, to: 87 },
    },
  ];

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <ExclamationCircleOutlined className="text-red-500" />;
      case 'warning':
        return <WarningOutlined className="text-orange-500" />;
      case 'info':
        return <InfoCircleOutlined className="text-blue-500" />;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'red';
      case 'warning':
        return 'orange';
      case 'info':
        return 'blue';
    }
  };

  const getSourceName = (source: string) => {
    const sourceMap: Record<string, string> = {
      system: '系统监控',
      quality: '质量指标',
      'user-behavior': '用户行为',
    };
    return sourceMap[source] || source;
  };

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 过滤并排序告警
      const filteredAlerts = mockAlerts
        .filter(alert => {
          if (!settings.enabled) return false;
          if (!settings.types[alert.type]) return false;
          if (!settings.sources.includes(alert.source)) return false;
          return true;
        })
        .sort((a, b) => dayjs(b.timestamp).unix() - dayjs(a.timestamp).unix())
        .slice(0, maxItems);

      // 检查新告警并发送通知
      const newAlerts = filteredAlerts.filter(alert => 
        !alerts.find(existing => existing.id === alert.id) && 
        !alert.acknowledged &&
        dayjs(alert.timestamp).isAfter(dayjs().subtract(1, 'minute'))
      );

      if (newAlerts.length > 0 && alerts.length > 0) {
        newAlerts.forEach(alert => {
          showNotification(alert);
        });
      }

      setAlerts(filteredAlerts);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [settings, alerts, maxItems]);

  const showNotification = (alert: Alert) => {
    if (!settings.enabled) return;

    const config = {
      message: alert.title,
      description: alert.message,
      placement: 'topRight' as const,
      duration: alert.type === 'critical' ? 0 : 4.5,
      icon: getAlertIcon(alert.type),
    };

    if (alert.type === 'critical') {
      notification.error(config);
    } else if (alert.type === 'warning') {
      notification.warning(config);
    } else {
      notification.info(config);
    }

    // 桌面通知
    if (settings.desktop && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(alert.title, {
          body: alert.message,
          icon: '/favicon.ico',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(alert.title, {
              body: alert.message,
              icon: '/favicon.ico',
            });
          }
        });
      }
    }
  };

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  }, []);

  const clearAll = useCallback(() => {
    setAlerts([]);
  }, []);

  // 自动刷新
  useEffect(() => {
    fetchAlerts();
    
    if (autoRefresh) {
      const interval = setInterval(fetchAlerts, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchAlerts, autoRefresh, refreshInterval]);

  const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged && !alert.resolved).length;
  const criticalCount = alerts.filter(alert => alert.type === 'critical' && !alert.resolved).length;

  return (
    <>
      <div style={{ height }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge count={unacknowledgedCount} offset={[5, 0]}>
              {criticalCount > 0 ? (
                <BellFilled className="text-red-500 text-lg" />
              ) : (
                <BellOutlined className="text-gray-500 text-lg" />
              )}
            </Badge>
            <span className="font-medium">实时告警</span>
            {criticalCount > 0 && (
              <Tag color="red" className="ml-2">
                {criticalCount} 个严重告警
              </Tag>
            )}
          </div>
          
          <Space>
            <Tooltip title="刷新">
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={fetchAlerts}
                loading={loading}
              />
            </Tooltip>
            <Tooltip title="设置">
              <Button
                size="small"
                icon={<SettingOutlined />}
                onClick={() => setSettingsVisible(true)}
              />
            </Tooltip>
            {alerts.length > 0 && (
              <Button size="small" onClick={clearAll}>
                清空
              </Button>
            )}
          </Space>
        </div>

        {alerts.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无告警信息"
          />
        ) : (
          <List
            className="alert-list"
            style={{ height: height - 60, overflowY: 'auto' }}
            dataSource={alerts}
            renderItem={(alert) => (
              <List.Item
                className={`alert-item ${alert.resolved ? 'resolved' : ''} ${
                  alert.acknowledged ? 'acknowledged' : ''
                }`}
                actions={[
                  !alert.acknowledged && !alert.resolved && (
                    <Tooltip title="确认" key="ack">
                      <Button
                        type="text"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={() => acknowledgeAlert(alert.id)}
                      />
                    </Tooltip>
                  ),
                  !alert.resolved && (
                    <Tooltip title="解决" key="resolve">
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseCircleOutlined />}
                        onClick={() => resolveAlert(alert.id)}
                      />
                    </Tooltip>
                  ),
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={getAlertIcon(alert.type)}
                  title={
                    <div className="flex items-center justify-between">
                      <span className={alert.resolved ? 'line-through text-gray-400' : ''}>
                        {alert.title}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Tag color={getAlertColor(alert.type)} size="small">
                          {alert.type}
                        </Tag>
                        <Tag size="small">{getSourceName(alert.source)}</Tag>
                        {alert.acknowledged && <Tag color="green" size="small">已确认</Tag>}
                        {alert.resolved && <Tag color="gray" size="small">已解决</Tag>}
                      </div>
                    </div>
                  }
                  description={
                    <div>
                      <div className={alert.resolved ? 'text-gray-400' : 'text-gray-600'}>
                        {alert.message}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {dayjs(alert.timestamp).format('MM-DD HH:mm:ss')} · {dayjs(alert.timestamp).fromNow()}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {/* 设置面板 */}
      <Drawer
        title="告警设置"
        placement="right"
        width={300}
        open={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      >
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Text strong>启用告警</Text>
              <Switch
                checked={settings.enabled}
                onChange={(enabled) => setSettings(prev => ({ ...prev, enabled }))}
              />
            </div>
            <Text type="secondary" className="text-sm">
              关闭后将不再显示和推送告警
            </Text>
          </div>

          <Divider />

          <div>
            <Text strong className="block mb-3">通知方式</Text>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Text>浏览器通知</Text>
                <Switch
                  checked={settings.sound}
                  onChange={(sound) => setSettings(prev => ({ ...prev, sound }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Text>桌面通知</Text>
                <Switch
                  checked={settings.desktop}
                  onChange={(desktop) => setSettings(prev => ({ ...prev, desktop }))}
                />
              </div>
            </div>
          </div>

          <Divider />

          <div>
            <Text strong className="block mb-3">告警类型</Text>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ExclamationCircleOutlined className="text-red-500" />
                  <Text>严重</Text>
                </div>
                <Switch
                  checked={settings.types.critical}
                  onChange={(critical) => setSettings(prev => ({
                    ...prev,
                    types: { ...prev.types, critical }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <WarningOutlined className="text-orange-500" />
                  <Text>警告</Text>
                </div>
                <Switch
                  checked={settings.types.warning}
                  onChange={(warning) => setSettings(prev => ({
                    ...prev,
                    types: { ...prev.types, warning }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <InfoCircleOutlined className="text-blue-500" />
                  <Text>信息</Text>
                </div>
                <Switch
                  checked={settings.types.info}
                  onChange={(info) => setSettings(prev => ({
                    ...prev,
                    types: { ...prev.types, info }
                  }))}
                />
              </div>
            </div>
          </div>

          <Divider />

          <div>
            <Text strong className="block mb-3">告警来源</Text>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Text>系统监控</Text>
                <Switch
                  checked={settings.sources.includes('system')}
                  onChange={(checked) => {
                    setSettings(prev => ({
                      ...prev,
                      sources: checked 
                        ? [...prev.sources, 'system']
                        : prev.sources.filter(s => s !== 'system')
                    }));
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <Text>质量指标</Text>
                <Switch
                  checked={settings.sources.includes('quality')}
                  onChange={(checked) => {
                    setSettings(prev => ({
                      ...prev,
                      sources: checked 
                        ? [...prev.sources, 'quality']
                        : prev.sources.filter(s => s !== 'quality')
                    }));
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <Text>用户行为</Text>
                <Switch
                  checked={settings.sources.includes('user-behavior')}
                  onChange={(checked) => {
                    setSettings(prev => ({
                      ...prev,
                      sources: checked 
                        ? [...prev.sources, 'user-behavior']
                        : prev.sources.filter(s => s !== 'user-behavior')
                    }));
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Drawer>

      <style jsx>{`
        .alert-list .alert-item {
          transition: all 0.2s;
          border-radius: 6px;
          margin-bottom: 8px;
          padding: 12px;
          border: 1px solid #f0f0f0;
        }
        
        .alert-list .alert-item:hover {
          background-color: #fafafa;
        }
        
        .alert-list .alert-item.acknowledged {
          background-color: #f6ffed;
          border-color: #b7eb8f;
        }
        
        .alert-list .alert-item.resolved {
          background-color: #f5f5f5;
          border-color: #d9d9d9;
        }
      `}</style>
    </>
  );
};

export default RealTimeAlerts;