import React from 'react';
import { Routes, Route } from 'react-router-dom';

const Apps = () => {
  return (
    <Routes>
      <Route index element={<AppsIndex />} />
      <Route path="calendar" element={<Calendar />} />
      <Route path="chat" element={<Chat />} />
      <Route path="datacollector/*" element={<DataCollector />} />
      <Route path="crm/*" element={<CRM />} />
      <Route path="e-commerce/*" element={<ECommerce />} />
      <Route path="email/*" element={<Email />} />
      <Route path="events/*" element={<Events />} />
      <Route path="kanban/*" element={<Kanban />} />
      <Route path="project-management/*" element={<ProjectManagement />} />
      <Route path="social/*" element={<Social />} />
    </Routes>
  );
};

const AppsIndex = () => {
  return <div>앱 메인 페이지</div>;
};

const Calendar = () => {
  return <div>캘린더</div>;
};

const Chat = () => {
  return <div>채팅</div>;
};

const DataCollector = () => {
  return <div>데이터 수집기</div>;
};

const CRM = () => {
  return <div>CRM</div>;
};

const ECommerce = () => {
  return <div>전자상거래</div>;
};

const Email = () => {
  return <div>이메일</div>;
};

const Events = () => {
  return <div>이벤트</div>;
};

const Kanban = () => {
  return <div>칸반</div>;
};

const ProjectManagement = () => {
  return <div>프로젝트 관리</div>;
};

const Social = () => {
  return <div>소셜</div>;
};

export default Apps;

