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
  Select,
  Progress,
  message,
  Table,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { TrendChart, BarChart, PieChart } from '../../components/Charts';
import TimeRangeSelector, { type TimeRangeValue } from '../../components/TimeRangeSelector';
import { useUserActivity } from '../../hooks';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const UserActivity: React.FC = () => {
  // 时间范围状态
  const [timeRange, setTimeRange] = useState<TimeRangeValue>({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    preset: 'last30days',
  });

  // 用户类型筛选
  const [selectedUserType, setSelectedUserType] = useState<string>('all');

  // 获取用户活跃度数据
  const {
    data,
    loading,
    error,
    refetch,
  } = useUserActivity({
    ...timeRange,
    userType: selectedUserType === 'all' ? undefined : selectedUserType as any,
  });

  // 处理刷新
  const handleRefresh = async () => {
    try {
      await refetch();
      message.success('用户活跃度数据刷新成功');
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
    if (!data) {
      message.warning('暂无数据可导出');
      return;
    }

    const exportData = {
      timeRange,
      userType: selectedUserType,
      data,
      exportTime: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-activity-${dayjs().format('YYYY-MM-DD')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    message.success('用户活跃度数据已导出');
  };

  // 获取用户类型标签和图标
  const getUserTypeConfig = (type: string) => {
    const configs = {
      new: { label: '新用户', icon: <EyeOutlined />, color: '#52c41a' },
      returning: { label: '回访用户', icon: <HeartOutlined />, color: '#1890ff' },
      power: { label: '活跃用户', icon: <ThunderboltOutlined />, color: '#faad14' },
    };
    return configs[type as keyof typeof configs] || { label: type, icon: <UserOutlined />, color: '#8c8c8c' };
  };

  // 获取周几标签
  const getDayLabel = (dayOfWeek: number) => {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[dayOfWeek] || `第${dayOfWeek}天`;
  };

  // 计算活跃度评级
  const getActivityGrade = () => {
    if (!data) return 'C';
    const dauMauRatio = (data.activeUsers.daily / data.activeUsers.monthly) * 100;
    if (dauMauRatio >= 25) return 'A';
    if (dauMauRatio >= 20) return 'B+';
    if (dauMauRatio >= 15) return 'B';
    if (dauMauRatio >= 10) return 'C+';
    return 'C';
  };

  // 留存率表格数据
  const retentionTableData = data ? [
    {
      key: 'day1',
      period: '1天留存',
      rate: data.retentionRate.day1,
      benchmark: 75,
      status: data.retentionRate.day1 >= 75 ? '优秀' : data.retentionRate.day1 >= 60 ? '良好' : '需改进',
    },
    {
      key: 'day7',
      period: '7天留存',
      rate: data.retentionRate.day7,
      benchmark: 40,
      status: data.retentionRate.day7 >= 40 ? '优秀' : data.retentionRate.day7 >= 25 ? '良好' : '需改进',
    },
    {
      key: 'day30',
      period: '30天留存',
      rate: data.retentionRate.day30,
      benchmark: 20,
      status: data.retentionRate.day30 >= 20 ? '优秀' : data.retentionRate.day30 >= 10 ? '良好' : '需改进',
    },
  ] : [];

  const retentionColumns = [
    {
      title: '留存周期',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: '留存率',
      dataIndex: 'rate',
      key: 'rate',
      render: (rate: number) => (
        <div className="flex items-center space-x-2">
          <span className="font-semibold">{rate.toFixed(1)}%</span>
          <Progress 
            percent={rate} 
            showInfo={false} 
            strokeWidth={6}
            strokeColor={rate >= 60 ? '#52c41a' : rate >= 30 ? '#faad14' : '#ff4d4f'}
            style={{ width: '60px' }}
          />
        </div>
      ),
    },
    {
      title: '行业基准',
      dataIndex: 'benchmark',
      key: 'benchmark',
      render: (benchmark: number) => <Text type="secondary">{benchmark}%</Text>,
    },
    {
      title: '评估',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === '优秀' ? 'green' : status === '良好' ? 'blue' : 'red'}>
          {status}
        </Tag>
      ),
    },
  ];

  if (error) {
    return (
      <div>
        <Title level={2} className="mb-8">
          用户活跃度分析
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

  return (
    <div>
      {/* 页面标题和操作栏 */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <Title level={2} className="mb-2">
            用户活跃度分析
          </Title>
          <Text type="secondary" className="text-base">
            深入分析用户活跃度指标、留存率和使用模式
          </Text>
        </div>
        <Space>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            disabled={loading || !data}
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

      {/* 时间范围和筛选器 */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-6">
          <TimeRangeSelector
            value={timeRange}
            onChange={handleTimeRangeChange}
          />
          
          <Space>
            <Text className="text-gray-600 font-medium">用户类型:</Text>
            <Select
              value={selectedUserType}
              onChange={setSelectedUserType}
              style={{ width: 120 }}
            >
              <Option value="all">全部用户</Option>
              <Option value="new">新用户</Option>
              <Option value="returning">回访用户</Option>
              <Option value="power">活跃用户</Option>
            </Select>
          </Space>
        </div>
      </Card>

      <Spin spinning={loading}>
        {/* 核心活跃度指标 */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="日活跃用户 (DAU)"
                value={data?.activeUsers.daily || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <div className="mt-2">
                <Tag color="blue">
                  活跃度评级: {getActivityGrade()}
                </Tag>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="周活跃用户 (WAU)"
                value={data?.activeUsers.weekly || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="mt-2">
                <Text type="secondary">
                  DAU/WAU: {data ? ((data.activeUsers.daily / data.activeUsers.weekly) * 100).toFixed(1) : 0}%
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="月活跃用户 (MAU)"
                value={data?.activeUsers.monthly || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
              <div className="mt-2">
                <Text type="secondary">
                  DAU/MAU: {data ? ((data.activeUsers.daily / data.activeUsers.monthly) * 100).toFixed(1) : 0}%
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="平均会话时长"
                value={data?.sessionDuration.avg || 0}
                suffix="分钟"
                prefix={<ClockCircleOutlined />}
                precision={1}
                valueStyle={{ color: '#722ed1' }}
              />
              <div className="mt-2">
                <Tooltip title="中位数通常比平均数更能反映真实的用户行为">
                  <Text type="secondary">
                    中位数: {data?.sessionDuration.median || 0}分钟 <InfoCircleOutlined />
                  </Text>
                </Tooltip>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 用户类型分布和24小时活跃度 */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} lg={8}>
            <Card title="用户类型分布" className="h-96">
              <div className="mb-4">
                <PieChart
                  data={data ? Object.entries(data.userTypes).map(([type, count]) => ({
                    name: getUserTypeConfig(type).label,
                    value: count,
                  })) : []}
                  height={200}
                  loading={loading}
                />
              </div>
              
              <div className="space-y-3">
                {data && Object.entries(data.userTypes).map(([type, count]) => {
                  const config = getUserTypeConfig(type);
                  const total = Object.values(data.userTypes).reduce((a, b) => a + b, 0);
                  return (
                    <div key={type} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <span style={{ color: config.color }}>{config.icon}</span>
                        <span className="font-medium">{config.label}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{count.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          {((count / total) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card title="24小时活跃度分布" className="h-96">
              <BarChart
                data={{
                  categories: data?.activityByHour?.map(item => `${item.hour.toString().padStart(2, '0')}:00`) || [],
                  series: [{
                    name: '活跃用户数',
                    data: data?.activityByHour?.map(item => item.count) || [],
                    color: '#1890ff',
                  }],
                }}
                height={320}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        {/* 周活跃度和会话时长分布 */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} lg={12}>
            <Card title="一周活跃度分布">
              <BarChart
                data={{
                  categories: data?.activityByDay?.map(item => getDayLabel(item.dayOfWeek)) || [],
                  series: [{
                    name: '活跃用户数',
                    data: data?.activityByDay?.map(item => item.count) || [],
                    color: '#52c41a',
                  }],
                }}
                height={300}
                loading={loading}
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="会话时长分布">
              <PieChart
                data={data?.sessionDuration.distribution?.map(item => ({
                  name: item.range,
                  value: item.count,
                })) || []}
                height={300}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        {/* 留存率详细分析 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card title="用户留存率分析" extra={<RiseOutlined />}>
              <Table 
                dataSource={retentionTableData}
                columns={retentionColumns}
                pagination={false}
                size="middle"
              />
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <InfoCircleOutlined className="text-blue-500 mt-1" />
                  <div>
                    <Text strong className="text-blue-800">留存率解读:</Text>
                    <div className="mt-2 space-y-1">
                      <Text className="text-blue-700 block">
                        • 1天留存率反映产品的初始价值和用户体验
                      </Text>
                      <Text className="text-blue-700 block">
                        • 7天留存率体现用户对产品的认可程度
                      </Text>
                      <Text className="text-blue-700 block">
                        • 30天留存率显示产品的长期价值和用户忠诚度
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="活跃度健康度评估" className="h-full">
              <div className="space-y-6">
                {/* DAU/MAU比率 */}
                <div>
                  <div className="flex justify-between mb-2">
                    <Text>DAU/MAU 比率</Text>
                    <Text strong>
                      {data ? ((data.activeUsers.daily / data.activeUsers.monthly) * 100).toFixed(1) : 0}%
                    </Text>
                  </div>
                  <Progress 
                    percent={data ? (data.activeUsers.daily / data.activeUsers.monthly) * 100 : 0}
                    strokeColor={{
                      '0%': '#ff4d4f',
                      '20%': '#faad14',
                      '30%': '#52c41a',
                    }}
                    showInfo={false}
                  />
                  <Text type="secondary" className="text-xs">
                    行业优秀标准: 20%以上
                  </Text>
                </div>

                {/* 7天留存率 */}
                <div>
                  <div className="flex justify-between mb-2">
                    <Text>7天留存率</Text>
                    <Text strong>{data?.retentionRate.day7 || 0}%</Text>
                  </div>
                  <Progress 
                    percent={data?.retentionRate.day7 || 0}
                    strokeColor={{
                      '0%': '#ff4d4f',
                      '25%': '#faad14',
                      '40%': '#52c41a',
                    }}
                    showInfo={false}
                  />
                  <Text type="secondary" className="text-xs">
                    行业优秀标准: 40%以上
                  </Text>
                </div>

                {/* 综合评估 */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Text strong>综合评估: </Text>
                  <Tag 
                    color={getActivityGrade() === 'A' ? 'green' : 
                           getActivityGrade().startsWith('B') ? 'blue' : 'orange'} 
                    className="ml-2"
                  >
                    {getActivityGrade()} 级
                  </Tag>
                  <div className="mt-2">
                    <Text type="secondary" className="text-sm">
                      {getActivityGrade() === 'A' && '用户活跃度表现优秀，用户粘性强'}
                      {getActivityGrade().startsWith('B') && '用户活跃度良好，还有提升空间'}
                      {getActivityGrade().startsWith('C') && '用户活跃度需要改进，建议加强用户激活策略'}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default UserActivity;