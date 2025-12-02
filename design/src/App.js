import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Apps from './pages/Apps';
import Pages from './pages/Pages';
import Modules from './pages/Modules';
import Documentation from './pages/Documentation';
import Demo from './pages/Demo';
import Changelog from './pages/Changelog';
import Showcase from './pages/Showcase';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/apps/*" element={<Apps />} />
          <Route path="/pages/*" element={<Pages />} />
          <Route path="/modules/*" element={<Modules />} />
          <Route path="/documentation/*" element={<Documentation />} />
          <Route path="/demo/*" element={<Demo />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/showcase" element={<Showcase />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

