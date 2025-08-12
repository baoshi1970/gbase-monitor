import React from 'react';
import { Layout, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed: _collapsed, onToggle }) => {
  const { t } = useTranslation('common');

  const userMenuItems = [
    {
      key: 'profile',
      label: t('header.profile'),
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: t('header.settings'),
      icon: <SettingOutlined />,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: t('header.logout'),
      icon: <LogoutOutlined />,
    },
  ];

  return (
    <AntHeader
      className="flex items-center justify-between px-6 border-b shadow-sm transition-all duration-300"
      style={{
        background: 'linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)',
        borderBottomColor: '#e2e8f0',
      }}
    >
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onToggle}
          className="hover:bg-slate-100 transition-colors duration-200 rounded-lg p-2"
          style={{
            color: '#475569',
            fontSize: '16px',
          }}
        />
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <Text className="text-white font-bold text-base">G</Text>
          </div>
          <Text className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            {t('appName')}
          </Text>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-2">
        {/* Language switcher */}
        <LanguageSwitcher />

        {/* Notifications */}
        <Button
          type="text"
          icon={<BellOutlined />}
          className="hover:bg-slate-100 transition-colors duration-200 rounded-lg"
          style={{
            color: '#475569',
            fontSize: '16px',
          }}
        />

        {/* User menu */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space className="cursor-pointer hover:bg-slate-100 rounded-lg px-3 py-2 transition-colors duration-200">
            <Avatar
              icon={<UserOutlined />}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              }}
            />
            <Text className="text-slate-700 font-medium">管理员</Text>
          </Space>
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header;
