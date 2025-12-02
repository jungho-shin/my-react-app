import React from 'react';
import { Routes, Route } from 'react-router-dom';

const Demo = () => {
  return (
    <Routes>
      <Route index element={<DemoIndex />} />
      <Route path="combo-nav-slim" element={<ComboNavSlim />} />
      <Route path="combo-nav" element={<ComboNav />} />
      <Route path="dark-mode" element={<DarkMode />} />
      <Route path="darknav" element={<DarkNav />} />
      <Route path="dual-nav" element={<DualNav />} />
      <Route path="horizontal-slim" element={<HorizontalSlim />} />
      <Route path="navbar-top-slim" element={<NavbarTopSlim />} />
      <Route path="navbar-top" element={<NavbarTop />} />
      <Route path="sidenav-collapse" element={<SidenavCollapse />} />
      <Route path="topnav-slim" element={<TopnavSlim />} />
      <Route path="vertical-sidenav" element={<VerticalSidenav />} />
    </Routes>
  );
};

const DemoIndex = () => {
  return <div>데모 메인</div>;
};

const ComboNavSlim = () => {
  return <div>Combo Nav Slim</div>;
};

const ComboNav = () => {
  return <div>Combo Nav</div>;
};

const DarkMode = () => {
  return <div>다크 모드</div>;
};

const DarkNav = () => {
  return <div>다크 네비게이션</div>;
};

const DualNav = () => {
  return <div>듀얼 네비게이션</div>;
};

const HorizontalSlim = () => {
  return <div>수평 슬림</div>;
};

const NavbarTopSlim = () => {
  return <div>상단 네비게이션 바 슬림</div>;
};

const NavbarTop = () => {
  return <div>상단 네비게이션 바</div>;
};

const SidenavCollapse = () => {
  return <div>사이드 네비게이션 접기</div>;
};

const TopnavSlim = () => {
  return <div>탑 네비게이션 슬림</div>;
};

const VerticalSidenav = () => {
  return <div>수직 사이드 네비게이션</div>;
};

export default Demo;

