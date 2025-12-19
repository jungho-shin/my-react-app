import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="nav-logo">
            🚀 React K8s App
          </Link>
        </div>
        
        <div className="nav-menu">
          {!isHomePage && (
            <button 
              onClick={() => navigate('/')} 
              className="nav-back-button"
            >
              ← 홈으로
            </button>
          )}
          
          <Link 
            to="/highcharts" 
            className={`nav-link ${location.pathname === '/highcharts' ? 'active' : ''}`}
          >
            📊 Highcharts
          </Link>
          <Link 
            to="/dags" 
            className={`nav-link ${location.pathname === '/dags' || location.pathname === '/' ? 'active' : ''}`}
          >
            📋 Dags
          </Link>
          <Link 
            to="/runs" 
            className={`nav-link ${location.pathname === '/runs' ? 'active' : ''}`}
          >
            📊 Runs
          </Link>
          <Link 
            to="/jobs" 
            className={`nav-link ${location.pathname === '/jobs' ? 'active' : ''}`}
          >
            📈 Jobs
          </Link>
          <Link 
            to="/logs" 
            className={`nav-link ${location.pathname === '/logs' ? 'active' : ''}`}
          >
            📋 Logs
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

