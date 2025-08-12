import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Spin,
  Alert,
  Select,
  Space,
  Tag,
  Timeline,
  List,
  Progress,
} from 'antd';
import {
  WarningOutlined,
  ExclamationCircleOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { TrendChart, PieChart } from '../../components';
import TimeRangeSelector, { type TimeRangeValue } from '../../components/TimeRangeSelector';
import { useNegativeFeedback } from '../../hooks';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const NegativeFeedback: React.FC = () => {
  
  // 时间范围状态
  const [timeRange, setTimeRange] = useState<TimeRangeValue>({
    startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    preset: 'last7days',
  });

  // 筛选状态
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  // 获取负反馈数据
  const {
    data,
    loading,
    error,
    refetch,
  } = useNegativeFeedback({
    ...timeRange,
    severity: selectedSeverity === 'all' ? undefined : selectedSeverity as any,
  });

  // 处理刷新
  const handleRefresh = () => {
    refetch();
  };

  // 处理时间范围变化
  const handleTimeRangeChange = (newTimeRange: TimeRangeValue) => {
    setTimeRange(newTimeRange);
  };

  if (error) {
    return (
      <div>
        <Title level={2} className="mb-8">
          负反馈率分析
        </Title>
        <Alert
          message="数据加载失败"
          description={error}
          type="error"
          showIcon
          action={
            <ReloadOutlined 
              onClick={handleRefresh}
              className="cursor-pointer hover:text-blue-500"
            />
          }
        />
      </div>
    );
  }

  return (
    <div>
      {/* 页面标题和控制栏 */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <Title level={2} className="mb-2">
            负反馈率分析
          </Title>
          <Text type="secondary" className="text-base">
            监控用户负反馈情况，分析反馈原因和改进方向
          </Text>
        </div>
        <ReloadOutlined 
          onClick={handleRefresh}
          className="text-lg cursor-pointer hover:text-blue-500 transition-colors"
          spin={loading}
        />
      </div>

      {/* 时间范围和筛选器 */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-6">
          <TimeRangeSelector
            value={timeRange}
            onChange={handleTimeRangeChange}
          />
          
          <Space>
            <Text className="text-gray-600 font-medium">严重程度:</Text>
            <Select
              value={selectedSeverity}
              onChange={setSelectedSeverity}
              style={{ width: 100 }}
              options={[
                { label: '全部', value: 'all' },
                { label: '高', value: 'high' },
                { label: '中', value: 'medium' },
                { label: '低', value: 'low' },
              ]}
            />
          </Space>
        </div>
      </Card>

      <Spin spinning={loading}>
        {/* 核心指标卡片 */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="当前负反馈率"
                value={data?.current || 0}
                suffix="%"
                precision={1}
                prefix={
                  <WarningOutlined 
                    style={{ 
                      color: (data?.current || 0) > (data?.target || 5) ? '#ff4d4f' : '#52c41a'
                    }} 
                  />
                }
                valueStyle={{
                  color: (data?.current || 0) > (data?.target || 5) ? '#cf1322' : '#3f8600'
                }}
              />
              <div className="mt-2">
                <Tag color={(data?.change?.startsWith('-') ? 'green' : 'red')}>
                  {data?.change || '+0%'}
                </Tag>
                <Text type="secondary" className="ml-2">
                  vs 上期
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="目标控制线"
                value={data?.target || 5}
                suffix="%"
                precision={1}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="mt-2">
                <Progress
                  percent={data ? Math.min((data.current / data.target) * 100, 100) : 0}
                  showInfo={false}
                  strokeColor={(data?.current || 0) > (data?.target || 5) ? '#ff4d4f' : '#52c41a'}
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <div className="flex justify-between">
                <div>
                  <Statistic
                    title="严重程度分布"
                    value={data?.severityDistribution?.find(s => s.severity === 'high')?.count || 0}
                    prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                    valueStyle={{ color: '#ff4d4f', fontSize: '16px' }}
                  />
                  <div className="text-xs text-gray-500">高严重度</div>
                </div>
                <div className="text-right">
                  <div className="text-orange-500 font-semibold">
                    {data?.severityDistribution?.find(s => s.severity === 'medium')?.count || 0}
                  </div>
                  <div className="text-xs text-gray-500">中等</div>
                  <div className="text-green-500 font-semibold mt-1">
                    {data?.severityDistribution?.find(s => s.severity === 'low')?.count || 0}
                  </div>
                  <div className="text-xs text-gray-500">低</div>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="反馈总数"
                value={data?.reasons?.reduce((sum, reason) => sum + reason.value, 0) || 0}
                prefix={<LineChartOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
              <div className="text-sm text-gray-500 mt-2">
                统计期间总反馈数
              </div>
            </Card>
          </Col>
        </Row>

        {/* 趋势分析和原因分析 */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col span={16}>
            <Card title="负反馈率趋势" className="h-96">
              <TrendChart
                data={[
                  {
                    name: '负反馈率',
                    dates: data?.trend?.map(item => 
                      dayjs(item.date).format('MM/DD')
                    ) || [],
                    values: data?.trend?.map(item => item.value) || [],
                    color: '#ff4d4f',
                  },
                  {
                    name: '目标线',
                    dates: data?.trend?.map(item => 
                      dayjs(item.date).format('MM/DD')
                    ) || [],
                    values: new Array(data?.trend?.length || 0).fill(data?.target || 5),
                    color: '#52c41a',
                  },
                ]}
                height={320}
                yAxisFormatter={(value) => `${value}%`}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="反馈原因分布" className="h-96">
              <PieChart
                data={data?.reasons?.map(reason => ({
                  name: reason.name,
                  value: reason.value,
                })) || []}
                height={320}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        {/* 原因详细分析和时间线 */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card 
              title="反馈原因详细分析"
              extra={<PieChartOutlined />}
            >
              <List
                dataSource={data?.reasons || []}
                loading={loading}
                renderItem={(reason) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <div className="flex justify-between items-center">
                          <span>{reason.name}</span>
                          <div>
                            <Tag color="blue">{reason.value}次</Tag>
                            <Tag color="orange">{reason.percentage}%</Tag>
                          </div>
                        </div>
                      }
                    />
                    <Progress
                      percent={reason.percentage}
                      showInfo={false}
                      strokeColor={{
                        '0%': '#52c41a',
                        '50%': '#faad14', 
                        '100%': '#ff4d4f',
                      }}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card 
              title="反馈时间线"
              extra={<ClockCircleOutlined />}
            >
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Timeline
                  items={data?.timeline?.slice(0, 10).map(item => ({
                    dot: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
                    children: (
                      <div>
                        <div className="font-medium">
                          {dayjs(item.date).format('MM/DD')}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          反馈数量: {item.count}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.reasons.map((reason, index) => (
                            <Tag key={index}>
                              {reason}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    ),
                  })) || []}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default NegativeFeedback;