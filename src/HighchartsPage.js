import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StackedGroupedColumnChart from './StackedGroupedColumnChart';
import apiService from './services/api';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

function HighchartsPage() {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getHighchartsData();
        setChartData(data);
      } catch (err) {
        console.error('Failed to fetch Highcharts data:', err);
        setError('차트 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  return (
    <div className="app-wrapper">
      <Navigation />
      <div className="App">
        <header className="App-header">
          <div className="dashboard-header">
            <h1>📊 Highcharts 차트</h1>
          </div>
          
          <div className="chart-section">
            <h2>📊 Highcharts Stacked and Grouped Column Chart</h2>
            {loading ? (
              <div className="loading">차트 데이터를 불러오는 중...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : (
              <StackedGroupedColumnChart data={chartData} />
            )}
          </div>
        </header>
      </div>
      <Footer />
    </div>
  );
}

export default HighchartsPage;
