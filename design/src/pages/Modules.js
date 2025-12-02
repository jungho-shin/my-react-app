import React from 'react';
import { Routes, Route } from 'react-router-dom';

const Modules = () => {
  return (
    <Routes>
      <Route index element={<ModulesIndex />} />
      <Route path="components/*" element={<Components />} />
      <Route path="forms/*" element={<Forms />} />
      <Route path="tables/*" element={<Tables />} />
      <Route path="utilities/*" element={<Utilities />} />
      <Route path="icons/*" element={<Icons />} />
      <Route path="echarts/*" element={<ECharts />} />
      <Route path="widgets" element={<Widgets />} />
    </Routes>
  );
};

const ModulesIndex = () => {
  return <div>모듈 메인</div>;
};

const Components = () => {
  return <div>컴포넌트</div>;
};

const Forms = () => {
  return <div>폼</div>;
};

const Tables = () => {
  return <div>테이블</div>;
};

const Utilities = () => {
  return <div>유틸리티</div>;
};

const Icons = () => {
  return <div>아이콘</div>;
};

const ECharts = () => {
  return <div>ECharts</div>;
};

const Widgets = () => {
  return <div>위젯</div>;
};

export default Modules;

