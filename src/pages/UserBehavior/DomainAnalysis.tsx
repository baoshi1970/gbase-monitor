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
  Table,
  Input,
  message,
  Progress,
  Tooltip,
} from 'antd';
import {
  GlobalOutlined,
  BuildOutlined,
  BankOutlined,
  BookOutlined,
  HomeOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  RiseOutlined,
  FallOutlined,
  InfoCircleOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { TrendChart, PieChart, BarChart } from '../../components/Charts';
import TimeRangeSelector, { type TimeRangeValue } from '../../components/TimeRangeSelector';
import { useDomainAnalysis } from '../../hooks';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const DomainAnalysis: React.FC = () => {
  // 时间范围状态
  const [timeRange, setTimeRange] = useState<TimeRangeValue>({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    preset: 'last30days',
  });

  // 筛选状态
  const [selectedDomainType, setSelectedDomainType] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // 获取域名分析数据
  const {
    data,
    loading,
    error,
    refetch,
  } = useDomainAnalysis({
    ...timeRange,
    domainType: selectedDomainType === 'all' ? undefined : selectedDomainType as any,
  });

  // 处理刷新
  const handleRefresh = async () => {
    try {
      await refetch();
      message.success('域名分析数据刷新成功');
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
      domainType: selectedDomainType,
      searchKeyword,
      data,
      exportTime: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `domain-analysis-${dayjs().format('YYYY-MM-DD')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    message.success('企业域名分析数据已导出');
  };

  // 获取域名类型配置
  const getDomainTypeConfig = (type: string) => {
    const configs = {
      corporate: { label: '企业域名', icon: <BuildOutlined />, color: '#1890ff' },
      freemail: { label: '免费邮箱', icon: <HomeOutlined />, color: '#52c41a' },
      education: { label: '教育机构', icon: <BookOutlined />, color: '#faad14' },
      government: { label: '政府机构', icon: <BankOutlined />, color: '#722ed1' },
    };
    return configs[type as keyof typeof configs] || { label: type, icon: <GlobalOutlined />, color: '#8c8c8c' };
  };

  // 过滤热门域名
  const filteredTopDomains = data?.topDomains?.filter(domain =>
    searchKeyword ? domain.domain.toLowerCase().includes(searchKeyword.toLowerCase()) : true
  ) || [];

  // 热门域名表格列配置
  const topDomainsColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_: any, __: any, index: number) => (
        <div className="flex items-center justify-center">
          {index < 3 ? (
            <TrophyOutlined 
              style={{ 
                color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                fontSize: '16px' 
              }} 
            />
          ) : (
            <span className="font-semibold text-gray-500">{index + 1}</span>
          )}
        </div>
      ),
    },
    {
      title: '域名',
      dataIndex: 'domain',
      key: 'domain',
      render: (domain: string, record: any) => (
        <div>
          <div className="font-medium">{domain}</div>
          {record.industry && (
            <Tag size="small" color="blue">{record.industry}</Tag>
          )}
        </div>
      ),
    },
    {
      title: '用户数',
      dataIndex: 'users',
      key: 'users',
      sorter: (a: any, b: any) => a.users - b.users,
      render: (users: number) => (
        <Text strong>{users.toLocaleString()}</Text>
      ),
    },
    {
      title: '占比',
      dataIndex: 'percentage',
      key: 'percentage',
      sorter: (a: any, b: any) => a.percentage - b.percentage,
      render: (percentage: number) => (
        <div className="flex items-center space-x-2">
          <span>{percentage.toFixed(1)}%</span>
          <Progress 
            percent={percentage} 
            showInfo={false} 
            strokeWidth={4}
            style={{ width: '50px' }}
          />
        </div>
      ),
    },
    {
      title: '增长率',
      dataIndex: 'growth',
      key: 'growth',
      render: (growth: string) => (
        <Tag color={growth.startsWith('+') ? 'green' : growth.startsWith('-') ? 'red' : 'blue'}>
          {growth.startsWith('+') ? <RiseOutlined /> : growth.startsWith('-') ? <FallOutlined /> : null}
          {growth}
        </Tag>
      ),
    },
  ];

  // 新域名表格列配置
  const newDomainsColumns = [
    {
      title: '域名',
      dataIndex: 'domain',
      key: 'domain',
      render: (domain: string) => (
        <Text strong>{domain}</Text>
      ),
    },
    {
      title: '用户数',
      dataIndex: 'users',
      key: 'users',
      sorter: (a: any, b: any) => a.users - b.users,
    },
    {
      title: '首次出现',
      dataIndex: 'firstSeen',
      key: 'firstSeen',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '天数',
      key: 'daysAgo',
      render: (_: any, record: any) => {
        const daysAgo = dayjs().diff(dayjs(record.firstSeen), 'day');
        return (
          <Tag color={daysAgo <= 7 ? 'red' : daysAgo <= 30 ? 'orange' : 'blue'}>
            {daysAgo}天前
          </Tag>
        );
      },
    },
  ];

  if (error) {
    return (
      <div>
        <Title level={2} className="mb-8">
          企业域名分析
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
            企业域名分析
          </Title>
          <Text type="secondary" className="text-base">
            分析用户邮箱域名分布，识别企业客户和潜在商机
          </Text>
        </div>
        <Space>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            disabled={loading || !data}
          >
            导出分析报告
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
            <Text className="text-gray-600 font-medium">域名类型:</Text>
            <Select
              value={selectedDomainType}
              onChange={setSelectedDomainType}
              style={{ width: 120 }}
            >
              <Option value="all">全部类型</Option>
              <Option value="corporate">企业域名</Option>
              <Option value="freemail">免费邮箱</Option>
              <Option value="education">教育机构</Option>
              <Option value="government">政府机构</Option>
            </Select>
          </Space>

          <Space>
            <Text className="text-gray-600 font-medium">搜索域名:</Text>
            <Search
              placeholder="输入域名关键词"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
          </Space>
        </div>
      </Card>

      <Spin spinning={loading}>
        {/* 域名类型分布统计 */}
        <Row gutter={[16, 16]} className="mb-8">
          {data && Object.entries(data.distribution).map(([type, count]) => {
            const config = getDomainTypeConfig(type);
            const total = Object.values(data.distribution).reduce((a, b) => a + b, 0);
            const percentage = ((count / total) * 100).toFixed(1);
            
            return (
              <Col key={type} xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title={config.label}
                    value={count}
                    prefix={config.icon}
                    valueStyle={{ color: config.color }}
                  />
                  <div className="mt-2">
                    <Tag color={config.color.replace('#', '')}>
                      {percentage}%
                    </Tag>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* 域名类型分布图和趋势 */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} lg={10}>
            <Card title="域名类型分布" className="h-96">
              <PieChart
                data={data ? Object.entries(data.distribution).map(([type, count]) => ({
                  name: getDomainTypeConfig(type).label,
                  value: count,
                })) : []}
                height={320}
                loading={loading}
              />
            </Card>
          </Col>

          <Col xs={24} lg={14}>
            <Card title="域名类型趋势变化" className="h-96">
              <TrendChart
                data={[
                  {
                    name: '企业域名',
                    dates: data?.trends?.map(item => dayjs(item.date).format('MM/DD')) || [],
                    values: data?.trends?.map(item => item.corporate) || [],
                    color: '#1890ff',
                  },
                  {
                    name: '免费邮箱',
                    dates: data?.trends?.map(item => dayjs(item.date).format('MM/DD')) || [],
                    values: data?.trends?.map(item => item.freemail) || [],
                    color: '#52c41a',
                  },
                  {
                    name: '教育机构',
                    dates: data?.trends?.map(item => dayjs(item.date).format('MM/DD')) || [],
                    values: data?.trends?.map(item => item.education) || [],
                    color: '#faad14',
                  },
                  {
                    name: '政府机构',
                    dates: data?.trends?.map(item => dayjs(item.date).format('MM/DD')) || [],
                    values: data?.trends?.map(item => item.government) || [],
                    color: '#722ed1',
                  },
                ]}
                height={320}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        {/* 热门企业域名排行 */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col span={24}>
            <Card 
              title={
                <div className="flex items-center justify-between">
                  <span>热门企业域名排行</span>
                  <div className="flex items-center space-x-2">
                    <Text type="secondary">共 {filteredTopDomains.length} 个域名</Text>
                    <Tooltip title="根据用户数量排序，显示最受欢迎的企业域名">
                      <InfoCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </div>
                </div>
              }
            >
              <Table
                dataSource={filteredTopDomains}
                columns={topDomainsColumns}
                rowKey="domain"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
                }}
                size="middle"
              />
            </Card>
          </Col>
        </Row>

        {/* 新发现企业域名 */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} lg={16}>
            <Card 
              title={
                <div className="flex items-center space-x-2">
                  <span>新发现企业域名</span>
                  <Tag color="red">最近30天</Tag>
                </div>
              }
            >
              <Table
                dataSource={data?.newDomains || []}
                columns={newDomainsColumns}
                rowKey="domain"
                pagination={{
                  pageSize: 8,
                  showSizeChanger: false,
                }}
                size="small"
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="域名发现趋势" className="h-full">
              <div className="space-y-4">
                {/* 新域名统计 */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Text strong>新域名数量</Text>
                    <Text className="text-2xl font-bold text-blue-600">
                      {data?.newDomains?.length || 0}
                    </Text>
                  </div>
                  <Text type="secondary">最近30天新发现的企业域名</Text>
                </div>

                {/* 平均用户数 */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Text strong>平均用户数</Text>
                    <Text className="text-2xl font-bold text-green-600">
                      {data?.newDomains?.length ? 
                        Math.round(data.newDomains.reduce((sum, domain) => sum + domain.users, 0) / data.newDomains.length)
                        : 0}
                    </Text>
                  </div>
                  <Text type="secondary">每个新域名的平均用户数量</Text>
                </div>

                {/* 商机评估 */}
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Text strong>商机评估</Text>
                    <Tag color="orange">
                      {(data?.newDomains?.length || 0) >= 10 ? '高潜力' : 
                       (data?.newDomains?.length || 0) >= 5 ? '中等' : '待观察'}
                    </Tag>
                  </div>
                  <Text type="secondary">基于新域名数量和用户规模评估</Text>
                </div>

                {/* 建议 */}
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <InfoCircleOutlined className="text-purple-500 mt-1" />
                    <div>
                      <Text strong className="text-purple-800">营销建议:</Text>
                      <div className="mt-1">
                        <Text className="text-purple-700 text-sm">
                          {(data?.newDomains?.length || 0) >= 10 
                            ? '发现大量新企业客户，建议制定针对性的B2B营销策略'
                            : '新企业域名增长平缓，可考虑加强企业市场推广'}
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 行业分析和洞察 */}
        <Card title="行业洞察与建议">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <div className="space-y-4">
                {/* 企业客户分析 */}
                {data && (
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <div className="flex items-center mb-2">
                      <BuildOutlined className="text-blue-500 mr-2" />
                      <Text strong className="text-blue-800">企业客户分析</Text>
                    </div>
                    <Text className="text-blue-700">
                      企业用户占比 {((data.distribution.corporate / (data.distribution.corporate + data.distribution.freemail)) * 100).toFixed(1)}%，
                      {((data.distribution.corporate / (data.distribution.corporate + data.distribution.freemail)) * 100) >= 30
                        ? '企业客户基础扎实，具备良好的付费转化潜力。'
                        : '企业客户占比偏低，建议加强B2B市场推广策略。'}
                    </Text>
                  </div>
                )}

                {/* 教育市场分析 */}
                {data && data.distribution.education > 0 && (
                  <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded">
                    <div className="flex items-center mb-2">
                      <BookOutlined className="text-green-500 mr-2" />
                      <Text strong className="text-green-800">教育市场机会</Text>
                    </div>
                    <Text className="text-green-700">
                      教育机构用户有 {data.distribution.education} 个，占比 {((data.distribution.education / Object.values(data.distribution).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%。
                      教育市场具有很大的推广潜力，建议开发针对性的教育版产品。
                    </Text>
                  </div>
                )}

                {/* 新域名商机 */}
                {data?.newDomains && data.newDomains.length > 0 && (
                  <div className="p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
                    <div className="flex items-center mb-2">
                      <TrophyOutlined className="text-orange-500 mr-2" />
                      <Text strong className="text-orange-800">新客户机会</Text>
                    </div>
                    <Text className="text-orange-700">
                      发现 {data.newDomains.length} 个新企业域名，平均用户数 {Math.round(data.newDomains.reduce((sum, domain) => sum + domain.users, 0) / data.newDomains.length)} 人。
                      建议针对这些新客户制定专门的欢迎流程和激活策略。
                    </Text>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {data.newDomains.slice(0, 5).map(domain => (
                        <Tag key={domain.domain} color="orange">
                          {domain.domain}
                        </Tag>
                      ))}
                      {data.newDomains.length > 5 && (
                        <Tag>还有 {data.newDomains.length - 5} 个...</Tag>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="关键指标总结" className="h-full">
                <div className="space-y-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {data?.topDomains?.length || 0}
                    </div>
                    <Text type="secondary">热门企业域名</Text>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {data?.newDomains?.length || 0}
                    </div>
                    <Text type="secondary">新发现域名</Text>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {data ? Object.values(data.distribution).reduce((a, b) => a + b, 0) : 0}
                    </div>
                    <Text type="secondary">总域名数量</Text>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {data ? ((data.distribution.corporate / Object.values(data.distribution).reduce((a, b) => a + b, 0)) * 100).toFixed(0) : 0}%
                    </div>
                    <Text type="secondary">企业域名占比</Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      </Spin>
    </div>
  );
};

export default DomainAnalysis;