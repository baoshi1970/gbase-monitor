import React, { useState } from 'react';
import {
  Card,
  Select,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
  Space,
  Typography,
  Divider,
} from 'antd';
import {
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  TrophyOutlined,
  WarningOutlined,
  UserSwitchOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { TrendChart } from './Charts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface ComparisonData {
  current: number;
  previous: number;
  trend: Array<{ date: string; value: number }>;
  target?: number;
}

interface QualityComparisonProps {
  data: {
    resolutionRate: ComparisonData;
    negativeFeedback: ComparisonData;
    escalationRate: ComparisonData;
    qualityScore: ComparisonData;
  };
  loading?: boolean;
}

const QualityComparison: React.FC<QualityComparisonProps> = ({ data, loading = false }) => {
  const [compareType, setCompareType] = useState<string>('previous_period');
  const [metricFocus, setMetricFocus] = useState<string>('all');

  // 计算变化百分比
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // 获取变化图标和颜色
  const getChangeIndicator = (change: number, isNegativeMetric = false) => {
    const threshold = 0.1; // 0.1%以下视为无变化
    
    if (Math.abs(change) < threshold) {
      return { icon: <MinusOutlined />, color: '#8c8c8c', text: '持平' };
    }

    const isImprovement = isNegativeMetric ? change < 0 : change > 0;
    
    if (isImprovement) {
      return {
        icon: <RiseOutlined />,
        color: '#52c41a',
        text: '改善'
      };
    } else {
      return {
        icon: <FallOutlined />,
        color: '#ff4d4f',
        text: '下降'
      };
    }
  };

  // 渲染指标卡片
  const renderMetricCard = (
    title: string,
    icon: React.ReactNode,
    current: number,
    previous: number,
    target?: number,
    suffix = '%',
    isNegativeMetric = false
  ) => {
    const change = calculateChange(current, previous);
    const changeIndicator = getChangeIndicator(change, isNegativeMetric);
    
    return (
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {icon}
            <Text strong>{title}</Text>
          </div>
          {target && (
            <Tag color={current >= target ? 'green' : 'orange'}>
              目标: {target}{suffix}
            </Tag>
          )}
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="当前"
              value={current}
              suffix={suffix}
              precision={1}
              valueStyle={{ fontSize: '1.5rem' }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="上期"
              value={previous}
              suffix={suffix}
              precision={1}
              valueStyle={{ fontSize: '1.5rem', color: '#8c8c8c' }}
            />
          </Col>
        </Row>

        <Divider />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span style={{ color: changeIndicator.color }}>
              {changeIndicator.icon}
            </span>
            <Text style={{ color: changeIndicator.color }}>
              {changeIndicator.text}
            </Text>
          </div>
          <Tag color={changeIndicator.color.includes('52c41a') ? 'green' : changeIndicator.color.includes('ff4d4f') ? 'red' : 'default'}>
            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
          </Tag>
        </div>

        {target && (
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>达成率</span>
              <span>{((current / target) * 100).toFixed(1)}%</span>
            </div>
            <Progress
              percent={(current / target) * 100}
              showInfo={false}
              strokeColor={current >= target ? '#52c41a' : '#faad14'}
            />
          </div>
        )}
      </Card>
    );
  };

  return (
    <div>
      {/* 对比选项 */}
      <Card className="mb-6">
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>对比维度:</Text>
          </Col>
          <Col>
            <Select
              value={compareType}
              onChange={setCompareType}
              style={{ width: 150 }}
            >
              <Option value="previous_period">上期对比</Option>
              <Option value="same_period_last_year">去年同期</Option>
              <Option value="target">目标对比</Option>
            </Select>
          </Col>
          <Col>
            <Text strong>重点指标:</Text>
          </Col>
          <Col>
            <Select
              value={metricFocus}
              onChange={setMetricFocus}
              style={{ width: 120 }}
            >
              <Option value="all">全部</Option>
              <Option value="resolution">解决率</Option>
              <Option value="feedback">反馈率</Option>
              <Option value="escalation">转接率</Option>
              <Option value="quality">质量分</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* 指标对比卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        {(metricFocus === 'all' || metricFocus === 'resolution') && (
          <Col xs={24} sm={12} lg={6}>
            {renderMetricCard(
              'Session解决率',
              <TrophyOutlined style={{ color: '#52c41a' }} />,
              data.resolutionRate.current,
              data.resolutionRate.previous,
              data.resolutionRate.target
            )}
          </Col>
        )}

        {(metricFocus === 'all' || metricFocus === 'feedback') && (
          <Col xs={24} sm={12} lg={6}>
            {renderMetricCard(
              '负反馈率',
              <WarningOutlined style={{ color: '#ff4d4f' }} />,
              data.negativeFeedback.current,
              data.negativeFeedback.previous,
              data.negativeFeedback.target,
              '%',
              true // 负面指标，数值下降是好事
            )}
          </Col>
        )}

        {(metricFocus === 'all' || metricFocus === 'escalation') && (
          <Col xs={24} sm={12} lg={6}>
            {renderMetricCard(
              '人工转接率',
              <UserSwitchOutlined style={{ color: '#faad14' }} />,
              data.escalationRate.current,
              data.escalationRate.previous,
              data.escalationRate.target,
              '%',
              true // 负面指标，数值下降是好事
            )}
          </Col>
        )}

        {(metricFocus === 'all' || metricFocus === 'quality') && (
          <Col xs={24} sm={12} lg={6}>
            {renderMetricCard(
              '质量得分',
              <LineChartOutlined style={{ color: '#1890ff' }} />,
              data.qualityScore.current,
              data.qualityScore.previous,
              data.qualityScore.target,
              '分'
            )}
          </Col>
        )}
      </Row>

      {/* 趋势对比图表 */}
      <Card title="指标趋势对比分析">
        <TrendChart
          data={[
            ...(metricFocus === 'all' || metricFocus === 'resolution' ? [{
              name: 'Session解决率',
              dates: data.resolutionRate.trend.map(item => dayjs(item.date).format('MM/DD')),
              values: data.resolutionRate.trend.map(item => item.value),
              color: '#52c41a',
            }] : []),
            ...(metricFocus === 'all' || metricFocus === 'feedback' ? [{
              name: '负反馈率',
              dates: data.negativeFeedback.trend.map(item => dayjs(item.date).format('MM/DD')),
              values: data.negativeFeedback.trend.map(item => item.value),
              color: '#ff4d4f',
            }] : []),
            ...(metricFocus === 'all' || metricFocus === 'escalation' ? [{
              name: '人工转接率',
              dates: data.escalationRate.trend.map(item => dayjs(item.date).format('MM/DD')),
              values: data.escalationRate.trend.map(item => item.value),
              color: '#faad14',
            }] : []),
            ...(metricFocus === 'all' || metricFocus === 'quality' ? [{
              name: '质量得分',
              dates: data.qualityScore.trend.map(item => dayjs(item.date).format('MM/DD')),
              values: data.qualityScore.trend.map(item => item.value),
              color: '#1890ff',
            }] : []),
          ]}
          height={400}
          loading={loading}
        />
      </Card>

      {/* 改进建议 */}
      <Card title="数据洞察与建议" className="mt-4">
        <Row gutter={16}>
          <Col span={24}>
            <div className="space-y-4">
              {/* 基于数据生成的改进建议 */}
              {calculateChange(data.resolutionRate.current, data.resolutionRate.previous) < 0 && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded">
                  <div className="flex items-center">
                    <WarningOutlined className="text-red-400 mr-2" />
                    <Text strong className="text-red-800">Session解决率下降</Text>
                  </div>
                  <Text className="text-red-700 mt-2 block">
                    建议：分析解决率下降的具体原因，检查AI模型表现和知识库更新情况。
                  </Text>
                </div>
              )}

              {calculateChange(data.negativeFeedback.current, data.negativeFeedback.previous) > 0 && (
                <div className="p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
                  <div className="flex items-center">
                    <WarningOutlined className="text-orange-400 mr-2" />
                    <Text strong className="text-orange-800">负反馈率上升</Text>
                  </div>
                  <Text className="text-orange-700 mt-2 block">
                    建议：深入分析用户负反馈内容，优化AI回答质量和用户体验。
                  </Text>
                </div>
              )}

              {calculateChange(data.escalationRate.current, data.escalationRate.previous) > 0 && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <div className="flex items-center">
                    <WarningOutlined className="text-yellow-400 mr-2" />
                    <Text strong className="text-yellow-800">人工转接率上升</Text>
                  </div>
                  <Text className="text-yellow-700 mt-2 block">
                    建议：分析转接原因，考虑扩充AI知识库或优化转接逻辑。
                  </Text>
                </div>
              )}

              {/* 正面反馈 */}
              {Object.values(data).every(metric => 
                calculateChange(metric.current, metric.previous) >= -0.5
              ) && (
                <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded">
                  <div className="flex items-center">
                    <TrophyOutlined className="text-green-400 mr-2" />
                    <Text strong className="text-green-800">整体表现稳定</Text>
                  </div>
                  <Text className="text-green-700 mt-2 block">
                    所有核心指标都保持稳定水平，AI服务质量处于良好状态。
                  </Text>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default QualityComparison;