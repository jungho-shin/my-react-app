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

// 쿠키 유틸리티 함수
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const setCookie = (name, value, days = 365) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

const RunsPage = ({ selectedDag }) => {
  const navigate = useNavigate();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedItem, setSelectedItem] = useState(selectedDag || 'hello');
  // 쿠키에서 데이터 개수 읽기
  const [dataCount, setDataCount] = useState(() => {
    const savedCount = getCookie('logMonitorDataCount');
    return savedCount ? parseInt(savedCount, 10) : 5;
  });
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
  // 쿠키에서 좌측 패널 width 읽기
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => {
    const savedWidth = getCookie('runsLeftPanelWidth');
    return savedWidth ? parseFloat(savedWidth) : 60;
  });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

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

  // 구분선 드래그 핸들러
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // 최소/최대 width 제한 (20% ~ 80%)
      const clampedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
      setLeftPanelWidth(clampedWidth);
      setCookie('runsLeftPanelWidth', clampedWidth.toString());
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

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
        padding: '20px',
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
    <div style={{ 
      width: '100%', 
      height: '600px', 
      margin: '20px 0',
      padding: '20px',
    }}>
      {/* 헤더 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
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
              setCookie('logMonitorDataCount', newCount.toString());
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

      <div ref={containerRef} className="panels-container" style={{ display: 'flex', height: '100%', width: '100%', minHeight: 0 }}>
        {/* 좌측 패널 */}
        <div style={{ 
          width: `${leftPanelWidth}%`, 
          paddingRight: '10px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          minHeight: 0
        }}>
          {/* 메인 차트 */}
          <div ref={chartContainerRef} style={{ height: '300px', marginBottom: '20px', overflow: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: `${chartData.length * 16 + yAxisWidth}px`, height: '300px', flexShrink: 0 }}>
              <ResponsiveContainer width={chartData.length * 16 + yAxisWidth} height={300}>
                <BarChart 
                  data={chartData} 
                  margin={{ top: 20, right: 0, left: 0, bottom: 20 }}
                  barCategoryGap={3}
                  barGap={3}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis 
                    tick={(props) => {
                      const { x, y, index } = props;
                      // chartData의 각 항목에 대응하는 airflow 상태 가져오기
                      const airflowStatus = (statusData.airflow && index < statusData.airflow.length) 
                        ? statusData.airflow[index]?.status 
                        : 'empty';
                      const statusColor = getStatusColor(airflowStatus);
                      const chartItem = chartData[index];
                      
                      return (
                        <g 
                          transform={`translate(${x},${y})`}
                          style={{ cursor: chartItem?.displayDate ? 'pointer' : 'default' }}
                          onClick={() => {
                            if (chartItem && chartItem.displayDate) {
                              const params = new URLSearchParams({
                                date: chartItem.displayDate,
                                duration: chartItem.duration?.toString() || '0',
                                dag: selectedItem
                              });
                              navigate(`/logs?${params.toString()}`);
                            }
                          }}
                        >
                          <rect
                            x="-5"
                            y="5"
                            width="10"
                            height="10"
                            fill={statusColor}
                            stroke={airflowStatus === 'empty' ? '#ccc' : 'none'}
                            strokeWidth="1"
                            rx="1"
                          />
                        </g>
                      );
                    }}
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
                    formatter={(value, name, props) => [
                      `${props.payload.displayDate}\n${formatDuration(value)}`, 
                      'Duration'
                    ]}
                    labelFormatter={() => ''}
                  />
                  <Bar 
                    dataKey="duration" 
                    radius={[0, 0, 0, 0]}
                    minPointSize={14}
                    onClick={(data, index) => {
                      if (data) {
                        const params = new URLSearchParams({
                          duration: data.duration.toString(),
                          dag: selectedItem,
                          run: data.dag_run_id
                        });
                        navigate(`/jobs?${params.toString()}`);
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
          </div>
        </div>

        {/* 구분선 */}
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          style={{
            width: '6px',
            backgroundColor: '#e0e0e0',
            cursor: 'col-resize',
            position: 'relative',
            flexShrink: 0,
            userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            if (!isDragging) {
              e.currentTarget.style.backgroundColor = '#1976d2';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDragging) {
              e.currentTarget.style.backgroundColor = '#e0e0e0';
            }
          }}
        />

        {/* 우측 패널 - DAG 정보 */}
        <div style={{ 
          width: `${100 - leftPanelWidth}%`, 
          paddingLeft: '10px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto'
        }}>
          <div style={{
            padding: '20px',
            borderRadius: '8px',
            height: '100%'
          }}>
            <h2 style={{ 
              marginTop: '0',
              marginBottom: '20px',
              fontSize: '18px',
              fontWeight: '600',
              color: '#333',
              borderBottom: '2px solid #1976d2',
              paddingBottom: '10px'
            }}>
              DAG 정보
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                padding: '12px',
                backgroundColor: '#e3f2fd',
                borderRadius: '6px',
                marginBottom: '15px'
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>선택된 DAG</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#1976d2' }}>
                  {selectedItem}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                  총 실행 횟수
                </div>
                <div style={{ fontSize: '16px', color: '#666' }}>
                  {chartData.length}건
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                  최대 Duration
                </div>
                <div style={{ fontSize: '16px', color: '#666' }}>
                  {yAxisMax > 0 ? `${yAxisMax.toFixed(2)}초` : 'N/A'}
                </div>
              </div>

              {chartData.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                    평균 Duration
                  </div>
                  <div style={{ fontSize: '16px', color: '#666' }}>
                    {(chartData.reduce((sum, item) => sum + (item.duration || 0), 0) / chartData.length).toFixed(2)}초
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                  최근 실행 정보
                </div>
                {chartData.length > 0 ? (
                  <div style={{ 
                    padding: '10px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    <div>날짜: {chartData[chartData.length - 1].displayDate || 'N/A'}</div>
                    <div>Duration: {chartData[chartData.length - 1].duration?.toFixed(2) || 'N/A'}초</div>
                  </div>
                ) : (
                  <div style={{ fontSize: '14px', color: '#999' }}>데이터가 없습니다</div>
                )}
              </div>

              {statusData[selectedItem] && statusData[selectedItem].length > 0 && (
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                    상태 통계
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {(() => {
                      const statusCounts = statusData[selectedItem].reduce((acc, item) => {
                        acc[item.status] = (acc[item.status] || 0) + 1;
                        return acc;
                      }, {});
                      return Object.entries(statusCounts).map(([status, count]) => (
                        <div key={status} style={{ marginBottom: '5px' }}>
                          {status === 'success' && '✅ '}
                          {status === 'failed' && '❌ '}
                          {status === 'running' && '🔄 '}
                          {status === 'empty' && '⚪ '}
                          {status}: {count}건
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunsPage;
