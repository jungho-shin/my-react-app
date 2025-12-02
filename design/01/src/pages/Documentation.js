import React from 'react';
import { Routes, Route } from 'react-router-dom';

const Documentation = () => {
  return (
    <Routes>
      <Route index element={<DocumentationIndex />} />
      <Route path="getting-started" element={<GettingStarted />} />
      <Route path="design-file" element={<DesignFile />} />
      <Route path="gulp" element={<Gulp />} />
      <Route path="customization/*" element={<Customization />} />
      <Route path="layouts/*" element={<Layouts />} />
    </Routes>
  );
};

const DocumentationIndex = () => {
  return <div>문서 메인</div>;
};

const GettingStarted = () => {
  return <div>시작하기</div>;
};

const DesignFile = () => {
  return <div>디자인 파일</div>;
};

const Gulp = () => {
  return <div>Gulp</div>;
};

const Customization = () => {
  return <div>커스터마이징</div>;
};

const Layouts = () => {
  return <div>레이아웃</div>;
};

export default Documentation;

