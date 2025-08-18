import React, { useState, useRef } from 'react';
import {
  Card,
  Button,
  Dropdown,
  Modal,
  Switch,
  Input,
  Space,
  Tooltip,
} from 'antd';
import {
  MoreOutlined,
  DragOutlined,
  SettingOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  DeleteOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

interface DashboardCardProps {
  id: string;
  title: string;
  children: React.ReactNode;
  draggable?: boolean;
  configurable?: boolean;
  removable?: boolean;
  expandable?: boolean;
  visible?: boolean;
  loading?: boolean;
  error?: string | null;
  className?: string;
  style?: React.CSSProperties;
  onDrag?: (id: string) => void;
  onDrop?: (id: string, targetId: string) => void;
  onConfigure?: (id: string) => void;
  onToggleVisibility?: (id: string, visible: boolean) => void;
  onRemove?: (id: string) => void;
  onExpand?: (id: string, expanded: boolean) => void;
  onTitleChange?: (id: string, title: string) => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  id,
  title,
  children,
  draggable = true,
  configurable = true,
  removable = true,
  expandable = true,
  visible = true,
  loading = false,
  error = null,
  className = '',
  style = {},
  onDrag,
  onDrop,
  onConfigure,
  onToggleVisibility,
  onRemove,
  onExpand,
  onTitleChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    if (!draggable) return;
    
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    onDrag?.(id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId !== id) {
      onDrop?.(draggedId, id);
    }
  };

  const handleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpand?.(id, newExpanded);
  };

  const handleTitleSave = () => {
    onTitleChange?.(id, tempTitle);
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(title);
    setEditingTitle(false);
  };

  const menuItems: MenuProps['items'] = [
    ...(configurable ? [{
      key: 'configure',
      icon: <SettingOutlined />,
      label: '配置',
      onClick: () => onConfigure?.(id),
    }] : []),
    {
      key: 'visibility',
      icon: visible ? <EyeInvisibleOutlined /> : <EyeOutlined />,
      label: visible ? '隐藏' : '显示',
      onClick: () => onToggleVisibility?.(id, !visible),
    },
    ...(expandable ? [{
      key: 'expand',
      icon: isExpanded ? <FullscreenExitOutlined /> : <FullscreenOutlined />,
      label: isExpanded ? '退出全屏' : '全屏显示',
      onClick: handleExpand,
    }] : []),
    {
      key: 'edit-title',
      icon: <SettingOutlined />,
      label: '编辑标题',
      onClick: () => setEditingTitle(true),
    },
    ...(removable ? [{
      key: 'divider',
      type: 'divider' as const,
    }, {
      key: 'remove',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: '确认删除',
          content: `确定要删除「${title}」卡片吗？`,
          onOk: () => onRemove?.(id),
        });
      },
    }] : []),
  ];

  if (!visible) {
    return null;
  }

  const cardTitle = (
    <div className="flex items-center justify-between">
      {editingTitle ? (
        <div className="flex items-center space-x-2 flex-1">
          <Input
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onPressEnter={handleTitleSave}
            onBlur={handleTitleSave}
            size="small"
            className="flex-1 max-w-48"
            autoFocus
          />
          <Space>
            <Button size="small" type="primary" onClick={handleTitleSave}>
              保存
            </Button>
            <Button size="small" onClick={handleTitleCancel}>
              取消
            </Button>
          </Space>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          {draggable && (
            <Tooltip title="拖拽移动">
              <DragOutlined 
                className="cursor-move text-gray-400 hover:text-gray-600"
                ref={dragRef}
              />
            </Tooltip>
          )}
          <span className="font-medium">{title}</span>
        </div>
      )}
      
      <Dropdown
        menu={{ items: menuItems }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button
          type="text"
          size="small"
          icon={<MoreOutlined />}
          className="text-gray-400 hover:text-gray-600"
        />
      </Dropdown>
    </div>
  );

  return (
    <>
      <div
        draggable={draggable && !editingTitle}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`transition-all duration-200 ${
          isDragging ? 'opacity-50 scale-95' : ''
        } ${className}`}
        style={style}
      >
        <Card
          title={cardTitle}
          loading={loading}
          className={`dashboard-card ${isDragging ? 'dragging' : ''}`}
          styles={{
            header: {
              borderBottom: error ? '1px solid #ff4d4f' : undefined,
              backgroundColor: error ? '#fff2f0' : undefined,
            },
          }}
        >
          {error ? (
            <div className="text-center text-red-500 py-8">
              <div className="text-base mb-2">数据加载失败</div>
              <div className="text-sm text-gray-500">{error}</div>
            </div>
          ) : (
            children
          )}
        </Card>
      </div>

      {/* 全屏模态框 */}
      <Modal
        title={title}
        open={isExpanded}
        onCancel={() => handleExpand()}
        footer={null}
        width="90vw"
        style={{ top: 20 }}
        bodyStyle={{ height: '80vh', padding: '24px' }}
      >
        {children}
      </Modal>
    </>
  );
};

export default DashboardCard;