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
  Progress,
} from 'antd';
import {
  RiseOutlined,
  FallOutlined,
  TrophyOutlined,
  LineChartOutlined,
  BarChartOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { TrendChart, BarChart, GaugeChart } from '../../components';
import TimeRangeSelector, { type TimeRangeValue } from '../../components/TimeRangeSelector';
import { useResolutionRate } from '../../hooks';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ResolutionRate: React.FC = () => {
  
  // 时间范围状态
  const [timeRange, setTimeRange] = useState<TimeRangeValue>({
    startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    preset: 'last7days',
  });

  // 分类筛选状态
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  // 获取解决率数据
  const {
    data,
    loading,
    error,
    refetch,
  } = useResolutionRate({
    ...timeRange,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    region: selectedRegion === 'all' ? undefined : selectedRegion,
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
          Session解决率分析
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
            Session解决率分析
          </Title>
          <Text type="secondary" className="text-base">
            监控AI对话的解决效果，分析不同维度的解决率表现
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
            <Text className="text-gray-600 font-medium">问题类别:</Text>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: 120 }}
              options={[
                { label: '全部', value: 'all' },
                { label: '技术问题', value: '技术问题' },
                { label: '商务咨询', value: '商务咨询' },
                { label: '产品使用', value: '产品使用' },
                { label: '账户问题', value: '账户问题' },
              ]}
            />
          </Space>

          <Space>
            <Text className="text-gray-600 font-medium">地区:</Text>
            <Select
              value={selectedRegion}
              onChange={setSelectedRegion}
              style={{ width: 100 }}
              options={[
                { label: '全部', value: 'all' },
                { label: '日本', value: '日本' },
                { label: '中国', value: '中国' },
                { label: '美国', value: '美国' },
                { label: '欧洲', value: '欧洲' },
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
                title="当前解决率"
                value={data?.current || 0}
                suffix="%"
                precision={1}
                prefix={
                  (data?.current || 0) >= (data?.target || 90) ? 
                  <TrophyOutlined style={{ color: '#52c41a' }} /> : 
                  <LineChartOutlined />
                }
                valueStyle={{
                  color: (data?.current || 0) >= (data?.target || 90) ? '#3f8600' : '#faad14'
                }}
              />
              <div className="mt-2">
                <Tag color={(data?.change?.startsWith('+') ? 'green' : 'red')}>
                  {data?.change || '+0%'}
                  {data?.change?.startsWith('+') ? <RiseOutlined /> : <FallOutlined />}
                </Tag>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="目标完成度"
                value={data ? ((data.current / data.target) * 100) : 0}
                suffix="%"
                precision={1}
                prefix={<BarChartOutlined />}
              />
              <div className="mt-2">
                <Progress
                  percent={data ? ((data.current / data.target) * 100) : 0}
                  showInfo={false}
                  strokeColor={{
                    '0%': '#ff4d4f',
                    '50%': '#faad14',
                    '100%': '#52c41a',
                  }}
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="目标值"
                value={data?.target || 90}
                suffix="%"
                precision={1}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="text-sm text-gray-500 mt-2">
                企业标准目标
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="样本数量"
                value={data?.trend?.length ? data.trend.length * 100 : 0}
                prefix={<LineChartOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
              <div className="text-sm text-gray-500 mt-2">
                统计期间总对话数
              </div>
            </Card>
          </Col>
        </Row>

        {/* 趋势分析和仪表盘 */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col span={16}>
            <Card title="解决率趋势分析" className="h-96">
              <TrendChart
                data={[
                  {
                    name: '实际解决率',
                    dates: data?.trend?.map(item => 
                      dayjs(item.date).format('MM/DD')
                    ) || [],
                    values: data?.trend?.map(item => item.value) || [],
                    color: '#1890ff',
                  },
                  {
                    name: '目标线',
                    dates: data?.trend?.map(item => 
                      dayjs(item.date).format('MM/DD')
                    ) || [],
                    values: new Array(data?.trend?.length || 0).fill(data?.target || 90),
                    color: '#52c41a',
                  },
                ]}
                height={320}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="解决率评级" className="h-96">
              <GaugeChart
                value={data?.current || 0}
                min={0}
                max={100}
                unit="%"
                height={320}
                colors={['#ff4d4f', '#faad14', '#52c41a']}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        {/* 分类和地区分析 */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card title="问题类别解决率">
              <BarChart
                data={{
                  categories: data?.categoryBreakdown?.map(item => item.category) || [],
                  series: [{
                    name: '解决率',
                    data: data?.categoryBreakdown?.map(item => item.rate) || [],
                    color: '#1890ff',
                  }],
                }}
                height={300}
                yAxisFormatter={(value) => `${value}%`}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="地区解决率分布">
              <BarChart
                data={{
                  categories: data?.regionBreakdown?.map(item => item.region) || [],
                  series: [{
                    name: '解决率',
                    data: data?.regionBreakdown?.map(item => item.rate) || [],
                    color: '#52c41a',
                  }],
                }}
                height={300}
                yAxisFormatter={(value) => `${value}%`}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default ResolutionRate;