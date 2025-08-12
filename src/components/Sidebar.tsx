import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  LineChartOutlined,
  BarChartOutlined,
  SettingOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/sidebar.css';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const { t } = useTranslation(['common', 'quality']);
  const location = useLocation();
  const navigate = useNavigate();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('menu.dashboard'),
    },
    {
      key: '/quality-metrics',
      icon: <LineChartOutlined />,
      label: t('menu.qualityMetrics'),
      children: [
        {
          key: '/quality-metrics/resolution-rate',
          label: t('metrics.resolutionRate', { ns: 'quality' }),
        },
        {
          key: '/quality-metrics/feedback',
          label: t('metrics.negativeFeedbackRate', { ns: 'quality' }),
        },
        {
          key: '/quality-metrics/escalation',
          label: t('metrics.escalationRate', { ns: 'quality' }),
        },
        {
          key: '/quality-metrics/quality-score',
          label: t('metrics.qualityScore', { ns: 'quality' }),
        },
      ],
    },
    {
      key: '/overview',
      icon: <BarChartOutlined />,
      label: t('menu.overview'),
      children: [
        {
          key: '/overview/summary',
          label: '关键指标',
        },
        {
          key: '/overview/realtime',
          label: '实时监控',
        },
        {
          key: '/overview/health',
          label: '系统健康',
        },
      ],
    },
    {
      key: '/user-analysis',
      icon: <TeamOutlined />,
      label: t('menu.userAnalysis'),
      children: [
        {
          key: '/user-analysis/domain',
          label: '邮件域名分析',
        },
        {
          key: '/user-analysis/key-customers',
          label: '关键客户',
        },
        {
          key: '/user-analysis/behavior',
          label: '行为模式',
        },
      ],
    },
    {
      key: '/reports',
      icon: <FileTextOutlined />,
      label: t('menu.reports'),
      children: [
        {
          key: '/reports/daily',
          label: '日次报告',
        },
        {
          key: '/reports/weekly',
          label: '周次报告',
        },
        {
          key: '/reports/ai-effectiveness',
          label: 'AI效果报告',
        },
        {
          key: '/reports/market',
          label: '市场分析报告',
        },
      ],
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t('menu.settings'),
      children: [
        {
          key: '/settings/basic',
          label: '基础设置',
        },
        {
          key: '/settings/alerts',
          label: '告警设置',
        },
        {
          key: '/settings/templates',
          label: '报告模板',
        },
      ],
    },
  ];

  // 初始化openKeys
  useEffect(() => {
    const path = location.pathname;
    const initialOpenKeys: string[] = [];

    // Find parent menu keys for current path
    menuItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) => child.key === path || path.startsWith(child.key + '/')
        );
        if (hasActiveChild) {
          initialOpenKeys.push(item.key);
        }
      }
    });

    setOpenKeys(initialOpenKeys);
  }, [location.pathname]);

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  const getSelectedKeys = () => {
    const path = location.pathname;

    // 处理根路径重定向到dashboard的情况
    if (path === '/') {
      return ['/dashboard'];
    }

    // 检查当前路径是否匹配某个菜单项
    const matchedItem = findMatchedMenuItem(path);
    return matchedItem ? [matchedItem] : [path];
  };

  const findMatchedMenuItem = (path: string): string | null => {
    // 首先检查一级菜单
    for (const item of menuItems) {
      if (item.key === path) {
        return item.key;
      }

      // 检查子菜单
      if (item.children) {
        for (const child of item.children) {
          if (child.key === path || path.startsWith(child.key + '/')) {
            return child.key;
          }
        }
      }
    }
    return null;
  };


  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={280}
      collapsedWidth={64}
      className="min-h-screen transition-all duration-300 ease-in-out"
      style={{
        background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
        boxShadow: '2px 0 8px 0 rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Logo section */}
      <div className="flex items-center justify-center h-16 border-b border-slate-600/50">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-white font-semibold text-lg">GBase</span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
        )}
      </div>

      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        openKeys={!collapsed ? openKeys : []}
        onOpenChange={handleOpenChange}
        items={menuItems}
        onClick={({ key }) => handleMenuClick(key)}
        className="border-none h-full bg-transparent mt-4"
        style={{
          borderRight: 0,
          background: 'transparent',
        }}
        theme="dark"
        inlineCollapsed={collapsed}
      />
    </Sider>
  );
};

export default Sidebar;
