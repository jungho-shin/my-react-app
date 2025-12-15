import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import apiService from './services/api';

const LogMonitorDashboard = ({ selectedDag }) => {
  const navigate = useNavigate();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedItem, setSelectedItem] = useState(selectedDag || 'hello');
  const [dataCount, setDataCount] = useState(5); // 기본값 5
  const [chartData, setChartData] = useState([]);
  const [statusData, setStatusData] = useState({
    hello: [],
    airflow: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yAxisMax, setYAxisMax] = useState(11);
  const [yAxisWidth, setYAxisWidth] = useState(60); // YAxis 기본 width
  const chartContainerRef = useRef(null);

  // API에서 데이터 가져오기
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📊 DAG: ${selectedItem}, 데이터 개수 ${dataCount}개로 로딩 시작`);
      const data = await apiService.getRuns(selectedItem, dataCount);
      
      const dagRuns = data.dag_runs || [];
      
      // 최대 duration 값을 찾아서 YAxis domain의 max로 설정
      const maxDuration = dagRuns.length > 0 
        ? Math.max(...dagRuns.map(item => item.duration || 0), 1)
        : 11;
      
      // domain max의 1/10을 최소 duration으로 설정 (Bar의 최소 높이 보장)
      const minDuration = maxDuration / 10;
      
      // duration이 최소값보다 작으면 최소값으로 설정
      const processedChartData = dagRuns.map(item => ({
        ...item,
        duration: item.duration === 0 || item.duration < minDuration ? minDuration : item.duration
      }));
      
      setChartData(processedChartData);
      setStatusData(data.groups || {});
      setYAxisMax(maxDuration);
      console.log(`✅ DAG: ${selectedItem}, 데이터 개수 ${dataCount}개 로딩 완료`);
    } catch (err) {
      console.error('Failed to fetch log monitor data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedItem, dataCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData가 변경될 때마다 데이터 다시 가져오기

  // YAxis의 실제 width 측정
  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    const measureYAxisWidth = () => {
      const yAxisElement = chartContainerRef.current?.querySelector('.recharts-cartesian-axis.recharts-yAxis');
      if (yAxisElement) {
        const width = yAxisElement.getBoundingClientRect().width;
        if (width > 0) {
          setYAxisWidth(width);
        }
      }
    };

    // Recharts 렌더링 후 측정
    const timer = setTimeout(measureYAxisWidth, 100);
    const observer = new MutationObserver(() => {
      measureYAxisWidth();
    });

    if (chartContainerRef.current) {
      observer.observe(chartContainerRef.current, {
        childList: true,
        subtree: true
      });
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [chartData]);

  // selectedDag prop이 변경될 때 selectedItem 업데이트
  useEffect(() => {
    if (selectedDag) {
      setSelectedItem(selectedDag);
    }
  }, [selectedDag]);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchData();
      }, 5000); // 5초마다 업데이트
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchData]); // fetchData도 의존성에 추가

  const getBarColor = (entry, index) => {
    if (selectedItem === 'hello') {
      return statusData.hello[index]?.status === 'highlight' ? '#87CEEB' : '#228B22';
    } else {
      return statusData.airflow[index]?.status === 'success' ? '#228B22' : 
             statusData.airflow[index]?.status === 'pending' ? '#808080' : '#FFFFFF';
    }
  };

  const formatDuration = (value) => {
    // value가 초 단위라고 가정
    const totalSeconds = Math.floor(value);
    const days = Math.floor(totalSeconds / 86400); // 86400초 = 1일
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (days > 0) {
      // 하루가 넘어가는 경우: 56d01:01:11 형식
      return `${days}d${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      // 기본 형식: 00:01:31 (시:분:초)
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#228B22';
      case 'highlight': return '#87CEEB';
      case 'pending': return '#808080';
      case 'empty': return '#FFFFFF';
      default: return '#228B22';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        width: '100%', 
        height: '600px', 
        margin: '20px 0',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="loading">데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        width: '100%', 
        height: '600px', 
        margin: '20px 0',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%', 
      height: '600px', 
      margin: '20px 0',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      {/* 헤더 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '1px solid #dee2e6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Auto-refresh</span>
          <label style={{ 
            position: 'relative', 
            display: 'inline-block', 
            width: '50px', 
            height: '24px' 
          }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: autoRefresh ? '#007bff' : '#ccc',
              borderRadius: '24px',
              transition: '0.4s'
            }}>
              <span style={{
                position: 'absolute',
                content: '""',
                height: '18px',
                width: '18px',
                left: autoRefresh ? '26px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transition: '0.4s'
              }} />
            </span>
          </label>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>데이터 개수:</span>
          <select
            value={dataCount}
            onChange={(e) => {
              const newCount = parseInt(e.target.value);
              console.log(`🔄 데이터 개수 변경: ${dataCount} → ${newCount}`);
              setDataCount(newCount);
            }}
            style={{
              padding: '6px 12px',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value={5}>5</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={365}>365</option>
          </select>
        </div>
      </div>

      {/* 메인 차트 */}
      <div ref={chartContainerRef} style={{ height: '300px', marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <ResponsiveContainer width={chartData.length * 20 + yAxisWidth} height="100%">
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
            barCategoryGap="5%"
            barGap="2%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis 
              dataKey="displayDate" 
              tick={false}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              domain={[0, yAxisMax]}
              tick={{ fontSize: 10, fill: '#666' }}
              tickLine={{ stroke: '#666' }}
              tickFormatter={formatDuration}
              label={{ 
                value: 'Duration', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: '12px' }
              }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '5px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                fontSize: '12px'
              }}
              c={(value, name, props) => [
                `${props.payload.displayDate}\n${formatDuration(value)}`, 
                'Duration'
              ]}
              labelFormatter={() => ''}
            />
            <Bar 
              dataKey="duration" 
              radius={[2, 2, 0, 0]}
              onClick={(data, index) => {
                if (data && data.displayDate) {
                  const params = new URLSearchParams({
                    date: data.displayDate,
                    duration: data.duration.toString(),
                    dag: selectedItem
                  });
                  navigate(`/recharts?${params.toString()}`);
                }
              }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry, index)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 하단 리스트 및 상태 인디케이터 */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {['hello', 'airflow'].map((item) => (
          <div key={item} style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '15px'
          }}>
            {/* 아이템 라벨 */}
            <div
              onClick={() => setSelectedItem(item)}
              style={{
                padding: '8px 12px',
                backgroundColor: selectedItem === item ? '#e3f2fd' : 'transparent',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: selectedItem === item ? '500' : '400',
                color: selectedItem === item ? '#1976d2' : '#333',
                transition: 'all 0.2s',
                minWidth: '80px',
                textAlign: 'left'
              }}
            >
              {item}
            </div>

            {/* 상태 인디케이터 - BarChart와 정확히 동일한 영역 사용 */}
            <div style={{ 
              position: 'relative',
              width: 'calc(100% - 95px)',
              height: '8px',
              opacity: selectedItem === item ? 1 : 0.6
            }}>
              {/* BarChart와 동일한 마진과 간격 적용 */}
              <div style={{
                position: 'absolute',
                left: '20px',
                right: '30px',
                top: '0',
                height: '8px',
                display: 'flex',
                gap: '1px',
                alignItems: 'center'
              }}>
                {statusData[item]?.map((statusItem, index) => (
                  <div
                    key={index}
                    style={{
                      width: 'calc((100% - 29px) / 30)',
                      height: '8px',
                      backgroundColor: getStatusColor(statusItem.status),
                      border: statusItem.status === 'empty' ? '1px solid #ccc' : 'none',
                      borderRadius: '1px',
                      flexShrink: 0
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 설명 */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#fff', 
        borderRadius: '8px',
        fontSize: '12px',
        color: '#666',
        border: '1px solid #dee2e6'
      }}>
        <strong>대시보드 설명:</strong>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>Auto-refresh 토글로 자동 새로고침을 제어할 수 있습니다</li>
          <li>하단 리스트에서 항목을 클릭하여 선택할 수 있습니다</li>
          <li>상태 인디케이터는 각 시간대별 실행 상태를 표시합니다</li>
          <li>차트의 바를 클릭하면 상세 정보를 확인할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
};

export default LogMonitorDashboard;
