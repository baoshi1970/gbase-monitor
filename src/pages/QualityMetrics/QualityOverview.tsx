import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Spin,
  Alert,
  Button,
  Space,
  Tag,
  Tabs,
  Progress,
  message,
} from 'antd';
import {
  TrophyOutlined,
  WarningOutlined,
  UserSwitchOutlined,
  LineChartOutlined,
  ReloadOutlined,
  DownloadOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { TrendChart, BarChart, GaugeChart } from '../../components';
import TimeRangeSelector, { type TimeRangeValue } from '../../components/TimeRangeSelector';
import { useQualityMetrics } from '../../hooks';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const QualityOverview: React.FC = () => {
  const { t } = useTranslation(['common', 'quality']);

  // 时间范围状态
  const [timeRange, setTimeRange] = useState<TimeRangeValue>({
    startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    preset: 'last7days',
  });

  // 获取综合质量指标数据
  const {
    resolutionRate,
    negativeFeedback,
    escalationRate,
    qualityScore,
    loading,
    error,
    refetch,
  } = useQualityMetrics({ timeRange });

  // 处理刷新
  const handleRefresh = async () => {
    try {
      await refetch();
      message.success('数据刷新成功');
    } catch (err) {
      message.error('数据刷新失败');
    }
  };

  // 处理时间范围变化
  const handleTimeRangeChange = (newTimeRange: TimeRangeValue) => {
    setTimeRange(newTimeRange);
  };

  // 处理数据导出
  const handleExport = () => {
    const data = {
      timeRange,
      metrics: {
        resolutionRate,
        negativeFeedback,
        escalationRate,
        qualityScore,
      },
      exportTime: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quality-metrics-${dayjs().format('YYYY-MM-DD')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    message.success('质量指标数据已导出');
  };

  // 计算综合评级
  const calculateOverallGrade = () => {
    if (!resolutionRate || !negativeFeedback || !escalationRate || !qualityScore) return 'C';

    const resolutionScore = (resolutionRate.current / resolutionRate.target) * 100;
    const feedbackScore = Math.max(0, 100 - (negativeFeedback.current / negativeFeedback.target) * 100);
    const escalationScore = Math.max(0, 100 - (escalationRate.current / escalationRate.target) * 100);
    const overallScore = qualityScore.overall;

    const averageScore = (resolutionScore + feedbackScore + escalationScore + overallScore) / 4;

    if (averageScore >= 95) return 'A+';
    if (averageScore >= 90) return 'A';
    if (averageScore >= 85) return 'B+';
    if (averageScore >= 80) return 'B';
    if (averageScore >= 75) return 'C+';
    if (averageScore >= 70) return 'C';
    return 'D';
  };

  // 获取评级颜色
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return '#52c41a';
      case 'B+':
      case 'B':
        return '#1890ff';
      case 'C+':
      case 'C':
        return '#faad14';
      default:
        return '#ff4d4f';
    }
  };

  if (error) {
    return (
      <div>
        <Title level={2} className="mb-8">
          质量指标总览
        </Title>
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

  const overallGrade = calculateOverallGrade();

  return (
    <div>
      {/* 页面标题和操作栏 */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <Title level={2} className="mb-2">
            质量指标总览
          </Title>
          <Text type="secondary" className="text-base">
            AI对话服务质量综合分析和监控
          </Text>
        </div>
        <Space>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            disabled={loading}
          >
            导出数据
          </Button>
          <Button 
            icon={<ReloadOutlined spin={loading} />} 
            onClick={handleRefresh}
            loading={loading}
          >
            刷新数据
          </Button>
        </Space>
      </div>

      {/* 时间范围选择器 */}
      <Card className="mb-6">
        <TimeRangeSelector
          value={timeRange}
          onChange={handleTimeRangeChange}
        />
      </Card>

      <Spin spinning={loading}>
        {/* 综合评级和核心指标 */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={8}>
            <Card className="text-center h-full">
              <div className="mb-4">
                <div 
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full text-white font-bold text-2xl"
                  style={{ backgroundColor: getGradeColor(overallGrade) }}
                >
                  {overallGrade}
                </div>
              </div>
              <Title level={4} className="mb-2">
                综合评级
              </Title>
              <Text type="secondary">
                基于四大核心指标的综合评估
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={16}>
            <Card title="核心指标概览" className="h-full">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <TrophyOutlined 
                        className="text-2xl" 
                        style={{ 
                          color: (resolutionRate?.current || 0) >= (resolutionRate?.target || 90) ? '#52c41a' : '#faad14'
                        }} 
                      />
                    </div>
                    <Statistic
                      title="Session解决率"
                      value={resolutionRate?.current || 0}
                      suffix="%"
                      precision={1}
                      valueStyle={{ fontSize: '1.2rem' }}
                    />
                    <Tag color={(resolutionRate?.change?.startsWith('+') ? 'green' : 'red')}>
                      {resolutionRate?.change || '+0%'}
                    </Tag>
                  </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <WarningOutlined 
                        className="text-2xl" 
                        style={{ 
                          color: (negativeFeedback?.current || 0) <= (negativeFeedback?.target || 5) ? '#52c41a' : '#ff4d4f'
                        }} 
                      />
                    </div>
                    <Statistic
                      title="负反馈率"
                      value={negativeFeedback?.current || 0}
                      suffix="%"
                      precision={1}
                      valueStyle={{ fontSize: '1.2rem' }}
                    />
                    <Tag color={(negativeFeedback?.change?.startsWith('-') ? 'green' : 'red')}>
                      {negativeFeedback?.change || '+0%'}
                    </Tag>
                  </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <UserSwitchOutlined 
                        className="text-2xl" 
                        style={{ 
                          color: (escalationRate?.current || 0) <= (escalationRate?.target || 15) ? '#52c41a' : '#ff4d4f'
                        }} 
                      />
                    </div>
                    <Statistic
                      title="人工转接率"
                      value={escalationRate?.current || 0}
                      suffix="%"
                      precision={1}
                      valueStyle={{ fontSize: '1.2rem' }}
                    />
                    <Tag color={(escalationRate?.change?.startsWith('-') ? 'green' : 'red')}>
                      {escalationRate?.change || '+0%'}
                    </Tag>
                  </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <LineChartOutlined 
                        className="text-2xl"
                        style={{ color: '#1890ff' }}
                      />
                    </div>
                    <Statistic
                      title="质量得分"
                      value={qualityScore?.overall || 0}
                      precision={1}
                      valueStyle={{ fontSize: '1.2rem' }}
                    />
                    <Tag color={(qualityScore?.change?.startsWith('+') ? 'green' : 'red')}>
                      {qualityScore?.change || '+0%'}
                    </Tag>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* 详细分析标签页 */}
        <Card>
          <Tabs defaultActiveKey="trends" size="large">
            <TabPane tab="趋势分析" key="trends">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="核心指标趋势对比">
                    <TrendChart
                      data={[
                        {
                          name: 'Session解决率',
                          dates: resolutionRate?.trend?.map(item => 
                            dayjs(item.date).format('MM/DD')
                          ) || [],
                          values: resolutionRate?.trend?.map(item => item.value) || [],
                          color: '#52c41a',
                        },
                        {
                          name: '负反馈率',
                          dates: negativeFeedback?.trend?.map(item => 
                            dayjs(item.date).format('MM/DD')
                          ) || [],
                          values: negativeFeedback?.trend?.map(item => item.value) || [],
                          color: '#ff4d4f',
                        },
                        {
                          name: '人工转接率',
                          dates: escalationRate?.trend?.map(item => 
                            dayjs(item.date).format('MM/DD')
                          ) || [],
                          values: escalationRate?.trend?.map(item => item.value) || [],
                          color: '#faad14',
                        },
                      ]}
                      height={400}
                      loading={loading}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="分类分析" key="categories">
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="问题类别解决率">
                    <BarChart
                      data={{
                        categories: resolutionRate?.categoryBreakdown?.map(item => item.category) || [],
                        series: [{
                          name: '解决率',
                          data: resolutionRate?.categoryBreakdown?.map(item => item.rate) || [],
                          color: '#1890ff',
                        }],
                      }}
                      height={300}
                      yAxisFormatter={(value) => `${value}%`}
                      loading={loading}
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="地区表现对比">
                    <BarChart
                      data={{
                        categories: resolutionRate?.regionBreakdown?.map(item => item.region) || [],
                        series: [{
                          name: '解决率',
                          data: resolutionRate?.regionBreakdown?.map(item => item.rate) || [],
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
            </TabPane>

            <TabPane tab="目标达成" key="targets">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <div className="text-center mb-4">
                      <Title level={4}>Session解决率</Title>
                    </div>
                    <GaugeChart
                      value={(resolutionRate?.current / resolutionRate?.target) * 100 || 0}
                      min={0}
                      max={100}
                      height={200}
                      colors={['#ff4d4f', '#faad14', '#52c41a']}
                      loading={loading}
                    />
                    <div className="text-center mt-4">
                      <Text>目标: {resolutionRate?.target}%</Text>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <div className="text-center mb-4">
                      <Title level={4}>负反馈率</Title>
                    </div>
                    <GaugeChart
                      value={Math.max(0, 100 - ((negativeFeedback?.current / negativeFeedback?.target) * 100)) || 0}
                      min={0}
                      max={100}
                      height={200}
                      colors={['#ff4d4f', '#faad14', '#52c41a']}
                      loading={loading}
                    />
                    <div className="text-center mt-4">
                      <Text>目标: ≤{negativeFeedback?.target}%</Text>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <div className="text-center mb-4">
                      <Title level={4}>人工转接率</Title>
                    </div>
                    <GaugeChart
                      value={Math.max(0, 100 - ((escalationRate?.current / escalationRate?.target) * 100)) || 0}
                      min={0}
                      max={100}
                      height={200}
                      colors={['#ff4d4f', '#faad14', '#52c41a']}
                      loading={loading}
                    />
                    <div className="text-center mt-4">
                      <Text>目标: ≤{escalationRate?.target}%</Text>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <div className="text-center mb-4">
                      <Title level={4}>综合质量</Title>
                    </div>
                    <GaugeChart
                      value={qualityScore?.overall || 0}
                      min={0}
                      max={100}
                      height={200}
                      colors={['#ff4d4f', '#faad14', '#52c41a']}
                      loading={loading}
                    />
                    <div className="text-center mt-4">
                      <Text>目标: ≥90分</Text>
                    </div>
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Card>
      </Spin>
    </div>
  );
};

export default QualityOverview;