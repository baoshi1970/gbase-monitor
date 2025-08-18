import React, { useState, useCallback } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Space,
  Form,
  Input,
  Select,
  Checkbox,
  Radio,
  Switch,
  Divider,
  message,
  Modal,
  Tree,
  Tag,
  Collapse,
  ColorPicker,
  Slider,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  SaveOutlined,
  CopyOutlined,
  SettingOutlined,
  DragOutlined,
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
  TableOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { Dragger } = Upload;

// 报表组件类型定义
interface ReportComponent {
  id: string;
  type: 'chart' | 'table' | 'text' | 'image' | 'metric';
  title: string;
  config: any;
  position: { x: number; y: number; width: number; height: number };
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  components: ReportComponent[];
  layout: 'grid' | 'free' | 'vertical';
  theme: string;
  settings: {
    pageSize: 'A4' | 'A3' | 'Letter';
    orientation: 'portrait' | 'landscape';
    margins: { top: number; right: number; bottom: number; left: number };
  };
}

const ReportDesigner: React.FC = () => {
  // 状态管理
  const [currentTemplate, setCurrentTemplate] = useState<ReportTemplate | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 组件库数据
  const componentLibrary = [
    {
      category: '图表组件',
      components: [
        { type: 'chart', subtype: 'line', name: '趋势线图', icon: <LineChartOutlined /> },
        { type: 'chart', subtype: 'bar', name: '柱状图', icon: <BarChartOutlined /> },
        { type: 'chart', subtype: 'pie', name: '饼图', icon: <PieChartOutlined /> },
      ],
    },
    {
      category: '数据表格',
      components: [
        { type: 'table', subtype: 'basic', name: '基础表格', icon: <TableOutlined /> },
        { type: 'table', subtype: 'summary', name: '汇总表格', icon: <TableOutlined /> },
      ],
    },
    {
      category: '文本内容',
      components: [
        { type: 'text', subtype: 'title', name: '标题', icon: <FileTextOutlined /> },
        { type: 'text', subtype: 'paragraph', name: '段落', icon: <FileTextOutlined /> },
        { type: 'metric', subtype: 'kpi', name: 'KPI指标', icon: <FileTextOutlined /> },
      ],
    },
  ];

  // 可用数据源
  const dataSources: DataNode[] = [
    {
      title: '质量指标',
      key: 'quality',
      children: [
        { title: 'Session解决率', key: 'resolution_rate', isLeaf: true },
        { title: '负反馈率', key: 'negative_feedback', isLeaf: true },
        { title: '人工转接率', key: 'escalation_rate', isLeaf: true },
        { title: 'AI质量得分', key: 'quality_score', isLeaf: true },
      ],
    },
    {
      title: '用户行为',
      key: 'user_behavior',
      children: [
        { title: '用户活跃度', key: 'user_activity', isLeaf: true },
        { title: '域名分析', key: 'domain_analysis', isLeaf: true },
        { title: '行为路径', key: 'behavior_path', isLeaf: true },
      ],
    },
    {
      title: '系统监控',
      key: 'system',
      children: [
        { title: '系统健康度', key: 'system_health', isLeaf: true },
        { title: '资源使用', key: 'resource_usage', isLeaf: true },
        { title: '告警信息', key: 'alerts', isLeaf: true },
      ],
    },
  ];

  // 初始化新模板
  const initializeTemplate = useCallback(() => {
    const newTemplate: ReportTemplate = {
      id: `template_${Date.now()}`,
      name: '未命名报表',
      description: '',
      components: [],
      layout: 'grid',
      theme: 'default',
      settings: {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
      },
    };
    setCurrentTemplate(newTemplate);
  }, []);

  // 添加组件
  const addComponent = useCallback((componentType: string, subtype: string) => {
    if (!currentTemplate) return;

    const newComponent: ReportComponent = {
      id: `component_${Date.now()}`,
      type: componentType as any,
      title: `新${componentType === 'chart' ? '图表' : componentType === 'table' ? '表格' : '组件'}`,
      config: {
        subtype,
        dataSource: null,
        style: {
          backgroundColor: '#ffffff',
          borderColor: '#d9d9d9',
          borderWidth: 1,
        },
        ...(componentType === 'chart' && {
          chartConfig: {
            colors: ['#1890ff', '#52c41a', '#faad14', '#f5222d'],
            legend: true,
            grid: true,
          },
        }),
        ...(componentType === 'text' && {
          content: '请输入内容',
          fontSize: 14,
          color: '#000000',
          align: 'left',
        }),
      },
      position: {
        x: Math.random() * 400,
        y: Math.random() * 300,
        width: 300,
        height: 200,
      },
    };

    setCurrentTemplate({
      ...currentTemplate,
      components: [...currentTemplate.components, newComponent],
    });
    setSelectedComponent(newComponent.id);
  }, [currentTemplate]);

  // 更新组件
  const updateComponent = useCallback((componentId: string, updates: Partial<ReportComponent>) => {
    if (!currentTemplate) return;

    setCurrentTemplate({
      ...currentTemplate,
      components: currentTemplate.components.map(comp =>
        comp.id === componentId ? { ...comp, ...updates } : comp
      ),
    });
  }, [currentTemplate]);

  // 删除组件
  const deleteComponent = useCallback((componentId: string) => {
    if (!currentTemplate) return;

    setCurrentTemplate({
      ...currentTemplate,
      components: currentTemplate.components.filter(comp => comp.id !== componentId),
    });
    if (selectedComponent === componentId) {
      setSelectedComponent(null);
    }
  }, [currentTemplate, selectedComponent]);

  // 保存模板
  const saveTemplate = useCallback(async (values: any) => {
    if (!currentTemplate) return;

    try {
      const templateToSave = {
        ...currentTemplate,
        name: values.name,
        description: values.description,
        updatedAt: new Date().toISOString(),
      };

      // 模拟保存API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('报表模板保存成功');
      setSaveModalVisible(false);
    } catch (error) {
      message.error('保存失败');
    }
  }, [currentTemplate]);

  // 预览报表
  const handlePreview = useCallback(() => {
    setPreviewMode(!previewMode);
  }, [previewMode]);

  // 获取选中的组件
  const selectedComponentData = currentTemplate?.components.find(
    comp => comp.id === selectedComponent
  );

  return (
    <div className="h-full flex flex-col">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <Title level={3} className="m-0">
              自定义报表设计器
            </Title>
            <Text type="secondary">
              拖拽设计自定义报表模板
            </Text>
          </div>
          <Space>
            <Button onClick={initializeTemplate}>
              新建模板
            </Button>
            <Button 
              icon={<EyeOutlined />} 
              onClick={handlePreview}
              type={previewMode ? 'primary' : 'default'}
            >
              {previewMode ? '退出预览' : '预览'}
            </Button>
            <Button 
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => setSaveModalVisible(true)}
              disabled={!currentTemplate}
            >
              保存模板
            </Button>
          </Space>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex">
        {/* 左侧面板 */}
        {!previewMode && (
          <div className="w-80 bg-white border-r flex flex-col">
            {/* 组件库 */}
            <div className="flex-1 p-4">
              <Title level={5}>组件库</Title>
              <Collapse size="small" ghost>
                {componentLibrary.map(category => (
                  <Panel header={category.category} key={category.category}>
                    <div className="space-y-2">
                      {category.components.map(comp => (
                        <div
                          key={`${comp.type}_${comp.subtype}`}
                          className="flex items-center justify-between p-2 border border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-500 hover:bg-blue-50"
                          onClick={() => addComponent(comp.type, comp.subtype)}
                        >
                          <div className="flex items-center space-x-2">
                            {comp.icon}
                            <span className="text-sm">{comp.name}</span>
                          </div>
                          <PlusOutlined className="text-blue-500" />
                        </div>
                      ))}
                    </div>
                  </Panel>
                ))}
              </Collapse>
            </div>

            {/* 数据源 */}
            <div className="border-t p-4">
              <Title level={5}>数据源</Title>
              <Tree
                treeData={dataSources}
                onSelect={(keys) => {
                  if (selectedComponent && keys.length > 0) {
                    updateComponent(selectedComponent, {
                      config: {
                        ...selectedComponentData?.config,
                        dataSource: keys[0],
                      },
                    });
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* 中间设计区域 */}
        <div className="flex-1 bg-gray-100 p-4">
          {currentTemplate ? (
            <div className="bg-white rounded-lg shadow-sm h-full p-8 relative overflow-auto">
              {/* 页面标题 */}
              <div className="mb-6 text-center">
                <Title level={2}>{currentTemplate.name}</Title>
                {currentTemplate.description && (
                  <Paragraph type="secondary">{currentTemplate.description}</Paragraph>
                )}
              </div>

              {/* 组件渲染区域 */}
              <div className="relative min-h-96">
                {currentTemplate.components.map(component => (
                  <div
                    key={component.id}
                    className={`absolute border-2 p-4 bg-white rounded cursor-pointer ${
                      selectedComponent === component.id 
                        ? 'border-blue-500 shadow-lg' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    style={{
                      left: component.position.x,
                      top: component.position.y,
                      width: component.position.width,
                      height: component.position.height,
                    }}
                    onClick={() => !previewMode && setSelectedComponent(component.id)}
                  >
                    {/* 组件工具栏 */}
                    {!previewMode && selectedComponent === component.id && (
                      <div className="absolute -top-8 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                        <DragOutlined />
                        <span>{component.title}</span>
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          className="text-white hover:text-red-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteComponent(component.id);
                          }}
                        />
                      </div>
                    )}

                    {/* 组件内容渲染 */}
                    <div className="w-full h-full flex items-center justify-center">
                      {component.type === 'chart' && (
                        <div className="text-center">
                          {component.config.subtype === 'line' && <LineChartOutlined className="text-4xl text-blue-500 mb-2" />}
                          {component.config.subtype === 'bar' && <BarChartOutlined className="text-4xl text-green-500 mb-2" />}
                          {component.config.subtype === 'pie' && <PieChartOutlined className="text-4xl text-orange-500 mb-2" />}
                          <div>{component.title}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {component.config.dataSource ? (
                              <Tag size="small">{component.config.dataSource}</Tag>
                            ) : (
                              '请选择数据源'
                            )}
                          </div>
                        </div>
                      )}

                      {component.type === 'table' && (
                        <div className="text-center">
                          <TableOutlined className="text-4xl text-purple-500 mb-2" />
                          <div>{component.title}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {component.config.dataSource ? (
                              <Tag size="small">{component.config.dataSource}</Tag>
                            ) : (
                              '请选择数据源'
                            )}
                          </div>
                        </div>
                      )}

                      {component.type === 'text' && (
                        <div className="w-full h-full">
                          <div
                            style={{
                              fontSize: component.config.fontSize,
                              color: component.config.color,
                              textAlign: component.config.align,
                            }}
                          >
                            {component.config.content}
                          </div>
                        </div>
                      )}

                      {component.type === 'metric' && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {component.config.dataSource ? '87.5%' : '--'}
                          </div>
                          <div className="text-sm">{component.title}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {component.config.dataSource ? (
                              <Tag size="small">{component.config.dataSource}</Tag>
                            ) : (
                              '请选择数据源'
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* 空状态 */}
                {currentTemplate.components.length === 0 && (
                  <div className="text-center text-gray-500 py-20">
                    <FileTextOutlined className="text-6xl mb-4" />
                    <div className="text-lg mb-2">开始设计你的报表</div>
                    <div>从左侧组件库拖拽组件到此处</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileTextOutlined className="text-6xl mb-4" />
                <div className="text-lg mb-2">欢迎使用报表设计器</div>
                <div className="mb-4">点击"新建模板"开始创建自定义报表</div>
                <Button type="primary" onClick={initializeTemplate}>
                  新建模板
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 右侧属性面板 */}
        {!previewMode && selectedComponentData && (
          <div className="w-80 bg-white border-l p-4">
            <Title level={5}>组件属性</Title>
            
            <div className="space-y-4">
              {/* 基础属性 */}
              <Card size="small" title="基础设置">
                <div className="space-y-3">
                  <div>
                    <Text className="block mb-1">组件标题</Text>
                    <Input
                      value={selectedComponentData.title}
                      onChange={(e) => updateComponent(selectedComponent!, { title: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Text className="block mb-1">数据源</Text>
                    <Select
                      value={selectedComponentData.config.dataSource}
                      onChange={(value) => updateComponent(selectedComponent!, {
                        config: { ...selectedComponentData.config, dataSource: value }
                      })}
                      style={{ width: '100%' }}
                      placeholder="选择数据源"
                    >
                      <Option value="resolution_rate">Session解决率</Option>
                      <Option value="negative_feedback">负反馈率</Option>
                      <Option value="escalation_rate">人工转接率</Option>
                      <Option value="user_activity">用户活跃度</Option>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* 文本组件特有属性 */}
              {selectedComponentData.type === 'text' && (
                <Card size="small" title="文本设置">
                  <div className="space-y-3">
                    <div>
                      <Text className="block mb-1">内容</Text>
                      <Input.TextArea
                        value={selectedComponentData.config.content}
                        onChange={(e) => updateComponent(selectedComponent!, {
                          config: { ...selectedComponentData.config, content: e.target.value }
                        })}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Text className="block mb-1">字体大小</Text>
                      <Slider
                        min={12}
                        max={48}
                        value={selectedComponentData.config.fontSize}
                        onChange={(value) => updateComponent(selectedComponent!, {
                          config: { ...selectedComponentData.config, fontSize: value }
                        })}
                      />
                    </div>
                    
                    <div>
                      <Text className="block mb-1">对齐方式</Text>
                      <Radio.Group
                        value={selectedComponentData.config.align}
                        onChange={(e) => updateComponent(selectedComponent!, {
                          config: { ...selectedComponentData.config, align: e.target.value }
                        })}
                      >
                        <Radio value="left">左对齐</Radio>
                        <Radio value="center">居中</Radio>
                        <Radio value="right">右对齐</Radio>
                      </Radio.Group>
                    </div>
                  </div>
                </Card>
              )}

              {/* 图表组件特有属性 */}
              {selectedComponentData.type === 'chart' && (
                <Card size="small" title="图表设置">
                  <div className="space-y-3">
                    <div>
                      <Text className="block mb-1">显示图例</Text>
                      <Switch
                        checked={selectedComponentData.config.chartConfig?.legend}
                        onChange={(checked) => updateComponent(selectedComponent!, {
                          config: {
                            ...selectedComponentData.config,
                            chartConfig: {
                              ...selectedComponentData.config.chartConfig,
                              legend: checked,
                            },
                          }
                        })}
                      />
                    </div>
                    
                    <div>
                      <Text className="block mb-1">显示网格</Text>
                      <Switch
                        checked={selectedComponentData.config.chartConfig?.grid}
                        onChange={(checked) => updateComponent(selectedComponent!, {
                          config: {
                            ...selectedComponentData.config,
                            chartConfig: {
                              ...selectedComponentData.config.chartConfig,
                              grid: checked,
                            },
                          }
                        })}
                      />
                    </div>
                  </div>
                </Card>
              )}

              {/* 位置和大小 */}
              <Card size="small" title="位置和大小">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Text className="block mb-1">宽度</Text>
                    <Input
                      type="number"
                      value={selectedComponentData.position.width}
                      onChange={(e) => updateComponent(selectedComponent!, {
                        position: { ...selectedComponentData.position, width: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Text className="block mb-1">高度</Text>
                    <Input
                      type="number"
                      value={selectedComponentData.position.height}
                      onChange={(e) => updateComponent(selectedComponent!, {
                        position: { ...selectedComponentData.position, height: Number(e.target.value) }
                      })}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* 保存模板对话框 */}
      <Modal
        title="保存报表模板"
        open={saveModalVisible}
        onCancel={() => setSaveModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={saveTemplate} layout="vertical">
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
            initialValue={currentTemplate?.name}
          >
            <Input placeholder="输入模板名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="模板描述"
            initialValue={currentTemplate?.description}
          >
            <Input.TextArea rows={3} placeholder="输入模板描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReportDesigner;