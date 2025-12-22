import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RechartsStackedGroupedColumnChart from './RechartsStackedGroupedColumnChart';
import apiService from './services/api';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

function JobsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const date = searchParams.get('date');
  const duration = searchParams.get('duration');
  const dag = searchParams.get('dag');

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getJobs();
        setChartData(data);
      } catch (err) {
        console.error('Failed to fetch Recharts data:', err);
        setError('차트 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        width: '100%', 
        height: '600px', 
        margin: '20px 0',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="loading">차트 데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        width: '100%', 
        height: '600px', 
        margin: '20px 0',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="error">{error}</div>
      </div>
    );
  }
  
  return (
    <div>
      {date && duration && (
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          borderLeft: '4px solid #2196f3'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
            선택된 로그 정보
          </div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
            DAG: {dag || 'N/A'} | 날짜: {date} | Duration: {duration}초
          </div>
        </div>
      )}
      
      <div className="chart-section">
        <h2>📈 Recharts Stacked and Grouped Column Chart</h2>
        <RechartsStackedGroupedColumnChart data={chartData} />
      </div>
    </div>
  );
}

export default JobsPage;