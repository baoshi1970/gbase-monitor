import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import jaJP from 'antd/locale/ja_JP';
import { useTranslation } from 'react-i18next';
import { Layout } from './components';
import { Login, Dashboard, NotFound, ResolutionRate, NegativeFeedback, EscalationRate, QualityScore } from './pages';
import './locales';

const App: React.FC = () => {
  const { i18n } = useTranslation();

  const getAntdLocale = () => {
    switch (i18n.language) {
      case 'en':
        return enUS;
      case 'ja':
        return jaJP;
      default:
        return zhCN;
    }
  };

  return (
    <ConfigProvider locale={getAntdLocale()}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* 对话品质指标 */}
            <Route path="quality-metrics">
              <Route path="resolution-rate" element={<ResolutionRate />} />
              <Route path="feedback" element={<NegativeFeedback />} />
              <Route path="escalation" element={<EscalationRate />} />
              <Route path="quality-score" element={<QualityScore />} />
              <Route index element={<Navigate to="resolution-rate" replace />} />
            </Route>

            {/* 概要总览 */}
            <Route
              path="overview/*"
              element={<div>概要总览页面开发中...</div>}
            />

            {/* 用户行为分析 */}
            <Route
              path="user-analysis/*"
              element={<div>用户行为分析页面开发中...</div>}
            />

            {/* 报表中心 */}
            <Route
              path="reports/*"
              element={<div>报表中心页面开发中...</div>}
            />

            {/* 系统设置 */}
            <Route
              path="settings/*"
              element={<div>系统设置页面开发中...</div>}
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
