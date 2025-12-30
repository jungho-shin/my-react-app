import React from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import './App.css';
import JobsPage from './JobsPage';
import DagsPage from './DagsPage';
import RunsPage from './RunsPage';
import LogsPage from './LogsPage';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

function Dags() {
  return (
    <div className="app-wrapper">
      <Navigation />
      <div className="App">
        <header className="App-header">
          <div className="dashboard-header">
            <h1>DAGs</h1>
          </div>
          <DagsPage />
        </header>
      </div>
      <Footer />
    </div>
  );
}

function Runs() {
  const [searchParams] = useSearchParams();
  const selectedDag = searchParams.get('dag');

  return (
    <div className="app-wrapper">
      <Navigation />
      <div className="App">
        <header className="App-header">
          <div className="dashboard-header">
            <h1>DAG{selectedDag ? `: ${selectedDag}` : ''}</h1>
          </div>
          <RunsPage selectedDag={selectedDag} />
        </header>
      </div>
      <Footer />
    </div>
  );
}

function Jobs() {
  const [searchParams] = useSearchParams();
  const selectedRun = searchParams.get('run');

  return (
    <div className="app-wrapper">
      <Navigation />
      <div className="App">
        <header className="App-header">
          <div className="dashboard-header">
          <h1>RUN{selectedRun ? `: ${selectedRun}` : ''}</h1>
          </div>
          <JobsPage selectedRun={selectedRun} />
        </header>
      </div>
      <Footer />
    </div>
  );
}

function Logs() {
  const [searchParams] = useSearchParams();
  const dagName = searchParams.get('dag') || '';
  const dagRunId = searchParams.get('dag_run_id') || '';
  const startDate = searchParams.get('start_date') || '';
  const endDate = searchParams.get('end_date') || '';

  return (
    <div className="app-wrapper log-viewer-page">
      <Navigation />
      <div className="App">
        <header className="App-header">
          <div className="dashboard-header">
            <h1>📋 실시간 로그뷰</h1>
          </div>
          <LogsPage dagName={dagName} dagRunId={dagRunId} startDate={startDate} endDate={endDate} />
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
        <Route path="/dags" element={<Dags />} />
        <Route path="/runs" element={<Runs />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/logs" element={<Logs />} />
      </Routes>
    </Router>
  );
}

export default App;
