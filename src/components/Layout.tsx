import React, { useState } from 'react';
import { Layout as AntLayout } from 'antd';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const { Content } = AntLayout;

const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <AntLayout
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
      }}
    >
      <Sidebar collapsed={collapsed} />
      <AntLayout>
        <Header collapsed={collapsed} onToggle={toggleSidebar} />
        <Content
          className="m-8 p-8 rounded-xl shadow-sm min-h-0 transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            marginLeft: collapsed ? '0.5rem' : '1rem',
            marginRight: '0.5rem',
            marginTop: '0.5rem',
            marginBottom: '1rem',
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
