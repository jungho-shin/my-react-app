import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import apiService from './services/api';
import './LogsPage.css';

// 쿠키 관리 유틸리티 함수
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const setCookie = (name, value, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

function LogsPage({ dagName = '', dagRunId = '', startDate = '', endDate = '', state = '' }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(2); // 초 단위
  const [serverConnected, setServerConnected] = useState(true);
  const [hideTimestamp, setHideTimestamp] = useState(() => {
    const saved = getCookie('logsHideTimestamp');
    return saved === 'true';
  });
  const [autoScroll, setAutoScroll] = useState(() => {
    const saved = getCookie('logsAutoScroll');
    return saved === 'true';
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [filter, setFilter] = useState({
    dagName: dagName,
    runId: dagRunId,
    startDate: startDate,
    endDate: endDate,
    taskId: '',
    level: 'all' // all, INFO, WARNING, ERROR, DEBUG
  });
  const logEndRef = useRef(null);
  const logViewerRef = useRef(null);
  const topSentinelRef = useRef(null);
  const bottomSentinelRef = useRef(null);
  const intervalRef = useRef(null);
  const logCounterRef = useRef(0);
  const logsRef = useRef(logs);
  const prevLogsLengthRef = useRef(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingDirectionRef = useRef(null); // 'top' or 'bottom'
  const [hasMoreTopLogs, setHasMoreTopLogs] = useState(true);       // 상단에 추가 로그가 있는지 여부
  const [hasMoreBottomLogs, setHasMoreBottomLogs] = useState(true); // 하단에 추가 로그가 있는지 여부
  
  // logs 상태 변경 시 ref 업데이트
  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  // 자동 스크롤
  const scrollToBottom = () => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 자동 생성 로그 함수
  const generateMockLogs = useCallback(() => {
    const levels = ['INFO', 'WARNING', 'ERROR', 'DEBUG'];
    const messages = [
      '2026-01-06T10:00:00.127187317+09:00 stdout F 데이터베이스 연결 성공',
      '2026-01-06T10:00:00.127187318+09:00 stdout F API 요청 처리 중...',
      '2026-01-06T10:00:00.127187319+09:00 stdout F 파일 업로드 완료',
      '2026-01-06T10:00:00.127187320+09:00 stdout F 백업 작업 시작',
      '2026-01-06T10:00:00.127187322+09:00 stdout F 캐시 정리 완료',
      '2026-01-06T10:00:00.127187333+09:00 stdout F 사용자 인증 성공',
      '2026-01-06T10:00:00.127187344+09:00 stdout F 데이터 검증 완료',
      '2026-01-06T10:00:00.127187355+09:00 stdout F 이메일 전송 실패',
      '2026-01-06T10:00:00.127187366+09:00 stdout F 세션 만료 경고',
      '2026-01-06T10:00:00.127187367+09:00 stdout F 메모리 사용량 증가 감지',
      '2026-01-06T10:00:00.127187377+09:00 stdout F 네트워크 연결 확인',
      '2026-01-06T10:00:00.127187378+09:00 stdout F 작업 큐 처리 중',
      '2026-01-06T10:00:00.127187388+09:00 stdout F 로깅 시스템 초기화',
      '2026-01-06T10:00:00.127187389+09:00 stdout F 보안 검사 완료',
      '2026-01-06T10:00:00.127187399+09:00 stdout F 시스템 상태 정상'
    ];

    const newLogs = [];
    const count = Math.floor(Math.random() * 300) + 1; // 1-3개의 로그 생성

    for (let i = 0; i < count; i++) {
      const level = levels[Math.floor(Math.random() * levels.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];
      const timestamp = new Date().toISOString();
      
      logCounterRef.current += 1;
      
      newLogs.push({
        id: `mock-${Date.now()}-${logCounterRef.current}`,
        timestamp,
        level,
        message: `${message} [자동 생성 로그 #${logCounterRef.current}]`,
        source: 'internal',
        dag_name: filter.dagName || 'default',
        task_id: filter.taskId || null,
        run_id: filter.runId || null,
        url: {
          next: "?size=100",
          before: "?size=100"
        }
      });
    }

    return newLogs;
  }, [filter]);

  // 서버에서 받은 로그 포맷팅 함수
  const formatServerLogs = useCallback((serverLogs) => {
    return serverLogs.map((log, index) => ({
      id: log.id || `server-${Date.now()}-${index}`,
      timestamp: log.timestamp || new Date().toISOString(),
      level: log.level || 'INFO',
      message: log.message || log.content || '',
      source: 'server',
      dag_name: log.dag_name || filter.dagName || null,
      task_id: log.task_id || filter.taskId || null,
      run_id: log.run_id || filter.runId || null,
      url: log.url || null
    }));
  }, [filter]);

  // 기존 로그와 새 로그 병합 (중복 제거) 함수
  const mergeLogsWithoutDuplicates = useCallback((prevLogs, newLogs, direction = null) => {
    const existingIds = new Set(prevLogs.map(l => l.id));
    const filteredNewLogs = newLogs.filter(l => !existingIds.has(l.id));
    
    if (direction === 'top') {
      // 상단에 추가: 스크롤 위치 유지를 위해 스크롤 높이 저장
      const viewer = logViewerRef.current;
      const scrollHeightBefore = viewer ? viewer.scrollHeight : 0;
      const scrollTopBefore = viewer ? viewer.scrollTop : 0;
      
      const updatedLogs = [...filteredNewLogs, ...prevLogs].slice(-500);
      
      // 스크롤 위치 복원
      setTimeout(() => {
        if (viewer) {
          const scrollHeightAfter = viewer.scrollHeight;
          const scrollTopAfter = scrollHeightAfter - scrollHeightBefore + scrollTopBefore;
          viewer.scrollTop = scrollTopAfter;
        }
      }, 0);
      
      return updatedLogs;
    } else {
      // 하단에 추가 또는 기본 (direction이 null인 경우)
      return [...prevLogs, ...filteredNewLogs].slice(-500);
    }
  }, []);

  // 추가 로그 가져오기 (상단 또는 하단)
  const fetchMoreLogs = useCallback(async (direction) => {
    console.log('fetchMoreLogs - direction:', direction);
    if (isLoadingMore || loadingDirectionRef.current || loading) return;
    
    try {
      setIsLoadingMore(true);
      loadingDirectionRef.current = direction;
      setServerConnected(true);
      
      const currentLogs = logsRef.current;
      let urlParams = null;
      
      if (direction === 'top' && currentLogs.length > 0) {
        // 상단: 첫 번째 로그의 url.before 사용
        const firstLog = currentLogs[0];
        if (firstLog.url && firstLog.url.before) {
          urlParams = firstLog.url.before;
        } else {
          setIsLoadingMore(false);
          loadingDirectionRef.current = null;
          return;
        }
      } else if (direction === 'bottom' && currentLogs.length > 0) {
        // 하단: 마지막 로그의 url.next 사용
        const lastLog = currentLogs[currentLogs.length - 1];
        if (lastLog.url && lastLog.url.next) {
          urlParams = lastLog.url.next;
        } else {
          setIsLoadingMore(false);
          loadingDirectionRef.current = null;
          return;
        }
      } else {
        setIsLoadingMore(false);
        loadingDirectionRef.current = null;
        return;
      }
      
      const response = await apiService.getLogs(
        filter.dagName || null,
        filter.runId || null,
        filter.startDate || null,
        filter.endDate || null,
        filter.taskId || null,
        100,
        urlParams
      );
      
      if (response && response.logs && Array.isArray(response.logs)) {
        const formattedLogs = formatServerLogs(response.logs);
        
        // 추가 로그가 있는지 확인
        const currentLogs = logsRef.current;
        let hasMoreLogs = false;
        
        if (direction === 'top') {
          // top 방향: prevLogs의 첫 번째 log와 formattedLogs의 첫 번째 log 비교
          if (currentLogs.length > 0 && formattedLogs.length > 0) {
            const prevFirstLog = currentLogs[0];
            const formattedFirstLog = formattedLogs[0];
            // id를 기준으로 비교 (id가 없으면 timestamp와 message 조합으로 비교)
            if (prevFirstLog.id && formattedFirstLog.id) {
              hasMoreLogs = prevFirstLog.id !== formattedFirstLog.id;
            } else {
              hasMoreLogs = prevFirstLog.timestamp !== formattedFirstLog.timestamp || 
                           prevFirstLog.message !== formattedFirstLog.message;
            }
          } else if (formattedLogs.length > 0) {
            hasMoreLogs = true;
          }
        } else if (direction === 'bottom') {
          // bottom 방향: prevLogs의 마지막 log와 formattedLogs의 마지막 log 비교
          if (currentLogs.length > 0 && formattedLogs.length > 0) {
            const prevLastLog = currentLogs[currentLogs.length - 1];
            const formattedLastLog = formattedLogs[formattedLogs.length - 1];
            // id를 기준으로 비교 (id가 없으면 timestamp와 message 조합으로 비교)
            if (prevLastLog.id && formattedLastLog.id) {
              hasMoreLogs = prevLastLog.id !== formattedLastLog.id;
            } else {
              hasMoreLogs = prevLastLog.timestamp !== formattedLastLog.timestamp || 
                           prevLastLog.message !== formattedLastLog.message;
            }
          } else if (formattedLogs.length > 0) {
            hasMoreLogs = true;
          }
        }
        
        // 추가 로그가 있는지 상태 업데이트
        if (direction === 'top') {
          setHasMoreTopLogs(hasMoreLogs);
        } else if (direction === 'bottom') {
          // running state인 경우 hasMoreBottomLogs는 false가 될 수 없음
          if (state === 'running') {
            setHasMoreBottomLogs(true);
          } else {
            setHasMoreBottomLogs(hasMoreLogs);
          }
        }
        
        // 추가 로그가 있는 경우에만 병합
        if (hasMoreLogs) {
          setLogs(prevLogs => mergeLogsWithoutDuplicates(prevLogs, formattedLogs, direction));
        }
      }
    } catch (error) {
      console.error('Failed to fetch more logs:', error);
      setServerConnected(false);
      
      // 서버 오류 시 자동 생성 로그 추가
      const mockLogs = generateMockLogs();
      setLogs(prevLogs => mergeLogsWithoutDuplicates(prevLogs, mockLogs, direction));
    } finally {
      setIsLoadingMore(false);
      loadingDirectionRef.current = null;
    }
  }, [filter, isLoadingMore, loading, generateMockLogs, mergeLogsWithoutDuplicates, formatServerLogs, state]);

  // 로그 가져오기
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setServerConnected(true);
      
      // prevLogs가 있고 마지막 log의 url.next가 있으면 사용
      let urlParams = null;
      const prevLogs = logsRef.current;
      if (prevLogs.length > 0) {
        const lastLog = prevLogs[prevLogs.length - 1];
        if (lastLog.url && lastLog.url.next) {
          urlParams = lastLog.url.next;
        }
      }
      
      const response = await apiService.getLogs(
        filter.dagName || null,
        filter.runId || null,
        filter.startDate || null,
        filter.endDate || null,
        filter.taskId || null,
        100,
        urlParams
      );
      
      if (response && response.logs && Array.isArray(response.logs)) {
        const formattedLogs = formatServerLogs(response.logs);
        setLogs(prevLogs => mergeLogsWithoutDuplicates(prevLogs, formattedLogs));
        // fetchLogs를 통해 로그를 받아온 경우 무조건 스크롤
        setTimeout(() => {
          scrollToBottom();
        }, 0);
      } else {
        // 응답 형식이 예상과 다를 경우
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch logs from server:', error);
      setServerConnected(false);
      
      // 서버 오류 시 자동 생성 로그 추가
      const mockLogs = generateMockLogs();
      setLogs(prevLogs => mergeLogsWithoutDuplicates(prevLogs, mockLogs));
      // fetchLogs를 통해 로그를 받아온 경우 무조건 스크롤
      setTimeout(() => {
        scrollToBottom();
      }, 0);
    } finally {
      setLoading(false);
    }
  }, [filter, generateMockLogs, mergeLogsWithoutDuplicates, formatServerLogs]);

  // props 변경 시 filter 업데이트 및 로그 초기화
  useEffect(() => {
    if (dagName || dagRunId || startDate || endDate) {
      // 로그 초기화
      setLogs([]);
      // hasMoreTopLogs, hasMoreBottomLogs 초기화
      setHasMoreTopLogs(true);
      setHasMoreBottomLogs(true);
      
      setFilter(prevFilter => ({
        ...prevFilter,
        dagName: dagName || prevFilter.dagName,
        runId: dagRunId || prevFilter.runId,
        startDate: startDate || prevFilter.startDate,
        endDate: endDate || prevFilter.endDate
      }));
    }
  }, [dagName, dagRunId, startDate, endDate]);

  // filter 변경 시 새로운 로그 받아오기
  useEffect(() => {
    if (filter.dagName || filter.runId || filter.startDate || filter.endDate) {
      fetchLogs();
    }
  }, [filter.dagName, filter.runId, filter.startDate, filter.endDate, fetchLogs]);

  // 초기 로드 및 자동 새로고침
  useEffect(() => {
    // 초기 로드
    fetchLogs();

    // 자동 새로고침 설정
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchLogs();
      }, refreshInterval * 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  // 로그가 업데이트될 때 자동 스크롤
  useEffect(() => {
    const currentLogsLength = logs.length;
    const prevLogsLength = prevLogsLengthRef.current;
    
    // autoScroll이 On인 경우 또는 로그가 비어있다가 추가된 경우
    if (autoScroll || (prevLogsLength === 0 && currentLogsLength > 0)) {
      scrollToBottom();
    }
    
    // 이전 로그 길이 업데이트
    prevLogsLengthRef.current = currentLogsLength;
  }, [logs, autoScroll]);

  // 로그 레벨에 따른 스타일
  const getLogLevelClass = (level) => {
    switch (level?.toUpperCase()) {
      case 'ERROR':
        return 'log-error';
      case 'WARNING':
        return 'log-warning';
      case 'DEBUG':
        return 'log-debug';
      case 'INFO':
      default:
        return 'log-info';
    }
  };

  // hideTimestamp 변경 시 쿠키 저장
  useEffect(() => {
    setCookie('logsHideTimestamp', hideTimestamp.toString());
  }, [hideTimestamp]);

  // autoScroll 변경 시 쿠키 저장
  useEffect(() => {
    setCookie('logsAutoScroll', autoScroll.toString());
  }, [autoScroll]);

  // 메시지에서 시간 형식 문자열 제거/복원
  const formatMessage = (message) => {
    if (!message) return message;
    
    // 시간 형식 패턴: "YYYY-MM-DD HH:MM:SS.xxxxxxxxx+09:00 stdout F "
    // 예: "2026-01-06 10:00:00.127187388+09:00 stdout F "
    const timestampPattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d+\+\d{2}:\d{2}\s+[^\s]+\s+[A-Z]\s+/;
    
    if (hideTimestamp) {
      // 시간 형식 문자열 제거
      return message.replace(timestampPattern, '');
    } else {
      // 원본 메시지 반환
      return message;
    }
  };

  // 로그 필터링
  const filteredLogs = logs.filter(log => {
    if (filter.level !== 'all' && log.level?.toUpperCase() !== filter.level) {
      return false;
    }
    if (filter.dagName && log.dag_name && !log.dag_name.includes(filter.dagName)) {
      return false;
    }
    if (filter.taskId && log.task_id && !log.task_id.includes(filter.taskId)) {
      return false;
    }
    if (filter.runId && log.run_id && !log.run_id.includes(filter.runId)) {
      return false;
    }
    return true;
  });

  // IntersectionObserver로 상단/하단 10개 감지
  useEffect(() => {
    if (filteredLogs.length === 0 || !logViewerRef.current) return;

    let topObserver = null;
    let bottomObserver = null;
    let topTriggered = false;
    let bottomTriggered = false;

    // DOM 업데이트 후 observer 설정
    const timeoutId = setTimeout(() => {
      const viewer = logViewerRef.current;
      if (!viewer) return;
      
      // 상단 10개 감지용 Observer
      topObserver = new IntersectionObserver(
        (entries) => {
          const visibleEntry = entries.find(entry => entry.isIntersecting);
          if (visibleEntry && !isLoadingMore && !loadingDirectionRef.current && !topTriggered && hasMoreTopLogs) {
            const firstLog = filteredLogs[0];
            if (firstLog && firstLog.url && firstLog.url.before) {
              topTriggered = true;
              fetchMoreLogs('top').finally(() => {
                topTriggered = false;
              });
            }
          }
        },
        { root: viewer, rootMargin: '0px', threshold: 0.1 }
      );

      // 하단 10개 감지용 Observer
      bottomObserver = new IntersectionObserver(
        (entries) => {
          const visibleEntry = entries.find(entry => entry.isIntersecting);
          if (visibleEntry && !isLoadingMore && !loadingDirectionRef.current && !bottomTriggered && hasMoreBottomLogs) {
            const lastLog = filteredLogs[filteredLogs.length - 1];
            if (lastLog && lastLog.url && lastLog.url.next) {
              bottomTriggered = true;
              fetchMoreLogs('bottom').finally(() => {
                bottomTriggered = false;
              });
            }
          }
        },
        { root: viewer, rootMargin: '0px', threshold: 0.1 }
      );

      // 상단 10개와 하단 10개 요소 찾기
      const top10Indices = Math.min(10, filteredLogs.length);
      const bottom10StartIndex = Math.max(0, filteredLogs.length - 10);

      for (let i = 0; i < top10Indices; i++) {
        const element = document.querySelector(`[data-log-index="${i}"]`);
        if (element) {
          topObserver.observe(element);
        }
      }

      for (let i = bottom10StartIndex; i < filteredLogs.length; i++) {
        const element = document.querySelector(`[data-log-index="${i}"]`);
        if (element) {
          bottomObserver.observe(element);
        }
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (topObserver) {
        topObserver.disconnect();
      }
      if (bottomObserver) {
        bottomObserver.disconnect();
      }
      topTriggered = false;
      bottomTriggered = false;
    };
  }, [filteredLogs, isLoadingMore, fetchMoreLogs, hasMoreTopLogs, hasMoreBottomLogs]);

  // 로그 클리어
  const clearLogs = () => {
    setLogs([]);
    logCounterRef.current = 0;
  };

  // 로그 내보내기
  const exportLogs = () => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp}] [${log.level}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="App-header">
      {/* 컨트롤 패널 */}
      <div className="log-controls">
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            자동 새로고침
          </label>
          {autoRefresh && (
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="interval-select"
            >
              <option value={1}>1초</option>
              <option value={2}>2초</option>
              <option value={5}>5초</option>
              <option value={10}>10초</option>
            </select>
          )}
          <label style={{ marginLeft: '15px' }}>
            <input
              type="checkbox"
              checked={hideTimestamp}
              onChange={(e) => setHideTimestamp(e.target.checked)}
            />
            시간 감추기
          </label>
          <label style={{ marginLeft: '15px' }}>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            자동스크롤
          </label>
        </div>

        <div className="control-group">
          <button onClick={fetchLogs} className="btn-refresh" disabled={loading}>
            {loading ? '로딩 중...' : '🔄 새로고침'}
          </button>
          <button onClick={clearLogs} className="btn-clear">
            🗑️ 클리어
          </button>
          <button onClick={exportLogs} className="btn-export">
            💾 내보내기
          </button>
        </div>
      </div>

      {/* 필터 패널 */}
      <div className="log-filters">
        <div className="filter-group">
          <label>레벨:</label>
          <select
            value={filter.level}
            onChange={(e) => setFilter({ ...filter, level: e.target.value })}
          >
            <option value="all">전체</option>
            <option value="DEBUG">DEBUG</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>

        <div className="filter-group">
          <label>DAG 이름:</label>
          <input
            type="text"
            placeholder="필터..."
            value={filter.dagName}
            onChange={(e) => setFilter({ ...filter, dagName: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>Task ID:</label>
          <input
            type="text"
            placeholder="필터..."
            value={filter.taskId}
            onChange={(e) => setFilter({ ...filter, taskId: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>Run ID:</label>
          <input
            type="text"
            placeholder="필터..."
            value={filter.runId}
            onChange={(e) => setFilter({ ...filter, runId: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>Start Date:</label>
          <input
            type="text"
            placeholder="YYYY-MM-DD HH:mm:ss"
            value={filter.startDate}
            onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>End Date:</label>
          <input
            type="text"
            placeholder="YYYY-MM-DD HH:mm:ss"
            value={filter.endDate}
            onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
          />
        </div>
      </div>

      {/* 로그 뷰어 */}
      <div className={`log-viewer-container ${isFullscreen ? 'fullscreen' : ''}`}>
        <div className="log-viewer" ref={logViewerRef}>
          {filteredLogs.length === 0 ? (
            <div className="log-empty">
              로그가 없습니다. {autoRefresh ? '잠시 후 로그가 표시됩니다...' : '새로고침 버튼을 클릭하세요.'}
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div
                key={log.id}
                data-log-index={index}
                className={`log-entry ${getLogLevelClass(log.level)}`}
              >
                <span className="log-timestamp">
                  {new Date(log.timestamp).toLocaleTimeString('ko-KR')}
                </span>
                <span className="log-level">[{log.level}]</span>
                <span className={`log-source ${log.source === 'server' ? 'source-server' : 'source-mock'}`}>
                  {log.source === 'server' ? '🌐' : '⚙️'}
                </span>
                <span className="log-message">{formatMessage(log.message)}</span>
                {log.dag_name && (
                  <span className="log-meta">DAG: {log.dag_name}</span>
                )}
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
        <div className="log-footer">
          <span>총 {filteredLogs.length}개 로그 표시 중</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {!serverConnected && (
              <span className="warning-text">
                ⚠️ 서버 연결이 끊어져 자동 생성 로그를 표시하고 있습니다.
              </span>
            )}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="fullscreen-toggle-btn"
              title={isFullscreen ? '축소' : '확대'}
            >
              {isFullscreen ? '⤓' : '⤢'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogsPage;

