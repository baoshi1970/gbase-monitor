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
  message,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Avatar,
  Tooltip,
  Badge,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  EyeOutlined,
  SettingOutlined,
  FileTextOutlined,
  StarOutlined,
  StarFilled,
  ShareAltOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;
const { Meta } = Card;
const { Option } = Select;

// 模板类型定义
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  isFavorite: boolean;
  usageCount: number;
  tags: string[];
  preview?: string;
  componentCount: number;
  estimatedTime: number; // 生成耗时估算（分钟）
}

const ReportTemplates: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: 'tpl_001',
      name: '质量指标综合报告',
      description: '包含Session解决率、负反馈率、转接率等核心质量指标的综合分析报告',
      category: '质量分析',
      author: '系统管理员',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      isPublic: true,
      isFavorite: true,
      usageCount: 245,
      tags: ['质量指标', '综合报告', '管理层'],
      componentCount: 8,
      estimatedTime: 3,
    },
    {
      id: 'tpl_002',
      name: '用户行为深度分析',
      description: '深入分析用户活跃度、域名分布、行为路径等用户行为数据',
      category: '用户分析',
      author: '数据分析师',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-22',
      isPublic: true,
      isFavorite: false,
      usageCount: 156,
      tags: ['用户行为', '活跃度', '路径分析'],
      componentCount: 12,
      estimatedTime: 5,
    },
    {
      id: 'tpl_003',
      name: '系统运维监控报告',
      description: '系统健康状况、资源使用、告警统计等运维监控数据报告',
      category: '系统监控',
      author: '运维工程师',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-25',
      isPublic: false,
      isFavorite: true,
      usageCount: 89,
      tags: ['系统监控', '运维', '健康度'],
      componentCount: 6,
      estimatedTime: 2,
    },
    {
      id: 'tpl_004',
      name: '业务趋势分析',
      description: '业务关键指标趋势分析，包含同比环比数据对比',
      category: '业务分析',
      author: '产品经理',
      createdAt: '2024-01-12',
      updatedAt: '2024-01-24',
      isPublic: true,
      isFavorite: false,
      usageCount: 178,
      tags: ['趋势分析', '业务指标', '对比'],
      componentCount: 10,
      estimatedTime: 4,
    },
  ]);
  
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(templates);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [form] = Form.useForm();

  // 分类统计
  const categories = [
    { key: 'all', name: '全部', count: templates.length },
    { key: '质量分析', name: '质量分析', count: templates.filter(t => t.category === '质量分析').length },
    { key: '用户分析', name: '用户分析', count: templates.filter(t => t.category === '用户分析').length },
    { key: '系统监控', name: '系统监控', count: templates.filter(t => t.category === '系统监控').length },
    { key: '业务分析', name: '业务分析', count: templates.filter(t => t.category === '业务分析').length },
  ];

  // 筛选和搜索
  const filterTemplates = useCallback(() => {
    let filtered = templates;

    // 分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // 关键词搜索
    if (searchKeyword) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        t.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, selectedCategory, searchKeyword]);

  React.useEffect(() => {
    filterTemplates();
  }, [filterTemplates]);

  // 切换收藏状态
  const toggleFavorite = useCallback((templateId: string) => {
    setTemplates(prev => prev.map(t =>
      t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
    ));
    message.success('收藏状态已更新');
  }, []);

  // 复制模板
  const duplicateTemplate = useCallback((template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: `tpl_${Date.now()}`,
      name: `${template.name} - 副本`,
      author: '当前用户',
      createdAt: dayjs().format('YYYY-MM-DD'),
      updatedAt: dayjs().format('YYYY-MM-DD'),
      usageCount: 0,
      isFavorite: false,
    };
    
    setTemplates(prev => [newTemplate, ...prev]);
    message.success('模板复制成功');
  }, []);

  // 删除模板
  const deleteTemplate = useCallback((templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    message.success('模板删除成功');
  }, []);

  // 编辑模板
  const handleEdit = useCallback((template: Template) => {
    setEditingTemplate(template);
    form.setFieldsValue(template);
    setModalVisible(true);
  }, [form]);

  // 保存模板编辑
  const handleSave = useCallback(async (values: any) => {
    try {
      if (editingTemplate) {
        setTemplates(prev => prev.map(t =>
          t.id === editingTemplate.id
            ? { ...t, ...values, updatedAt: dayjs().format('YYYY-MM-DD') }
            : t
        ));
        message.success('模板更新成功');
      } else {
        const newTemplate: Template = {
          id: `tpl_${Date.now()}`,
          ...values,
          author: '当前用户',
          createdAt: dayjs().format('YYYY-MM-DD'),
          updatedAt: dayjs().format('YYYY-MM-DD'),
          usageCount: 0,
          isFavorite: false,
          componentCount: 0,
          estimatedTime: 1,
        };
        setTemplates(prev => [newTemplate, ...prev]);
        message.success('模板创建成功');
      }
      
      setModalVisible(false);
      setEditingTemplate(null);
      form.resetFields();
    } catch (error) {
      message.error('保存失败');
    }
  }, [editingTemplate, form]);

  // 使用模板生成报表
  const handleUseTemplate = useCallback((template: Template) => {
    // 更新使用次数
    setTemplates(prev => prev.map(t =>
      t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
    ));
    
    message.success(`正在使用模板"${template.name}"生成报表`);
    // 这里可以跳转到报表生成页面或打开生成对话框
  }, []);

  // 表格列配置
  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Template) => (
        <div className="flex items-center space-x-2">
          <Avatar size="small" icon={<FileTextOutlined />} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{name}</span>
              {record.isFavorite && <StarFilled className="text-yellow-500" />}
              {!record.isPublic && <Tag color="orange" size="small">私有</Tag>}
            </div>
            <div className="text-xs text-gray-500">{record.description}</div>
          </div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      sorter: (a: Template, b: Template) => a.usageCount - b.usageCount,
      render: (count: number) => (
        <Badge count={count} showZero color="blue" />
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: (a: Template, b: Template) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
      render: (date: string) => dayjs(date).format('MM-DD'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (record: Template) => (
        <Space size="small">
          <Tooltip title="使用模板">
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleUseTemplate(record)}
            />
          </Tooltip>
          <Tooltip title="预览">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/reports/designer?template=${record.id}`)}
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
          <Tooltip title="复制">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => duplicateTemplate(record)}
            />
          </Tooltip>
          <Tooltip title={record.isFavorite ? '取消收藏' : '收藏'}>
            <Button
              type="text"
              size="small"
              icon={record.isFavorite ? <StarFilled /> : <StarOutlined />}
              className={record.isFavorite ? 'text-yellow-500' : ''}
              onClick={() => toggleFavorite(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="确认删除此模板？"
            onConfirm={() => deleteTemplate(record.id)}
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

  return (
    <div>
      {/* 页面标题和操作栏 */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <Title level={2} className="mb-2">
            报表模板管理
          </Title>
          <Text type="secondary" className="text-base">
            管理和使用报表模板，快速生成标准化报告
          </Text>
        </div>
        <Space>
          <Button 
            icon={<PlusOutlined />} 
            onClick={() => {
              setEditingTemplate(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建模板
          </Button>
          <Button 
            icon={<SettingOutlined />} 
            onClick={() => navigate('/reports/designer')}
          >
            设计器
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* 左侧分类筛选 */}
        <Col xs={24} lg={6}>
          <Card title="模板分类" size="small">
            <div className="space-y-2">
              {categories.map(category => (
                <div
                  key={category.key}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                    selectedCategory === category.key 
                      ? 'bg-blue-50 text-blue-600 border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedCategory(category.key)}
                >
                  <span>{category.name}</span>
                  <Badge count={category.count} color="blue" />
                </div>
              ))}
            </div>
          </Card>

          <Card title="快捷操作" size="small" className="mt-4">
            <Space direction="vertical" className="w-full">
              <Button block icon={<StarOutlined />}>
                我的收藏
              </Button>
              <Button block icon={<ShareAltOutlined />}>
                共享模板
              </Button>
              <Button block icon={<DownloadOutlined />}>
                导入模板
              </Button>
            </Space>
          </Card>
        </Col>

        {/* 右侧模板列表 */}
        <Col xs={24} lg={18}>
          {/* 搜索和视图控制 */}
          <div className="flex justify-between items-center mb-4">
            <Search
              placeholder="搜索模板名称、描述或标签"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            
            <Space>
              <Button.Group>
                <Button 
                  type={viewMode === 'card' ? 'primary' : 'default'}
                  onClick={() => setViewMode('card')}
                >
                  卡片视图
                </Button>
                <Button 
                  type={viewMode === 'table' ? 'primary' : 'default'}
                  onClick={() => setViewMode('table')}
                >
                  列表视图
                </Button>
              </Button.Group>
            </Space>
          </div>

          {/* 模板展示 */}
          {filteredTemplates.length === 0 ? (
            <Empty 
              description="没有找到匹配的模板" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : viewMode === 'card' ? (
            <Row gutter={[16, 16]}>
              {filteredTemplates.map(template => (
                <Col key={template.id} xs={24} sm={12} lg={8}>
                  <Card
                    hoverable
                    actions={[
                      <Tooltip title="使用模板" key="use">
                        <DownloadOutlined onClick={() => handleUseTemplate(template)} />
                      </Tooltip>,
                      <Tooltip title="编辑" key="edit">
                        <EditOutlined onClick={() => handleEdit(template)} />
                      </Tooltip>,
                      <Tooltip title="复制" key="copy">
                        <CopyOutlined onClick={() => duplicateTemplate(template)} />
                      </Tooltip>,
                      <Tooltip title={template.isFavorite ? '取消收藏' : '收藏'} key="favorite">
                        {template.isFavorite ? (
                          <StarFilled 
                            className="text-yellow-500" 
                            onClick={() => toggleFavorite(template.id)} 
                          />
                        ) : (
                          <StarOutlined onClick={() => toggleFavorite(template.id)} />
                        )}
                      </Tooltip>,
                    ]}
                  >
                    <Meta
                      avatar={<Avatar icon={<FileTextOutlined />} />}
                      title={
                        <div className="flex items-center justify-between">
                          <span className="truncate">{template.name}</span>
                          {!template.isPublic && <Tag color="orange" size="small">私有</Tag>}
                        </div>
                      }
                      description={
                        <div className="space-y-2">
                          <div className="text-xs text-gray-600 line-clamp-2">
                            {template.description}
                          </div>
                          <div className="flex items-center justify-between">
                            <Tag color="blue" size="small">{template.category}</Tag>
                            <div className="text-xs text-gray-500">
                              使用 {template.usageCount} 次
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {template.tags.slice(0, 2).map(tag => (
                              <Tag key={tag} size="small" color="default">
                                {tag}
                              </Tag>
                            ))}
                            {template.tags.length > 2 && (
                              <Tag size="small" color="default">+{template.tags.length - 2}</Tag>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            预计生成时间: {template.estimatedTime} 分钟
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredTemplates}
              rowKey="id"
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
              }}
            />
          )}
        </Col>
      </Row>

      {/* 编辑模板对话框 */}
      <Modal
        title={editingTemplate ? '编辑模板' : '新建模板'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTemplate(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="输入模板名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="模板描述"
            rules={[{ required: true, message: '请输入模板描述' }]}
          >
            <Input.TextArea rows={3} placeholder="输入模板描述" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="模板分类"
                rules={[{ required: true, message: '请选择模板分类' }]}
              >
                <Select placeholder="选择分类">
                  <Select.Option value="质量分析">质量分析</Select.Option>
                  <Select.Option value="用户分析">用户分析</Select.Option>
                  <Select.Option value="系统监控">系统监控</Select.Option>
                  <Select.Option value="业务分析">业务分析</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isPublic" label="公开模板" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="tags" label="标签">
            <Select
              mode="tags"
              placeholder="添加标签"
              options={[
                { label: '质量指标', value: '质量指标' },
                { label: '用户行为', value: '用户行为' },
                { label: '系统监控', value: '系统监控' },
                { label: '趋势分析', value: '趋势分析' },
                { label: '管理层', value: '管理层' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReportTemplates;