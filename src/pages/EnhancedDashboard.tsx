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
  Switch,
  Drawer,
  Form,
  Select,
  InputNumber,
  Divider,
  message,
} from 'antd';
import {
  UsergroupDeleteOutlined,
  LineChartOutlined,
  RiseOutlined,
  AlertOutlined,
  ReloadOutlined,
  SettingOutlined,
  DashboardOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { TrendChart, PieChart, GaugeChart } from '../components';
import { TimeRangeSelector, DashboardCard, RealTimeAlerts } from '../components';
import { useQualityMetrics, useSystemHealth, useUserActivity } from '../hooks';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

interface TimeRange {
  startDate: string;
  endDate: string;
  granularity: 'hour' | 'day' | 'week' | 'month';
}

interface DashboardLayout {
  cards: Array<{
    id: string;
    title: string;
    type: string;
    position: number;
    visible: boolean;
    span: number;
    height?: number;
  }>;
}

interface DashboardSettings {
  autoRefresh: boolean;
  refreshInterval: number;
  defaultTimeRange: string;
  compactMode: boolean;
  showAlerts: boolean;
}

const EnhancedDashboard: React.FC = () => {
  const { t } = useTranslation(['common', 'quality']);
  
  // 状态管理
  const [timeRange, setTimeRange] = useState<TimeRange>({
    startDate: dayjs().subtract(24, 'hour').toISOString(),
    endDate: dayjs().toISOString(),
    granularity: 'hour',
  });
  
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>({
    autoRefresh: true,
    refreshInterval: 30,
    defaultTimeRange: 'last_24h',
    compactMode: false,
    showAlerts: true,
  });

  const [layout, setLayout] = useState<DashboardLayout>({
    cards: [
      { id: 'resolution-rate', title: 'Session解决率', type: 'metric', position: 0, visible: true, span: 6 },
      { id: 'negative-feedback', title: '负反馈率', type: 'metric', position: 1, visible: true, span: 6 },
      { id: 'escalation-rate', title: '人工转接率', type: 'metric', position: 2, visible: true, span: 6 },
      { id: 'active-users', title: '活跃用户', type: 'metric', position: 3, visible: true, span: 6 },
      { id: 'quality-trend', title: '质量指标趋势', type: 'chart', position: 4, visible: true, span: 16, height: 400 },
      { id: 'quality-score', title: 'AI质量得分', type: 'gauge', position: 5, visible: true, span: 8, height: 400 },
      { id: 'alerts', title: '实时告警', type: 'alerts', position: 6, visible: true, span: 12, height: 400 },
      { id: 'feedback-reasons', title: '负反馈原因分析', type: 'pie', position: 7, visible: true, span: 12, height: 400 },
    ],
  });

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

  // 处理时间范围变化
  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range);
    // 这里可以传递时间范围给各个hooks
    message.info(`时间范围已更新: ${dayjs(range.startDate).format('MM-DD HH:mm')} - ${dayjs(range.endDate).format('MM-DD HH:mm')}`);
  }, []);

  // 卡片拖拽处理
  const handleCardDrop = useCallback((draggedId: string, targetId: string) => {
    setLayout(prev => {
      const newCards = [...prev.cards];
      const draggedIndex = newCards.findIndex(card => card.id === draggedId);
      const targetIndex = newCards.findIndex(card => card.id === targetId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedCard] = newCards.splice(draggedIndex, 1);
        newCards.splice(targetIndex, 0, draggedCard);
        
        // 更新position
        newCards.forEach((card, index) => {
          card.position = index;
        });
      }
      
      return { cards: newCards };
    });
    message.success('布局已更新');
  }, []);

  // 卡片可见性切换
  const handleCardVisibilityToggle = useCallback((cardId: string, visible: boolean) => {
    setLayout(prev => ({
      cards: prev.cards.map(card =>
        card.id === cardId ? { ...card, visible } : card
      ),
    }));
  }, []);

  // 卡片删除
  const handleCardRemove = useCallback((cardId: string) => {
    setLayout(prev => ({
      cards: prev.cards.filter(card => card.id !== cardId),
    }));
    message.success('卡片已删除');
  }, []);

  // 卡片标题修改
  const handleCardTitleChange = useCallback((cardId: string, title: string) => {
    setLayout(prev => ({
      cards: prev.cards.map(card =>
        card.id === cardId ? { ...card, title } : card
      ),
    }));
  }, []);

  // 保存设置
  const handleSaveSettings = useCallback(() => {
    // 这里可以保存到localStorage或发送到服务器
    localStorage.setItem('dashboardSettings', JSON.stringify(dashboardSettings));
    localStorage.setItem('dashboardLayout', JSON.stringify(layout));
    message.success('设置已保存');
    setSettingsVisible(false);
  }, [dashboardSettings, layout]);

  // 渲染卡片内容
  const renderCardContent = (card: DashboardLayout['cards'][0]) => {
    switch (card.type) {
      case 'metric':
        switch (card.id) {
          case 'resolution-rate':
            return (
              <Statistic
                title={t('metrics.resolutionRate', { ns: 'quality' })}
                value={resolutionRate?.current || 0}
                suffix="%"
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            );
          case 'negative-feedback':
            return (
              <Statistic
                title={t('metrics.negativeFeedbackRate', { ns: 'quality' })}
                value={negativeFeedback?.current || 0}
                suffix="%"
                prefix={<LineChartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            );
          case 'escalation-rate':
            return (
              <Statistic
                title={t('metrics.escalationRate', { ns: 'quality' })}
                value={escalationRate?.current || 0}
                suffix="%"
                prefix={<UsergroupDeleteOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            );
          case 'active-users':
            return (
              <Statistic
                title="活跃用户"
                value={userActivity?.activeUsers?.daily || 0}
                prefix={<AlertOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            );
          default:
            return <div>Metric not found</div>;
        }
      
      case 'chart':
        if (card.id === 'quality-trend') {
          return (
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
              height={(card.height || 300) - 60}
              loading={metricsLoading}
            />
          );
        }
        break;
      
      case 'gauge':
        if (card.id === 'quality-score') {
          return (
            <GaugeChart
              value={qualityScore?.overall || 0}
              height={(card.height || 300) - 60}
              colors={['#ef4444', '#f59e0b', '#10b981']}
              loading={metricsLoading}
            />
          );
        }
        break;
      
      case 'pie':
        if (card.id === 'feedback-reasons') {
          return (
            <PieChart
              data={negativeFeedback?.reasons?.map(reason => ({
                name: reason.name,
                value: reason.value,
              })) || []}
              height={(card.height || 300) - 60}
              loading={metricsLoading}
            />
          );
        }
        break;
      
      case 'alerts':
        if (card.id === 'alerts') {
          return (
            <RealTimeAlerts
              height={(card.height || 400) - 60}
              autoRefresh={autoRefresh}
              refreshInterval={refreshInterval * 1000}
            />
          );
        }
        break;
      
      default:
        return <div>Unknown card type</div>;
    }
  };

  if (error) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <Title level={2} className="mb-0">
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

  const sortedCards = layout.cards
    .filter(card => card.visible)
    .sort((a, b) => a.position - b.position);

  return (
    <div>
      {/* 头部控制栏 */}
      <div className="flex justify-between items-start mb-6">
        <Title level={2} className="mb-0">
          <DashboardOutlined className="mr-2" />
          {t('menu.dashboard')}
        </Title>
        
        <Space>
          <Button 
            icon={<SettingOutlined />}
            onClick={() => setSettingsVisible(true)}
          >
            设置
          </Button>
        </Space>
      </div>

      {/* 时间控制栏 */}
      <div className="bg-white rounded-lg p-4 mb-6 border">
        <TimeRangeSelector
          value={timeRange}
          onChange={handleTimeRangeChange}
          autoRefresh={autoRefresh}
          onAutoRefreshChange={setAutoRefresh}
          refreshInterval={refreshInterval}
          onRefreshIntervalChange={setRefreshInterval}
          onRefreshNow={handleRefresh}
        />
      </div>

      {/* 仪表板内容 */}
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {sortedCards.map((card) => (
            <Col
              key={card.id}
              xs={24}
              sm={card.span > 12 ? 24 : 12}
              lg={card.span}
              style={{ minHeight: card.height }}
            >
              <DashboardCard
                id={card.id}
                title={card.title}
                loading={loading}
                error={error}
                onDrop={handleCardDrop}
                onToggleVisibility={handleCardVisibilityToggle}
                onRemove={handleCardRemove}
                onTitleChange={handleCardTitleChange}
                style={{ height: card.height }}
              >
                {renderCardContent(card)}
              </DashboardCard>
            </Col>
          ))}
        </Row>
      </Spin>

      {/* 设置面板 */}
      <Drawer
        title="仪表板设置"
        placement="right"
        width={400}
        open={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        extra={
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveSettings}>
            保存设置
          </Button>
        }
      >
        <Form layout="vertical">
          <div className="space-y-6">
            <div>
              <Title level={5}>自动刷新</Title>
              <div className="flex items-center justify-between mb-2">
                <span>启用自动刷新</span>
                <Switch
                  checked={dashboardSettings.autoRefresh}
                  onChange={(autoRefresh) => 
                    setDashboardSettings(prev => ({ ...prev, autoRefresh }))
                  }
                />
              </div>
              <Form.Item label="刷新间隔 (秒)">
                <InputNumber
                  min={10}
                  max={600}
                  value={dashboardSettings.refreshInterval}
                  onChange={(refreshInterval) => 
                    setDashboardSettings(prev => ({ ...prev, refreshInterval: refreshInterval || 30 }))
                  }
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>

            <Divider />

            <div>
              <Title level={5}>默认设置</Title>
              <Form.Item label="默认时间范围">
                <Select
                  value={dashboardSettings.defaultTimeRange}
                  onChange={(defaultTimeRange) => 
                    setDashboardSettings(prev => ({ ...prev, defaultTimeRange }))
                  }
                  style={{ width: '100%' }}
                >
                  <Option value="last_hour">最近1小时</Option>
                  <Option value="last_24h">最近24小时</Option>
                  <Option value="last_7d">最近7天</Option>
                  <Option value="last_30d">最近30天</Option>
                </Select>
              </Form.Item>
              
              <div className="flex items-center justify-between mb-2">
                <span>紧凑模式</span>
                <Switch
                  checked={dashboardSettings.compactMode}
                  onChange={(compactMode) => 
                    setDashboardSettings(prev => ({ ...prev, compactMode }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span>显示告警面板</span>
                <Switch
                  checked={dashboardSettings.showAlerts}
                  onChange={(showAlerts) => 
                    setDashboardSettings(prev => ({ ...prev, showAlerts }))
                  }
                />
              </div>
            </div>

            <Divider />

            <div>
              <Title level={5}>卡片布局</Title>
              <div className="space-y-2">
                {layout.cards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-2 border rounded">
                    <span>{card.title}</span>
                    <Switch
                      checked={card.visible}
                      onChange={(visible) => handleCardVisibilityToggle(card.id, visible)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default EnhancedDashboard;