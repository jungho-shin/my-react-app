import React from 'react';
import { Routes, Route } from 'react-router-dom';

const Dashboard = () => {
  return (
    <Routes>
      <Route index element={<DashboardIndex />} />
      <Route path="crm" element={<CRMDashboard />} />
      <Route path="project-management" element={<ProjectManagementDashboard />} />
    </Routes>
  );
};

const DashboardIndex = () => {
  return <div>대시보드 메인 페이지</div>;
};

const CRMDashboard = () => {
  return <div>CRM 대시보드</div>;
};

const ProjectManagementDashboard = () => {
  return <div>프로젝트 관리 대시보드</div>;
};

export default Dashboard;

