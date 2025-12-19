import React from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import './App.css';
import JobsPage from './JobsPage';
import DagsPage from './DagsPage';
import RunsPage from './RunsPage';
import LogsPage from './LogsPage';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

// 대시보드 페이지 컴포넌트
function Runs() {
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
          
          <RunsPage selectedDag={selectedDag} />
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
        <Route path="/dags" element={<DagsPage />} />
        <Route path="/runs" element={<Runs />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/logs" element={<LogsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
