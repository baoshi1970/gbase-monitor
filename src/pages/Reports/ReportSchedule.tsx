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
  Switch,
  message,
  Modal,
  Form,
  Select,
  Input,
  DatePicker,
  TimePicker,
  Checkbox,
  Divider,
  Tooltip,
  Badge,
  Progress,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  MailOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

// 调度任务类型定义
interface ScheduleTask {
  id: string;
  name: string;
  description: string;
  templateId: string;
  templateName: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    time: string;
    dayOfWeek?: number; // 0=Sunday, 1=Monday, ...
    dayOfMonth?: number; // 1-31
    timezone: string;
  };
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastRun?: string;
  nextRun: string;
  runCount: number;
  successCount: number;
  status: 'active' | 'paused' | 'error';
}

interface ExecutionLog {
  id: string;
  taskId: string;
  executedAt: string;
  status: 'success' | 'failed' | 'running';
  duration: number; // seconds
  error?: string;
  reportSize?: number; // bytes
}

const ReportSchedule: React.FC = () => {
  // 状态管理
  const [tasks, setTasks] = useState<ScheduleTask[]>([
    {
      id: 'task_001',
      name: '每日质量报告',
      description: '每日生成质量指标汇总报告，发送给管理层',
      templateId: 'tpl_001',
      templateName: '质量指标综合报告',
      schedule: {
        frequency: 'daily',
        time: '09:00',
        timezone: 'Asia/Tokyo',
      },
      recipients: ['manager@company.com', 'team@company.com'],
      format: 'pdf',
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-25',
      lastRun: '2024-01-25 09:00:00',
      nextRun: '2024-01-26 09:00:00',
      runCount: 45,
      successCount: 44,
      status: 'active',
    },
    {
      id: 'task_002',
      name: '周度用户分析',
      description: '每周一生成用户行为分析报告',
      templateId: 'tpl_002',
      templateName: '用户行为深度分析',
      schedule: {
        frequency: 'weekly',
        time: '08:30',
        dayOfWeek: 1, // Monday
        timezone: 'Asia/Tokyo',
      },
      recipients: ['analyst@company.com', 'product@company.com'],
      format: 'excel',
      isActive: true,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-20',
      lastRun: '2024-01-22 08:30:00',
      nextRun: '2024-01-29 08:30:00',
      runCount: 6,
      successCount: 6,
      status: 'active',
    },
    {
      id: 'task_003',
      name: '月度运维报告',
      description: '每月1号生成系统运维监控报告',
      templateId: 'tpl_003',
      templateName: '系统运维监控报告',
      schedule: {
        frequency: 'monthly',
        time: '07:00',
        dayOfMonth: 1,
        timezone: 'Asia/Tokyo',
      },
      recipients: ['ops@company.com'],
      format: 'pdf',
      isActive: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-24',
      lastRun: '2024-01-01 07:00:00',
      nextRun: '2024-02-01 07:00:00',
      runCount: 1,
      successCount: 0,
      status: 'paused',
    },
  ]);

  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([
    {
      id: 'log_001',
      taskId: 'task_001',
      executedAt: '2024-01-25 09:00:00',
      status: 'success',
      duration: 85,
      reportSize: 2048000,
    },
    {
      id: 'log_002',
      taskId: 'task_002',
      executedAt: '2024-01-22 08:30:00',
      status: 'success',
      duration: 156,
      reportSize: 5120000,
    },
    {
      id: 'log_003',
      taskId: 'task_001',
      executedAt: '2024-01-24 09:00:00',
      status: 'failed',
      duration: 15,
      error: '数据源连接超时',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [logsModalVisible, setLogsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [form] = Form.useForm();

  // 获取状态配置
  const getStatusConfig = (status: string) => {
    const configs = {
      active: { color: 'green', icon: <CheckCircleOutlined />, text: '运行中' },
      paused: { color: 'orange', icon: <PauseCircleOutlined />, text: '已暂停' },
      error: { color: 'red', icon: <CloseCircleOutlined />, text: '异常' },
    };
    return configs[status as keyof typeof configs] || configs.active;
  };

  // 获取执行状态配置
  const getExecutionStatusConfig = (status: string) => {
    const configs = {
      success: { color: 'green', icon: <CheckCircleOutlined />, text: '成功' },
      failed: { color: 'red', icon: <CloseCircleOutlined />, text: '失败' },
      running: { color: 'blue', icon: <ClockCircleOutlined />, text: '运行中' },
    };
    return configs[status as keyof typeof configs] || configs.success;
  };

  // 切换任务状态
  const toggleTaskStatus = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, isActive: !task.isActive, status: !task.isActive ? 'active' : 'paused' }
        : task
    ));
    message.success('任务状态已更新');
  }, []);

  // 立即执行任务
  const executeTaskNow = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    message.loading({ content: '正在执行任务...', key: 'execute' });
    
    try {
      // 模拟任务执行
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 添加执行日志
      const newLog: ExecutionLog = {
        id: `log_${Date.now()}`,
        taskId,
        executedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        status: Math.random() > 0.2 ? 'success' : 'failed',
        duration: Math.floor(Math.random() * 120) + 30,
        reportSize: Math.floor(Math.random() * 5000000) + 1000000,
        ...(Math.random() <= 0.2 && { error: '模拟执行错误' }),
      };
      
      setExecutionLogs(prev => [newLog, ...prev]);
      
      // 更新任务统计
      setTasks(prev => prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              lastRun: newLog.executedAt,
              runCount: t.runCount + 1,
              successCount: newLog.status === 'success' ? t.successCount + 1 : t.successCount,
            }
          : t
      ));
      
      message.success({ content: '任务执行完成', key: 'execute' });
    } catch (error) {
      message.error({ content: '任务执行失败', key: 'execute' });
    }
  }, [tasks]);

  // 删除任务
  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setExecutionLogs(prev => prev.filter(log => log.taskId !== taskId));
    message.success('调度任务已删除');
  }, []);

  // 编辑任务
  const handleEdit = useCallback((task: ScheduleTask) => {
    setEditingTask(task);
    form.setFieldsValue({
      ...task,
      time: dayjs(task.schedule.time, 'HH:mm'),
      recipients: task.recipients.join(', '),
    });
    setModalVisible(true);
  }, [form]);

  // 保存任务
  const handleSave = useCallback(async (values: any) => {
    try {
      const taskData = {
        ...values,
        schedule: {
          ...values.schedule,
          time: values.time.format('HH:mm'),
        },
        recipients: values.recipients.split(',').map((r: string) => r.trim()),
        updatedAt: dayjs().format('YYYY-MM-DD'),
        nextRun: calculateNextRun(values.schedule, values.time),
      };

      if (editingTask) {
        setTasks(prev => prev.map(t =>
          t.id === editingTask.id ? { ...t, ...taskData } : t
        ));
        message.success('调度任务更新成功');
      } else {
        const newTask: ScheduleTask = {
          id: `task_${Date.now()}`,
          ...taskData,
          createdAt: dayjs().format('YYYY-MM-DD'),
          runCount: 0,
          successCount: 0,
          status: 'active',
        };
        setTasks(prev => [newTask, ...prev]);
        message.success('调度任务创建成功');
      }
      
      setModalVisible(false);
      setEditingTask(null);
      form.resetFields();
    } catch (error) {
      message.error('保存失败');
    }
  }, [editingTask, form]);

  // 计算下次执行时间（简化实现）
  const calculateNextRun = (schedule: any, time: Dayjs) => {
    const now = dayjs();
    const timeStr = time.format('HH:mm');
    
    switch (schedule.frequency) {
      case 'daily':
        return now.add(1, 'day').format('YYYY-MM-DD') + ' ' + timeStr + ':00';
      case 'weekly':
        return now.add(7, 'day').format('YYYY-MM-DD') + ' ' + timeStr + ':00';
      case 'monthly':
        return now.add(1, 'month').format('YYYY-MM-DD') + ' ' + timeStr + ':00';
      default:
        return now.add(1, 'day').format('YYYY-MM-DD') + ' ' + timeStr + ':00';
    }
  };

  // 查看执行日志
  const viewLogs = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
    setLogsModalVisible(true);
  }, []);

  // 任务列表表格列配置
  const taskColumns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ScheduleTask) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-sm text-gray-500">{record.description}</div>
          <div className="text-xs text-gray-400 mt-1">
            模板: {record.templateName}
          </div>
        </div>
      ),
    },
    {
      title: '调度设置',
      key: 'schedule',
      render: (record: ScheduleTask) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <CalendarOutlined className="text-blue-500" />
            <span className="text-sm">
              {record.schedule.frequency === 'daily' && '每日'}
              {record.schedule.frequency === 'weekly' && '每周'}
              {record.schedule.frequency === 'monthly' && '每月'}
            </span>
            <span className="text-sm font-medium">{record.schedule.time}</span>
          </div>
          {record.schedule.dayOfWeek !== undefined && (
            <div className="text-xs text-gray-500">
              周{['日', '一', '二', '三', '四', '五', '六'][record.schedule.dayOfWeek]}
            </div>
          )}
          {record.schedule.dayOfMonth && (
            <div className="text-xs text-gray-500">
              每月{record.schedule.dayOfMonth}号
            </div>
          )}
        </div>
      ),
    },
    {
      title: '接收者',
      dataIndex: 'recipients',
      key: 'recipients',
      render: (recipients: string[]) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <MailOutlined className="text-gray-400" />
            <span className="text-sm">{recipients.length} 个接收者</span>
          </div>
          <div className="text-xs text-gray-500 max-w-48 truncate">
            {recipients.join(', ')}
          </div>
        </div>
      ),
    },
    {
      title: '执行统计',
      key: 'stats',
      render: (record: ScheduleTask) => (
        <div className="space-y-1">
          <div className="text-sm">
            总执行: <span className="font-medium">{record.runCount}</span> 次
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm">成功率:</span>
            <Progress
              percent={record.runCount > 0 ? (record.successCount / record.runCount) * 100 : 0}
              size="small"
              className="w-16"
            />
            <span className="text-xs text-gray-500">
              {record.runCount > 0 ? ((record.successCount / record.runCount) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: ScheduleTask) => {
        const config = getStatusConfig(status);
        return (
          <div className="space-y-1">
            <Tag color={config.color} icon={config.icon}>
              {config.text}
            </Tag>
            <div className="text-xs text-gray-500">
              下次: {dayjs(record.nextRun).format('MM-DD HH:mm')}
            </div>
          </div>
        );
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (record: ScheduleTask) => (
        <Space size="small">
          <Tooltip title={record.isActive ? '暂停' : '启用'}>
            <Switch
              size="small"
              checked={record.isActive}
              onChange={() => toggleTaskStatus(record.id)}
            />
          </Tooltip>
          <Tooltip title="立即执行">
            <Button
              type="text"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => executeTaskNow(record.id)}
              disabled={!record.isActive}
            />
          </Tooltip>
          <Tooltip title="查看日志">
            <Button
              type="text"
              size="small"
              icon={<ClockCircleOutlined />}
              onClick={() => viewLogs(record.id)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确认删除此调度任务？"
            onConfirm={() => deleteTask(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Tooltip title="删除">
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

  // 执行日志表格列配置
  const logColumns = [
    {
      title: '执行时间',
      dataIndex: 'executedAt',
      key: 'executedAt',
      render: (date: string) => dayjs(date).format('MM-DD HH:mm:ss'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = getExecutionStatusConfig(status);
        return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
      },
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration}秒`,
    },
    {
      title: '文件大小',
      dataIndex: 'reportSize',
      key: 'reportSize',
      render: (size?: number) => size ? `${(size / 1024 / 1024).toFixed(2)} MB` : '-',
    },
    {
      title: '错误信息',
      dataIndex: 'error',
      key: 'error',
      render: (error?: string) => error ? (
        <Tooltip title={error}>
          <Text type="danger" className="truncate max-w-32">{error}</Text>
        </Tooltip>
      ) : '-',
    },
  ];

  const selectedTaskLogs = executionLogs.filter(log => log.taskId === selectedTaskId);
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  return (
    <div>
      {/* 页面标题和操作栏 */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <Title level={2} className="mb-2">
            报表调度管理
          </Title>
          <Text type="secondary" className="text-base">
            管理定时报表生成任务，自动化报告分发
          </Text>
        </div>
        <Space>
          <Button 
            type="primary"
            icon={<PlusOutlined />} 
            onClick={() => {
              setEditingTask(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建调度任务
          </Button>
        </Space>
      </div>

      {/* 统计概览 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={6}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {tasks.length}
              </div>
              <div className="text-sm text-gray-500">总任务数</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {tasks.filter(t => t.isActive).length}
              </div>
              <div className="text-sm text-gray-500">运行中</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {tasks.reduce((sum, t) => sum + t.runCount, 0)}
              </div>
              <div className="text-sm text-gray-500">总执行次数</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {((tasks.reduce((sum, t) => sum + t.successCount, 0) / Math.max(tasks.reduce((sum, t) => sum + t.runCount, 0), 1)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">平均成功率</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 任务列表 */}
      <Card title="调度任务列表">
        <Table
          columns={taskColumns}
          dataSource={tasks}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 新建/编辑任务对话框 */}
      <Modal
        title={editingTask ? '编辑调度任务' : '新建调度任务'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTask(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="任务名称"
                rules={[{ required: true, message: '请输入任务名称' }]}
              >
                <Input placeholder="输入任务名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="templateId"
                label="报表模板"
                rules={[{ required: true, message: '请选择报表模板' }]}
              >
                <Select placeholder="选择报表模板">
                  <Option value="tpl_001">质量指标综合报告</Option>
                  <Option value="tpl_002">用户行为深度分析</Option>
                  <Option value="tpl_003">系统运维监控报告</Option>
                  <Option value="tpl_004">业务趋势分析</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="任务描述"
          >
            <TextArea rows={3} placeholder="输入任务描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name={['schedule', 'frequency']}
                label="执行频率"
                rules={[{ required: true, message: '请选择执行频率' }]}
              >
                <Select placeholder="选择频率">
                  <Option value="daily">每日</Option>
                  <Option value="weekly">每周</Option>
                  <Option value="monthly">每月</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="time"
                label="执行时间"
                rules={[{ required: true, message: '请选择执行时间' }]}
              >
                <TimePicker format="HH:mm" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="format"
                label="输出格式"
                rules={[{ required: true, message: '请选择输出格式' }]}
              >
                <Select placeholder="选择格式">
                  <Option value="pdf">PDF</Option>
                  <Option value="excel">Excel</Option>
                  <Option value="csv">CSV</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item shouldUpdate={(prevValues, currentValues) => 
            prevValues.schedule?.frequency !== currentValues.schedule?.frequency
          }>
            {({ getFieldValue }) => {
              const frequency = getFieldValue(['schedule', 'frequency']);
              return (
                <Row gutter={16}>
                  {frequency === 'weekly' && (
                    <Col span={12}>
                      <Form.Item
                        name={['schedule', 'dayOfWeek']}
                        label="执行日期"
                      >
                        <Select placeholder="选择星期几">
                          <Option value={1}>星期一</Option>
                          <Option value={2}>星期二</Option>
                          <Option value={3}>星期三</Option>
                          <Option value={4}>星期四</Option>
                          <Option value={5}>星期五</Option>
                          <Option value={6}>星期六</Option>
                          <Option value={0}>星期日</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  )}
                  {frequency === 'monthly' && (
                    <Col span={12}>
                      <Form.Item
                        name={['schedule', 'dayOfMonth']}
                        label="执行日期"
                      >
                        <Select placeholder="选择几号">
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <Option key={day} value={day}>{day}号</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              );
            }}
          </Form.Item>

          <Form.Item
            name="recipients"
            label="邮件接收者"
            rules={[{ required: true, message: '请输入邮件接收者' }]}
          >
            <TextArea
              rows={2}
              placeholder="输入邮箱地址，多个邮箱用逗号分隔"
            />
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
            <Checkbox>创建后立即启用</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      {/* 执行日志对话框 */}
      <Modal
        title={`执行日志 - ${selectedTask?.name}`}
        open={logsModalVisible}
        onCancel={() => setLogsModalVisible(false)}
        footer={null}
        width={800}
      >
        <div className="mb-4">
          <Text type="secondary">
            任务ID: {selectedTaskId} | 总执行: {selectedTask?.runCount} 次 | 成功: {selectedTask?.successCount} 次
          </Text>
        </div>
        
        <Table
          columns={logColumns}
          dataSource={selectedTaskLogs}
          rowKey="id"
          size="small"
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
        />
      </Modal>
    </div>
  );
};

export default ReportSchedule;