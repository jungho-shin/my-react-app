import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>React K8s App</h3>
            <p>Kubernetes에서 실행되는 React 애플리케이션</p>
          </div>
          
          <div className="footer-section">
            <h4>기능</h4>
            <ul>
              <li>Highcharts 차트</li>
              <li>Recharts Jobs</li>
              <li>Dags 관리</li>
              <li>Runs 모니터링</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>정보</h4>
            <ul>
              <li>버전: 1.0.0</li>
              <li>프레임워크: React</li>
              <li>배포: Kubernetes</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} React K8s App. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

