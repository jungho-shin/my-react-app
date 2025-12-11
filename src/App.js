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

// 메인 홈페이지 컴포넌트
function HomePage() {

  return (
    <div className="app-wrapper">
      <Navigation />
      <div className="App">
        <header className="App-header">
          <h1>🚀 React K8s App</h1>
          <p>Kubernetes에서 실행되는 React 애플리케이션</p>

          <div className="navigation-section">
            <h2>🔗 추가 기능</h2>
            <div className="nav-buttons">
              <Link to="/highcharts" className="nav-button">
                📊 Highcharts 차트
              </Link>
              <Link to="/recharts" className="nav-button">
                📈 Jobs
              </Link>
              <Link to="/dags" className="nav-button">
                📋 Dags
              </Link>
              <Link to="/runs" className="nav-button">
                📊 Runs
              </Link>
              <Link to="/logs" className="nav-button">
                📋 실시간 로그
              </Link>
            </div>
          </div>
        </header>
      </div>
      <Footer />
    </div>
  );
}

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
        <Route path="/" element={<HomePage />} />
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
