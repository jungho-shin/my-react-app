import React from 'react';
import { Routes, Route } from 'react-router-dom';

const Pages = () => {
  return (
    <Routes>
      <Route index element={<PagesIndex />} />
      <Route path="authentication/*" element={<Authentication />} />
      <Route path="errors/*" element={<Errors />} />
      <Route path="faq/*" element={<FAQ />} />
      <Route path="landing/*" element={<Landing />} />
      <Route path="members" element={<Members />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="pricing/*" element={<Pricing />} />
      <Route path="starter" element={<Starter />} />
      <Route path="timeline" element={<Timeline />} />
    </Routes>
  );
};

const PagesIndex = () => {
  return <div>페이지 메인</div>;
};

const Authentication = () => {
  return <div>인증 페이지</div>;
};

const Errors = () => {
  return <div>에러 페이지</div>;
};

const FAQ = () => {
  return <div>FAQ</div>;
};

const Landing = () => {
  return <div>랜딩 페이지</div>;
};

const Members = () => {
  return <div>멤버</div>;
};

const Notifications = () => {
  return <div>알림</div>;
};

const Pricing = () => {
  return <div>가격</div>;
};

const Starter = () => {
  return <div>스타터 페이지</div>;
};

const Timeline = () => {
  return <div>타임라인</div>;
};

export default Pages;

