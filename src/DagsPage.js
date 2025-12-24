import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from './services/api';
import './App.css';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

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

function DagsPage() {
  const navigate = useNavigate();
  const [dags, setDags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tags, setTags] = useState([]);
  // 쿠키에서 tag 읽기
  const [selectedTag, setSelectedTag] = useState(() => {
    const savedTag = getCookie('dagsSelectedTag');
    return savedTag || '';
  });
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [focusedTagIndex, setFocusedTagIndex] = useState(0);

  // status 토글 핸들러
  const handleStatusToggle = async (dagId, currentStatus, e) => {
    e.stopPropagation(); // 테이블 행 클릭 이벤트 방지
    
    try {
      const newStatus = !currentStatus;
      // API 호출로 status 업데이트 (필요시)
      // await apiService.updateDagStatus(dagId, newStatus);
      
      // 로컬 상태 업데이트
      setDags(prevDags => 
        prevDags.map(dag => 
          dag.dag_id === dagId ? { ...dag, status: newStatus } : dag
        )
      );
    } catch (err) {
      console.error('Failed to update DAG status:', err);
    }
  };

  // getDags를 재활용하는 fetchDags 함수
  const fetchDags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getDags(selectedTag || null);
      setDags(data);
    } catch (err) {
      console.error('Failed to fetch DAG list:', err);
      setError('Dags를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedTag]);

  useEffect(() => {
    fetchDags();
  }, [fetchDags]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await apiService.getTags();
        setTags(data);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
      }
    };

    fetchTags();
  }, []);

  // selectedTag 변경 시 쿠키에 저장
  useEffect(() => {
    if (selectedTag) {
      setCookie('dagsSelectedTag', selectedTag);
    } else {
      // 빈 값일 때는 쿠키 삭제
      setCookie('dagsSelectedTag', '');
    }
  }, [selectedTag]);

  // 검색 필터링 (tag는 API에서 필터링됨)
  const filteredDags = dags.filter(dag =>
    dag.dag_display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dag.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="loading">Dags를 불러오는 중...</div>
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
      {/* 검색 바 및 Tag 필터 */}
      <div style={{ 
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', minWidth: '150px' }}>
          <input
            type="text"
            placeholder="Tag로 필터링..."
            value={selectedTag ? (tags.find(t => (t.name || t) === selectedTag)?.name || selectedTag) : tagSearchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setTagSearchTerm(value);
              setSelectedTag(''); // 입력 시 선택 해제
              setFocusedTagIndex(0); // 포커스 인덱스 리셋
              setIsTagDropdownOpen(true);
            }}
            onKeyDown={(e) => {
              const filteredTags = tags.filter(tag => {
                const tagName = tag.name || tag;
                return tagName.toLowerCase().includes(tagSearchTerm.toLowerCase());
              });
              const totalOptions = filteredTags.length + 1; // 전체 Tag 옵션 포함
              
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIsTagDropdownOpen(true);
                setFocusedTagIndex(prev => 
                  prev < totalOptions - 1 ? prev + 1 : prev
                );
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setIsTagDropdownOpen(true);
                setFocusedTagIndex(prev => prev > -1 ? prev - 1 : -1);
              } else if (e.key === 'Enter') {
                e.preventDefault();
                if (focusedTagIndex === -1 || focusedTagIndex === 0) {
                  // 전체 Tag 선택
                  setSelectedTag('');
                  setTagSearchTerm('');
                } else {
                  // 태그 선택 (인덱스에서 1 빼기: 전체 Tag 옵션 제외)
                  const selectedIndex = focusedTagIndex - 1;
                  if (selectedIndex < filteredTags.length) {
                    const tagName = filteredTags[selectedIndex].name || filteredTags[selectedIndex];
                    setSelectedTag(tagName);
                    setTagSearchTerm('');
                  }
                }
                setIsTagDropdownOpen(false);
                setFocusedTagIndex(0);
              } else if (e.key === 'Escape') {
                setIsTagDropdownOpen(false);
                setFocusedTagIndex(0);
              }
            }}
            onFocus={() => {
              setIsTagDropdownOpen(true);
              setFocusedTagIndex(0);
            }}
            onBlur={() => {
              // 드롭다운 클릭을 기다리기 위해 약간의 지연
              setTimeout(() => {
                setIsTagDropdownOpen(false);
                setFocusedTagIndex(0);
                if (!selectedTag) {
                  setTagSearchTerm('');
                }
              }, 200);
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsTagDropdownOpen(true);
            }}
            style={{
              width: '100%',
              padding: '10px 15px',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: 'white',
              outline: 'none'
            }}
          />
          {isTagDropdownOpen && (() => {
            const filteredTags = tags.filter(tag => {
              const tagName = tag.name || tag;
              return tagName.toLowerCase().includes(tagSearchTerm.toLowerCase());
            });
            
            return (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderTop: 'none',
                  borderRadius: '0 0 4px 4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onMouseDown={(e) => e.preventDefault()} // onBlur 방지
              >
                <div
                  style={{
                    padding: '8px 15px',
                    cursor: 'pointer',
                    backgroundColor: focusedTagIndex === 0 
                      ? '#e3f2fd' 
                      : (!selectedTag ? '#f8f9fa' : 'white'),
                    fontWeight: focusedTagIndex === 0 || !selectedTag ? '600' : '400'
                  }}
                  onMouseDown={() => {
                    setSelectedTag('');
                    setTagSearchTerm('');
                    setIsTagDropdownOpen(false);
                    setFocusedTagIndex(0);
                  }}
                  onMouseEnter={() => setFocusedTagIndex(0)}
                >
                  전체 Tag
                </div>
                {filteredTags.map((tag, index) => {
                  const tagName = tag.name || tag;
                  const displayIndex = index + 1; // 전체 Tag 옵션 다음부터
                  return (
                    <div
                      key={index}
                      style={{
                        padding: '8px 15px',
                        cursor: 'pointer',
                        backgroundColor: focusedTagIndex === displayIndex 
                          ? '#e3f2fd' 
                          : (selectedTag === tagName ? '#e3f2fd' : 'white'),
                        fontWeight: focusedTagIndex === displayIndex || selectedTag === tagName ? '600' : '400'
                      }}
                      onMouseDown={() => {
                        setSelectedTag(tagName);
                        setTagSearchTerm('');
                        setIsTagDropdownOpen(false);
                        setFocusedTagIndex(0);
                      }}
                      onMouseEnter={() => setFocusedTagIndex(displayIndex)}
                    >
                      {tagName}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
        <input
          type="text"
          placeholder="DAG 이름 또는 설명으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 15px',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </div>

      {/* Dags 테이블 */}
      <div style={{
        marginTop: '20px',
        overflowX: 'auto',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {filteredDags.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666'
          }}>
            {searchTerm ? '검색 결과가 없습니다.' : 'DAG가 없습니다.'}
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #dee2e6'
              }}>
                <th style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#333',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  상태
                </th>
                <th style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#333',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  DAG 이름
                </th>
                <th style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#333',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  소유자
                </th>
                <th style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#333',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  Runs
                </th>
                <th style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#333',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  스케줄
                </th>
                <th style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#333',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  Last Run
                </th>
                <th style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#333',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  Next Run
                </th>
                <th style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#333',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  태스크
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDags.map((dag, index) => (
                <tr
                  key={dag.dag_id || dag.dag_display_name}
                  style={{
                    borderBottom: '1px solid #dee2e6',
                    transition: 'background-color 0.2s',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    navigate(`/runs?dag=${encodeURIComponent(dag.dag_display_name)}`);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                  }}
                >
                  <td style={{
                    padding: '12px 15px'
                  }}>
                    <label style={{
                      display: 'inline-block',
                      position: 'relative',
                      width: '50px',
                      height: '26px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={dag.status === true || dag.status === 'true'}
                        onChange={(e) => handleStatusToggle(dag.dag_id || dag.dag_display_name, dag.status, e)}
                        style={{
                          opacity: 0,
                          width: 0,
                          height: 0
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: (dag.status === true || dag.status === 'true') ? '#28a745' : '#ccc',
                        borderRadius: '26px',
                        transition: 'background-color 0.3s',
                        display: 'block'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '""',
                          height: '20px',
                          width: '20px',
                          left: '3px',
                          bottom: '3px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: 'transform 0.3s',
                          transform: (dag.status === true || dag.status === 'true') ? 'translateX(24px)' : 'translateX(0)',
                          display: 'block'
                        }} />
                      </span>
                    </label>
                  </td>
                  <td style={{
                    padding: '12px 15px',
                    color: '#333',
                    fontWeight: '500',
                    textAlign: 'left'
                  }}>
                    <div>{dag.dag_display_name}</div>
                    {dag.tags && dag.tags.length > 0 && (
                      <div style={{
                        marginTop: '6px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px'
                      }}>
                        {dag.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '400'
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={{
                    padding: '12px 15px',
                    color: '#666',
                    textAlign: 'left'
                  }}>
                    {dag.owner || '-'}
                  </td>
                  <td style={{
                    padding: '12px 15px',
                    textAlign: 'left'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                      alignItems: 'center'
                    }}>
                      {(() => {
                        // state별 테두리 색상 정의
                        const getStateBorderColor = (state) => {
                          switch (state) {
                            case 'queued': return 'gray'; // 회색
                            case 'success': return 'green'; // 녹색
                            case 'running': return 'lime'; // 연두색
                            case 'failed': return 'red'; // 빨간색
                            default: return '#6c757d';
                          }
                        };
                        
                        // 모든 상태 목록
                        const allStates = ['queued', 'success', 'running', 'failed'];
                        
                        // runs_stat을 맵으로 변환 (빠른 조회를 위해)
                        const runsStatMap = {};
                        if (dag.runs_stat && dag.runs_stat.length > 0) {
                          dag.runs_stat.forEach(stat => {
                            runsStatMap[stat.state] = stat.count;
                          });
                        }
                        
                        // 모든 상태에 대해 원 생성
                        return allStates.map((state, index) => {
                          const count = runsStatMap[state] || 0;
                          // count가 0보다 크면 해당 state 색상, 아니면 연한 회색
                          const borderColor = count > 0 ? getStateBorderColor(state) : '#d3d3d3';
                          
                          return (
                            <div
                              key={index}
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: 'white',
                                border: `2px solid ${borderColor}`,
                                color: '#333',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}
                            >
                              {count > 0 ? count : ''}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </td>
                  <td style={{
                    padding: '12px 15px',
                    color: '#666',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                  }}>
                    {dag.schedule?.value || dag.schedule || '-'}
                  </td>
                  <td style={{
                    padding: '12px 15px',
                    color: '#666',
                    textAlign: 'left'
                  }}>
                    {dag.last_date ? (() => {
                      try {
                        const date = new Date(dag.last_date);
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        const seconds = String(date.getSeconds()).padStart(2, '0');
                        return `${year}-${month}-${day}, ${hours}:${minutes}:${seconds}`;
                      } catch (e) {
                        return dag.last_date;
                      }
                    })() : '-'}
                  </td>
                  <td style={{
                    padding: '12px 15px',
                    color: '#666',
                    textAlign: 'left'
                  }}>
                    {dag.next_date ? (() => {
                      try {
                        const date = new Date(dag.next_date);
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        const seconds = String(date.getSeconds()).padStart(2, '0');
                        return `${year}-${month}-${day}, ${hours}:${minutes}:${seconds}`;
                      } catch (e) {
                        return dag.next_date;
                      }
                    })() : '-'}
                  </td>
                  <td style={{
                    padding: '12px 15px',
                    color: '#666',
                    textAlign: 'left'
                  }}>
                    {dag.tasks || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 통계 정보 */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            {dags.length}
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
            전체 DAG
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
            {dags.filter(d => d.status === true || d.status === 'true').length}
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
            활성화
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6c757d' }}>
            {dags.filter(d => d.status === false || d.status === 'false').length}
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
            비활성화
          </div>
        </div>
      </div>
    </div>
  );
}

export default DagsPage;

