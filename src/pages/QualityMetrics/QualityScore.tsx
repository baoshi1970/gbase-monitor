import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Spin,
  Alert,
  Tag,
  Progress,
  Tooltip,
  Avatar,
} from 'antd';
import {
  TrophyOutlined,
  RocketOutlined,
  StarOutlined,
  CheckCircleOutlined,
  UserOutlined,
  LineChartOutlined,
  ReloadOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { TrendChart, GaugeChart } from '../../components';
import TimeRangeSelector, { type TimeRangeValue } from '../../components/TimeRangeSelector';
import { useQualityScore } from '../../hooks';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const QualityScore: React.FC = () => {
  
  // 时间范围状态
  const [timeRange, setTimeRange] = useState<TimeRangeValue>({
    startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    preset: 'last7days',
  });

  // 获取质量得分数据
  const {
    data,
    loading,
    error,
    refetch,
  } = useQualityScore(timeRange);

  // 处理刷新
  const handleRefresh = () => {
    refetch();
  };

  // 处理时间范围变化
  const handleTimeRangeChange = (newTimeRange: TimeRangeValue) => {
    setTimeRange(newTimeRange);
  };

  // 获取等级标签
  const getScoreLevel = (score: number) => {
    if (score >= 95) return { label: '优秀', color: '#52c41a' };
    if (score >= 90) return { label: '良好', color: '#1890ff' };
    if (score >= 80) return { label: '合格', color: '#faad14' };
    return { label: '待改进', color: '#ff4d4f' };
  };

  // 获取组件图标
  const getComponentIcon = (name: string) => {
    switch (name) {
      case '回答准确性': return <CheckCircleOutlined />;
      case '响应速度': return <RocketOutlined />;
      case '用户满意度': return <StarOutlined />;
      case '对话完整性': return <UserOutlined />;
      default: return <LineChartOutlined />;
    }
  };

  if (error) {
    return (
      <div>
        <Title level={2} className="mb-8">
          AI质量得分分析
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

  const scoreLevel = getScoreLevel(data?.overall || 0);

  return (
    <div>
      {/* 页面标题和控制栏 */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <Title level={2} className="mb-2">
            AI质量得分分析
          </Title>
          <Text type="secondary" className="text-base">
            综合评估AI对话服务的质量表现，多维度量化分析
          </Text>
        </div>
        <ReloadOutlined 
          onClick={handleRefresh}
          className="text-lg cursor-pointer hover:text-blue-500 transition-colors"
          spin={loading}
        />
      </div>

      {/* 时间范围选择器 */}
      <Card className="mb-6">
        <TimeRangeSelector
          value={timeRange}
          onChange={handleTimeRangeChange}
        />
      </Card>

      <Spin spinning={loading}>
        {/* 核心得分展示 */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <div className="text-center">
                <div className="mb-4">
                  <Avatar 
                    size={80} 
                    style={{ backgroundColor: scoreLevel.color }}
                    icon={<TrophyOutlined />}
                  />
                </div>
                <Statistic
                  title="综合质量得分"
                  value={data?.overall || 0}
                  precision={1}
                  valueStyle={{ 
                    fontSize: '2.5rem',
                    color: scoreLevel.color,
                    fontWeight: 'bold'
                  }}
                />
                <div className="mt-2">
                  <Tag color={scoreLevel.color} className="text-base px-3 py-1">
                    {scoreLevel.label}
                  </Tag>
                </div>
                <div className="mt-3 flex justify-center">
                  <Tag color={(data?.change?.startsWith('+') ? 'green' : 'red')}>
                    {data?.change || '+0%'}
                    {data?.change?.startsWith('+') ? 
                      <RiseOutlined className="ml-1" /> : 
                      <FallOutlined className="ml-1" />
                    }
                  </Tag>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card title="质量分布雷达">
              <GaugeChart
                value={data?.overall || 0}
                min={0}
                max={100}
                height={280}
                colors={['#ff4d4f', '#faad14', '#52c41a']}
                loading={loading}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="关键指标" className="h-full">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircleOutlined className="text-blue-500 text-lg" />
                    <span className="font-medium">准确性</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">
                      {data?.factors?.accuracy || 0}%
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <RocketOutlined className="text-green-500 text-lg" />
                    <span className="font-medium">响应时间</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {data?.factors?.responseTime || 0}ms
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <UserOutlined className="text-orange-500 text-lg" />
                    <span className="font-medium">完整性</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-orange-600">
                      {data?.factors?.completeness || 0}%
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <StarOutlined className="text-purple-500 text-lg" />
                    <span className="font-medium">用户满意</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-purple-600">
                      {data?.factors?.userSatisfaction || 0}%
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 组件得分详情 */}
        <Row gutter={[16, 16]} className="mb-8">
          {data?.components?.map((component, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getComponentIcon(component.name)}
                    <Text strong>{component.name}</Text>
                  </div>
                  <Tooltip title={`权重: ${(component.weight * 100).toFixed(0)}%`}>
                    <Tag color="blue">{(component.weight * 100).toFixed(0)}%</Tag>
                  </Tooltip>
                </div>
                
                <Statistic
                  value={component.score}
                  precision={1}
                  valueStyle={{
                    color: getScoreLevel(component.score).color,
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}
                />
                
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>当前</span>
                    <span>目标: {component.target}</span>
                  </div>
                  <Progress
                    percent={(component.score / component.target) * 100}
                    showInfo={false}
                    strokeColor={
                      component.score >= component.target ? '#52c41a' : 
                      component.score >= component.target * 0.9 ? '#faad14' : '#ff4d4f'
                    }
                  />
                </div>

                <div className="mt-2 text-center">
                  <Tag color={getScoreLevel(component.score).color}>
                    {getScoreLevel(component.score).label}
                  </Tag>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* 趋势分析 */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="质量得分趋势分析" extra={<LineChartOutlined />}>
              <TrendChart
                data={[
                  {
                    name: '综合得分',
                    dates: data?.components?.[0]?.trend?.map(item => 
                      dayjs(item.date).format('MM/DD')
                    ) || [],
                    values: data?.components?.[0]?.trend?.map(() => data?.overall || 0) || [],
                    color: '#1890ff',
                  },
                  ...(data?.components?.map(component => ({
                    name: component.name,
                    dates: component.trend?.map(item => 
                      dayjs(item.date).format('MM/DD')
                    ) || [],
                    values: component.trend?.map(item => item.value) || [],
                    color: ['#52c41a', '#faad14', '#ff4d4f', '#722ed1'][
                      data.components.indexOf(component) % 4
                    ],
                  })) || []),
                ]}
                height={400}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default QualityScore;