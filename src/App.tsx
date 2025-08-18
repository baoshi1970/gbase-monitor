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
import { Login, Dashboard, SimpleDashboard, NotFound, QualityOverview, ResolutionRate, NegativeFeedback, EscalationRate, QualityScore, Overview, UserBehaviorOverview, UserActivity, DomainAnalysis, BehaviorPath } from './pages';
import { ReportsOverview, ReportDesigner, ReportTemplates, ReportSchedule } from './pages/Reports';
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
            <Route path="dashboard" element={<SimpleDashboard />} />

            {/* 对话品质指标 */}
            <Route path="quality-metrics">
              <Route index element={<QualityOverview />} />
              <Route path="overview" element={<QualityOverview />} />
              <Route path="resolution-rate" element={<ResolutionRate />} />
              <Route path="feedback" element={<NegativeFeedback />} />
              <Route path="escalation" element={<EscalationRate />} />
              <Route path="quality-score" element={<QualityScore />} />
            </Route>

            {/* 概要总览 */}
            <Route path="overview" element={<Overview />} />

            {/* 用户行为分析 */}
            <Route path="user-analysis">
              <Route index element={<UserBehaviorOverview />} />
              <Route path="overview" element={<UserBehaviorOverview />} />
              <Route path="activity" element={<UserActivity />} />
              <Route path="domain" element={<DomainAnalysis />} />
              <Route path="behavior" element={<BehaviorPath />} />
            </Route>

            {/* 报表中心 */}
            <Route path="reports">
              <Route index element={<ReportsOverview />} />
              <Route path="overview" element={<ReportsOverview />} />
              <Route path="designer" element={<ReportDesigner />} />
              <Route path="templates" element={<ReportTemplates />} />
              <Route path="schedule" element={<ReportSchedule />} />
            </Route>

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
