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
  List,
  Progress,
} from 'antd';
import {
  UserSwitchOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  BarChartOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { TrendChart, BarChart, PieChart } from '../../components';
import TimeRangeSelector, { type TimeRangeValue } from '../../components/TimeRangeSelector';
import { useEscalationRate } from '../../hooks';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const EscalationRate: React.FC = () => {
  
  // 时间范围状态
  const [timeRange, setTimeRange] = useState<TimeRangeValue>({
    startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    preset: 'last7days',
  });

  // 筛选状态
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');

  // 获取转接率数据
  const {
    data,
    loading,
    error,
    refetch,
  } = useEscalationRate({
    ...timeRange,
    urgency: selectedUrgency === 'all' ? undefined : selectedUrgency as any,
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
          人工转接率分析
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
            人工转接率分析
          </Title>
          <Text type="secondary" className="text-base">
            监控AI对话转接到人工客服的情况，分析转接原因和处理效率
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
            <Text className="text-gray-600 font-medium">紧急程度:</Text>
            <Select
              value={selectedUrgency}
              onChange={setSelectedUrgency}
              style={{ width: 100 }}
              options={[
                { label: '全部', value: 'all' },
                { label: '紧急', value: 'critical' },
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
                title="当前转接率"
                value={data?.current || 0}
                suffix="%"
                precision={1}
                prefix={
                  <UserSwitchOutlined 
                    style={{ 
                      color: (data?.current || 0) > (data?.target || 15) ? '#ff4d4f' : '#52c41a'
                    }} 
                  />
                }
                valueStyle={{
                  color: (data?.current || 0) > (data?.target || 15) ? '#cf1322' : '#3f8600'
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
                value={data?.target || 15}
                suffix="%"
                precision={1}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="mt-2">
                <Progress
                  percent={data ? Math.min((data.current / data.target) * 100, 100) : 0}
                  showInfo={false}
                  strokeColor={(data?.current || 0) > (data?.target || 15) ? '#ff4d4f' : '#52c41a'}
                />
                <Text type="secondary" className="text-xs">
                  {(data?.current || 0) > (data?.target || 15) ? '超出目标' : '符合预期'}
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="平均处理时间"
                value={data?.avgResolutionTime || 0}
                suffix="分钟"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
              <div className="text-sm text-gray-500 mt-2">
                人工客服处理时长
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <div className="flex justify-between">
                <div>
                  <Statistic
                    title="紧急转接"
                    value={data?.urgencyDistribution?.find(u => u.urgency === 'critical')?.count || 0}
                    prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                    valueStyle={{ color: '#ff4d4f', fontSize: '16px' }}
                  />
                  <div className="text-xs text-gray-500">需立即处理</div>
                </div>
                <div className="text-right">
                  <div className="text-orange-500 font-semibold">
                    {data?.urgencyDistribution?.find(u => u.urgency === 'high')?.count || 0}
                  </div>
                  <div className="text-xs text-gray-500">高优先级</div>
                  <div className="text-green-500 font-semibold mt-1">
                    {data?.urgencyDistribution?.find(u => u.urgency === 'medium')?.count || 0}
                  </div>
                  <div className="text-xs text-gray-500">常规处理</div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 趋势分析和转接高峰时段 */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col span={16}>
            <Card title="转接率趋势分析" className="h-96">
              <TrendChart
                data={[
                  {
                    name: '转接率',
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
                    values: new Array(data?.trend?.length || 0).fill(data?.target || 15),
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
            <Card title="转接高峰时段" className="h-96">
              <BarChart
                data={{
                  categories: data?.peakHours?.map(item => `${item.hour}:00`) || [],
                  series: [{
                    name: '转接次数',
                    data: data?.peakHours?.map(item => item.count) || [],
                    color: '#1890ff',
                  }],
                }}
                height={320}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        {/* 转接原因分析和紧急程度分布 */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card 
              title="转接原因详细分析"
              extra={<BarChartOutlined />}
            >
              <List
                dataSource={data?.reasons || []}
                loading={loading}
                renderItem={(reason) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserSwitchOutlined className="text-blue-500" />
                        </div>
                      }
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
            <Card title="紧急程度分布">
              <div className="mb-4">
                <PieChart
                  data={data?.urgencyDistribution?.map(item => ({
                    name: item.urgency === 'critical' ? '紧急' : 
                          item.urgency === 'high' ? '高' :
                          item.urgency === 'medium' ? '中' : '低',
                    value: item.count,
                  })) || []}
                  height={200}
                  loading={loading}
                />
              </div>
              
              <div className="space-y-3">
                {data?.urgencyDistribution?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        item.urgency === 'critical' ? 'bg-red-500' :
                        item.urgency === 'high' ? 'bg-orange-500' :
                        item.urgency === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <span className="font-medium">
                        {item.urgency === 'critical' ? '紧急' : 
                         item.urgency === 'high' ? '高优先级' :
                         item.urgency === 'medium' ? '中等' : '低优先级'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{item.count}</div>
                      <div className="text-xs text-gray-500">次转接</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default EscalationRate;