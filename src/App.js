import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom';
import './App.css';
import HighchartsPage from './HighchartsPage';
import RechartsPage from './RechartsPage';
import DagsPage from './DagsPage';
import LogMonitorDashboard from './LogMonitorDashboard';
import LogViewerPage from './LogViewerPage';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

// 대시보드 페이지 컴포넌트
function RunsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedDag = searchParams.get('dag');

  return (
    <div className="app-wrapper">
      <Navigation />
      <div className="App">
        <header className="App-header">
          <div className="dashboard-header">
            <h1>📊 Runs{selectedDag ? ` - ${selectedDag}` : ''}</h1>
          </div>
          
          <LogMonitorDashboard selectedDag={selectedDag} />
        </header>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DagsPage />} />
        <Route path="/highcharts" element={<HighchartsPage />} />
        <Route path="/recharts" element={<RechartsPage />} />
        <Route path="/dags" element={<DagsPage />} />
        <Route path="/runs" element={<RunsPage />} />
        <Route path="/logs" element={<LogViewerPage />} />
      </Routes>
    </Router>
  );
}

export default App;
