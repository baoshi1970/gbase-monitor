import React, { useState, useCallback } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Progress,
  message,
  Popconfirm,
  Tooltip,
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  Checkbox,
  TimePicker,
  Spin,
  Alert,
} from 'antd';
import {
  FileTextOutlined,
  PlusOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useReportManagement } from '../../hooks';
import type { ReportGenerateRequest } from '../../types/api';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const ReportsOverview: React.FC = () => {
  // 使用报表管理Hook
  const {
    generateData,
    generateLoading,
    generateError,
    generateReport,
    resetGenerate,
    listData,
    listLoading,
    listError,
    refreshList,
    goToPage,
    setFilters,
  } = useReportManagement();

  // 状态管理
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [form] = Form.useForm();

  // 报表模板配置
  const reportTemplates = [
    {
      id: 'quality-summary',
      name: '质量指标汇总报告',
      description: '包含Session解决率、负反馈率、转接率等核心质量指标',
      metrics: ['resolution_rate', 'negative_feedback', 'escalation_rate', 'quality_score'],
      icon: '📊',
    },
    {
      id: 'user-behavior',
      name: '用户行为分析报告',
      description: '用户活跃度、域名分析、行为路径等用户行为数据',
      metrics: ['user_activity', 'domain_analysis', 'behavior_path'],
      icon: '👥',
    },
    {
      id: 'system-health',
      name: '系统健康状况报告',
      description: '系统性能、资源使用、告警等运维监控数据',
      metrics: ['system_health', 'resource_usage', 'alerts'],
      icon: '🖥️',
    },
    {
      id: 'executive-summary',
      name: '管理层摘要报告',
      description: '高层管理所需的关键业务指标和趋势分析',
      metrics: ['key_metrics', 'trends', 'recommendations'],
      icon: '📈',
    },
  ];

  // 获取状态配置
  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { color: 'blue', icon: <ClockCircleOutlined />, text: '待生成' },
      generating: { color: 'orange', icon: <ReloadOutlined spin />, text: '生成中' },
      completed: { color: 'green', icon: <CheckCircleOutlined />, text: '已完成' },
      failed: { color: 'red', icon: <CloseCircleOutlined />, text: '失败' },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  // 处理创建报表
  const handleCreateReport = useCallback(async (values: any) => {
    try {
      const params: ReportGenerateRequest = {
        type: values.type,
        template: values.template,
        parameters: {
          timeRange: {
            startDate: values.dateRange[0].format('YYYY-MM-DD'),
            endDate: values.dateRange[1].format('YYYY-MM-DD'),
          },
          metrics: values.metrics || [],
          format: values.format,
          recipients: values.recipients ? values.recipients.split(',').map((r: string) => r.trim()) : [],
          ...(values.schedule && {
            schedule: {
              frequency: values.scheduleFrequency,
              time: values.scheduleTime?.format('HH:mm'),
              timezone: 'Asia/Tokyo',
            },
          }),
        },
      };

      await generateReport(params);
      
      if (generateData && !generateError) {
        message.success('报表生成任务已提交');
        setCreateModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      message.error('报表生成失败');
    }
  }, [generateReport, generateData, generateError, form]);

  // 处理下载报表
  const handleDownload = (record: any) => {
    if (record.downloadUrl) {
      window.open(record.downloadUrl, '_blank');
      message.success('开始下载报表');
    } else {
      message.warning('报表文件不可用');
    }
  };

  // 处理删除报表
  const handleDelete = async (reportId: string) => {
    try {
      // 模拟删除API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('报表删除成功');
      refreshList();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 处理预览报表
  const handlePreview = (record: any) => {
    setSelectedReport(record);
    setPreviewModalVisible(true);
  };

  // 报表列表表格列配置
  const columns = [
    {
      title: '报表名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-sm text-gray-500">ID: {record.id}</div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap = {
          daily: '日报',
          weekly: '周报',
          monthly: '月报',
          custom: '自定义',
        };
        return <Tag color="blue">{typeMap[type as keyof typeof typeMap] || type}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size: number) => size ? `${(size / 1024 / 1024).toFixed(2)} MB` : '-',
    },
    {
      title: '过期时间',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date: string) => date ? (
        <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>
          <Text type={dayjs(date).isBefore(dayjs()) ? 'danger' : 'secondary'}>
            {dayjs(date).fromNow()}
          </Text>
        </Tooltip>
      ) : '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (record: any) => (
        <Space>
          {record.status === 'completed' && (
            <Tooltip title="预览报表">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handlePreview(record)}
              />
            </Tooltip>
          )}
          {record.status === 'completed' && record.downloadUrl && (
            <Tooltip title="下载报表">
              <Button
                type="text"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(record)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="确认删除此报表？"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Tooltip title="删除报表">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 页面标题和操作栏 */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <Title level={2} className="mb-2">
            报表管理中心
          </Title>
          <Text type="secondary" className="text-base">
            生成、管理和下载各类业务分析报表
          </Text>
        </div>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={refreshList}
            loading={listLoading}
          >
            刷新列表
          </Button>
          <Button 
            type="primary"
            icon={<PlusOutlined />} 
            onClick={() => setCreateModalVisible(true)}
          >
            创建报表
          </Button>
        </Space>
      </div>

      {/* 快捷报表模板 */}
      <Card title="快捷报表模板" className="mb-6">
        <Row gutter={[16, 16]}>
          {reportTemplates.map(template => (
            <Col key={template.id} xs={24} sm={12} lg={6}>
              <Card
                size="small"
                hoverable
                className="template-card"
                onClick={() => {
                  form.setFieldsValue({
                    template: template.id,
                    metrics: template.metrics,
                    type: 'custom',
                    format: 'pdf',
                    dateRange: [dayjs().subtract(7, 'days'), dayjs()],
                  });
                  setCreateModalVisible(true);
                }}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{template.icon}</div>
                  <div className="font-medium mb-1">{template.name}</div>
                  <div className="text-sm text-gray-500 mb-3">{template.description}</div>
                  <Button type="primary" size="small">
                    快速创建
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 报表列表 */}
      <Card title="报表列表">
        {listError && (
          <Alert 
            message="加载失败" 
            description={listError} 
            type="error" 
            showIcon 
            className="mb-4"
          />
        )}
        
        <Table
          columns={columns}
          dataSource={listData?.data || []}
          rowKey="id"
          loading={listLoading}
          pagination={{
            current: listData?.pagination.current || 1,
            pageSize: listData?.pagination.pageSize || 10,
            total: listData?.pagination.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              if (pageSize !== listData?.pagination.pageSize) {
                goToPage(1);
              } else {
                goToPage(page);
              }
            },
          }}
        />
      </Card>

      {/* 创建报表模态框 */}
      <Modal
        title="创建新报表"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
          resetGenerate();
        }}
        onOk={() => form.submit()}
        confirmLoading={generateLoading}
        width={800}
      >
        <Spin spinning={generateLoading}>
          {generateError && (
            <Alert 
              message="报表生成失败" 
              description={generateError} 
              type="error" 
              showIcon 
              className="mb-4"
            />
          )}
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateReport}
            initialValues={{
              type: 'custom',
              format: 'pdf',
              dateRange: [dayjs().subtract(7, 'days'), dayjs()],
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="template"
                  label="报表模板"
                  rules={[{ required: true, message: '请选择报表模板' }]}
                >
                  <Select placeholder="选择报表模板">
                    {reportTemplates.map(template => (
                      <Option key={template.id} value={template.id}>
                        <div className="flex items-center">
                          <span className="mr-2">{template.icon}</span>
                          {template.name}
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="报表类型"
                  rules={[{ required: true, message: '请选择报表类型' }]}
                >
                  <Select>
                    <Option value="daily">日报</Option>
                    <Option value="weekly">周报</Option>
                    <Option value="monthly">月报</Option>
                    <Option value="custom">自定义</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="dateRange"
                  label="时间范围"
                  rules={[{ required: true, message: '请选择时间范围' }]}
                >
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="format"
                  label="输出格式"
                  rules={[{ required: true, message: '请选择输出格式' }]}
                >
                  <Select>
                    <Option value="pdf">PDF</Option>
                    <Option value="excel">Excel</Option>
                    <Option value="csv">CSV</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="metrics" label="包含指标">
              <Checkbox.Group>
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <Checkbox value="resolution_rate">Session解决率</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="negative_feedback">负反馈率</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="escalation_rate">人工转接率</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="quality_score">质量得分</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="user_activity">用户活跃度</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="domain_analysis">域名分析</Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item name="recipients" label="邮件接收者">
              <TextArea
                placeholder="输入邮箱地址，多个邮箱用逗号分隔"
                rows={3}
              />
            </Form.Item>

            <Form.Item name="schedule" valuePropName="checked" label="定时生成">
              <Checkbox>启用定时生成</Checkbox>
            </Form.Item>

            <Form.Item shouldUpdate={(prevValues, currentValues) => 
              prevValues.schedule !== currentValues.schedule
            }>
              {({ getFieldValue }) => 
                getFieldValue('schedule') ? (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="scheduleFrequency" label="频率">
                        <Select>
                          <Option value="daily">每日</Option>
                          <Option value="weekly">每周</Option>
                          <Option value="monthly">每月</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="scheduleTime" label="时间">
                        <TimePicker format="HH:mm" />
                      </Form.Item>
                    </Col>
                  </Row>
                ) : null
              }
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      {/* 报表预览模态框 */}
      <Modal
        title="报表预览"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            关闭
          </Button>,
          selectedReport?.downloadUrl && (
            <Button 
              key="download" 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(selectedReport)}
            >
              下载报表
            </Button>
          ),
        ]}
        width={800}
      >
        {selectedReport && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text strong>报表名称: </Text>
                  <Text>{selectedReport.name}</Text>
                </div>
                <div>
                  <Text strong>创建时间: </Text>
                  <Text>{dayjs(selectedReport.createdAt).format('YYYY-MM-DD HH:mm')}</Text>
                </div>
                <div>
                  <Text strong>文件大小: </Text>
                  <Text>{selectedReport.fileSize ? `${(selectedReport.fileSize / 1024 / 1024).toFixed(2)} MB` : '-'}</Text>
                </div>
                <div>
                  <Text strong>状态: </Text>
                  {(() => {
                    const config = getStatusConfig(selectedReport.status);
                    return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
                  })()}
                </div>
              </div>
            </div>
            
            <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
              <FileTextOutlined className="text-6xl text-gray-400 mb-4" />
              <div className="text-lg font-medium mb-2">报表预览</div>
              <Text type="secondary">
                {selectedReport.status === 'completed' 
                  ? '报表已生成，点击下载按钮获取文件'
                  : '报表尚未生成完成，请稍后查看'}
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportsOverview;