import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import apiService from './services/api';
import RechartsStackedGroupedColumnChart from './RechartsStackedGroupedColumnChart';
import LogsPage from './LogsPage';

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

// 설정값 상수화 (이 값만 바꾸면 전체 적용됨)
const BAR_WIDTH = 10;   // Bar 너비
const BAR_GAP = 6;      // Bar 사이 간격
const SQUARE_SIZE = 10; // 사각형 너비/높이

// 구간 하나당 필요한 너비 (10 + 6 = 16px)
const STEP_SIZE = BAR_WIDTH + BAR_GAP;

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yAxisMax, setYAxisMax] = useState(11);
  // 쿠키에서 좌측 패널 width 읽기
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => {
    const savedWidth = getCookie('runsLeftPanelWidth');
    return savedWidth ? parseFloat(savedWidth) : 60;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('Details');
  const [jobsChartData, setJobsChartData] = useState(null);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState(null);
  const [selectedRunItem, setSelectedRunItem] = useState(null);
  const containerRef = useRef(null);
  const leftPanelRef = useRef(null);

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

  // Jobs 탭 데이터 가져오기
  useEffect(() => {
    const fetchJobsData = async () => {
      if (activeTab === 'Jobs') {
        try {
          setJobsLoading(true);
          setJobsError(null);
          const dagName = selectedRunItem?.dag || selectedItem;
          const runId = selectedRunItem?.dag_run_id || null;
          const data = await apiService.getJobs(dagName, runId);
          setJobsChartData(data);
        } catch (err) {
          console.error('Failed to fetch Jobs data:', err);
          setJobsError('Jobs 데이터를 불러오는데 실패했습니다.');
        } finally {
          setJobsLoading(false);
        }
      }
    };

    fetchJobsData();
  }, [activeTab, selectedRunItem, selectedItem]);

  // 스크롤을 오른쪽 끝으로 설정하는 함수 (초기 로드 시에만 사용)
  const scrollToRight = useCallback(() => {
    if (leftPanelRef.current) {
      const scrollLeft = leftPanelRef.current.scrollWidth - leftPanelRef.current.clientWidth;
      leftPanelRef.current.scrollLeft = scrollLeft;
    }
  }, []);

  // leftPanelRef 초기 스크롤을 오른쪽 끝으로 설정
  useEffect(() => {
    if (leftPanelRef.current && chartData.length > 0) {
      scrollToRight();
    }
  }, [chartData, scrollToRight]);

  const getBarColor = (entry, index) => {
    if (!entry || !entry.state) {
      return '#FFFFFF';
    }
    const state = entry.state;
    let color;
    switch (state) {
      case 'success': color = 'green'; break;
      case 'running': color = 'lime'; break;
      case 'failed': color = 'red'; break;
      case 'queued': color = 'gray'; break;
      default: color = '#FFFFFF';
    }
    return color;
  };

  const isBarSelected = (entry) => {
    return selectedRunItem && entry && selectedRunItem.dag_run_id === entry.dag_run_id;
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
      case 'success': return 'green';
      case 'running': return 'lime';
      case 'failed': return 'red';
      case 'queued': return 'gray';
      case 'empty': return '#FFFFFF';
      default: return '#FFFFFF';
    }
  };

  // 최대 duration 계산
  const maxDuration = chartData.length > 0 
    ? Math.max(...chartData.map(item => item.duration || 0), 1)
    : 15;

  // 평균 duration 계산
  const avgDuration = chartData.length > 0
    ? (chartData.reduce((sum, item) => sum + (item.duration || 0), 0) / chartData.length).toFixed(2)
    : 0;

  // 하단 사각형 렌더링 컴포넌트
  const RenderStatusSquare = (props) => {
    const { x, y, index } = props;
    const chartItem = chartData[index];
    const state = chartItem?.state || 'empty';
    const statusColor = getStatusColor(state);
    
    return (
      <g 
        transform={`translate(${x},${y})`}
        style={{ cursor: chartItem?.start_date ? 'pointer' : 'default' }}
        onClick={() => {
          if (chartItem && chartItem.start_date) {
            setSelectedRunItem({
              dag: selectedItem,
              dag_run_id: chartItem.dag_run_id,
              start_date: chartItem.start_date,
              end_date: chartItem.end_date,
              duration: chartItem.duration
            });
            setActiveTab('Logs');
          }
        }}
      >
        <rect 
          x={-SQUARE_SIZE / 2} // 중앙 정렬
          y={8} 
          width={SQUARE_SIZE} 
          height={SQUARE_SIZE} 
          rx={2} 
          fill={statusColor}
          stroke={state === 'empty' ? '#ccc' : 'none'}
          strokeWidth="1"
        />
      </g>
    );
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
          <div  ref={leftPanelRef} style={{ 
            width: '100%', 
            overflowX: 'auto', 
            borderBottom: '1px solid #eee',
            paddingBottom: '10px' 
          }}>
            {/* 내부 컨테이너: 계산된 너비 적용 */}
            <div style={{ width: `${chartData.length * STEP_SIZE + 60 + 30 + 60}px`, position: 'relative', marginLeft: 'auto' }}>
              <BarChart 
                width={chartData.length * STEP_SIZE + 60 + 30 + 60} 
                height={350} 
                data={chartData} 
                margin={{ top: 60, right: 30, left: 60, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                
                {/* 상단 날짜 축 */}
                <XAxis 
                  dataKey="start_date" 
                  orientation="top"
                  interval={0}
                  angle={-35} 
                  textAnchor="start" 
                  tick={(props) => {
                    const { x, y, payload, index } = props;
                    const totalLength = chartData.length;
                    const distanceFromRight = totalLength - 1 - index;
                    
                    // 우측에서 4번째 (distanceFromRight === 3)
                    // 또는 우측에서 14, 24, 34... 번째 (10개 간격)
                    if (distanceFromRight === 3 || (distanceFromRight > 3 && (distanceFromRight - 3) % 10 === 0)) {
                      return (
                        <text 
                          x={x} 
                          y={y} 
                          dy={-5} 
                          fontSize={11} 
                          fill="#999" 
                          textAnchor="start" 
                          transform={`rotate(-35, ${x}, ${y})`}
                        >
                          {payload.value}
                        </text>
                      );
                    }
                    
                    // 표시하지 않음
                    return null;
                  }}
                  axisLine={false} 
                  tickLine={false}
                />

                {/* 하단 사각형 축 */}
                <XAxis 
                  xAxisId="status"
                  dataKey="start_date"
                  orientation="bottom"
                  axisLine={false}
                  tickLine={false}
                  interval={0} 
                  tick={<RenderStatusSquare />} 
                />
                
                <YAxis 
                  tickFormatter={formatDuration}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#999' }}
                  domain={[0, maxDuration]}
                  width={60}
                />

                <Tooltip 
                  cursor={{ fill: '#f5f5f5' }}
                  formatter={(value) => [formatDuration(value), 'Duration']}
                />

                <Bar 
                  dataKey="duration" 
                  barSize={BAR_WIDTH}
                  onClick={(data, index) => {
                    if (data) {
                      setSelectedRunItem({
                        dag: selectedItem,
                        dag_run_id: data.dag_run_id,
                        start_date: data.start_date,
                        end_date: data.end_date,
                        duration: data.duration
                      });
                      setActiveTab('Jobs');
                    }
                  }}
                >
                  {chartData.map((entry, index) => {
                    const isSelected = isBarSelected(entry);
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getBarColor(entry, index)}
                        stroke={isSelected ? '#1976d2' : 'none'}
                        strokeWidth={isSelected ? 3 : 0}
                        style={{ cursor: 'pointer' }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
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

        {/* 우측 패널 - 탭 */}
        <div style={{ 
          width: `${100 - leftPanelWidth}%`, 
          paddingLeft: '10px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%'
        }}>
          {/* 탭 헤더 */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #dee2e6',
            backgroundColor: '#fff'
          }}>
            {['Details', 'Jobs', 'Logs'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === tab ? '600' : '400',
                  color: activeTab === tab ? '#1976d2' : '#666',
                  borderBottom: activeTab === tab ? '2px solid #1976d2' : '2px solid transparent',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.color = '#1976d2';
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.color = '#666';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 탭 콘텐츠 */}
          <div style={{
            flex: 1,
            overflow: 'hidden',
            padding: activeTab === 'Logs' ? '0' : '20px',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {activeTab === 'Details' && (
              <div>
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

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                      평균 Duration
                    </div>
                    <div style={{ fontSize: '16px', color: '#666' }}>
                      {avgDuration}초
                    </div>
                  </div>

                  {chartData.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                        최근 실행 정보
                      </div>
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
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'Jobs' && (
              <div>
                <h2 style={{ 
                  marginTop: '0',
                  marginBottom: '20px',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#333',
                  borderBottom: '2px solid #1976d2',
                  paddingBottom: '10px'
                }}>
                  Jobs
                </h2>
                {jobsLoading && (
                  <div style={{ 
                    padding: '20px',
                    textAlign: 'center',
                    color: '#999',
                    fontSize: '14px'
                  }}>
                    Jobs 데이터를 불러오는 중...
                  </div>
                )}
                {jobsError && (
                  <div style={{ 
                    padding: '20px',
                    textAlign: 'center',
                    color: '#d32f2f',
                    fontSize: '14px'
                  }}>
                    {jobsError}
                  </div>
                )}
                {!jobsLoading && !jobsError && (
                  <div style={{ width: '100%', height: '400px' }}>
                    <RechartsStackedGroupedColumnChart data={jobsChartData} />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Logs' && (
              <div className="log-viewer-page" style={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <LogsPage 
                  dagName={selectedRunItem?.dag || selectedItem}
                  dagRunId={selectedRunItem?.dag_run_id || ''}
                  startDate={selectedRunItem?.start_date || ''}
                  endDate={selectedRunItem?.end_date || ''}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunsPage;