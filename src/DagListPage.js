import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from './services/api';
import './App.css';

function DagListPage() {
  const navigate = useNavigate();
  const [dags, setDags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
          dag.id === dagId ? { ...dag, status: newStatus } : dag
        )
      );
    } catch (err) {
      console.error('Failed to update DAG status:', err);
    }
  };

  useEffect(() => {
    const fetchDags = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getDagList();
        setDags(data);
      } catch (err) {
        console.error('Failed to fetch DAG list:', err);
        setError('DAG 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchDags();
  }, []);

  // 검색 필터링
  const filteredDags = dags.filter(dag =>
    dag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dag.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="dashboard-header">
            <button 
              onClick={() => navigate('/')} 
              className="back-button"
            >
              ← 홈으로 돌아가기
            </button>
            <h1>📋 DAG 목록</h1>
          </div>
          <div className="loading">DAG 목록을 불러오는 중...</div>
        </header>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="dashboard-header">
            <button 
              onClick={() => navigate('/')} 
              className="back-button"
            >
              ← 홈으로 돌아가기
            </button>
            <h1>📋 DAG 목록</h1>
          </div>
          <div className="error">{error}</div>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="dashboard-header">
          <button 
            onClick={() => navigate('/')} 
            className="back-button"
          >
            ← 홈으로 돌아가기
          </button>
          <h1>📋 DAG 목록</h1>
        </div>

        {/* 검색 바 */}
        <div style={{ 
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <input
            type="text"
            placeholder="DAG 이름 또는 설명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 15px',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        {/* DAG 목록 테이블 */}
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
                    설명
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
                    스케줄
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
                    key={dag.id || dag.name}
                    style={{
                      borderBottom: '1px solid #dee2e6',
                      transition: 'background-color 0.2s',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      navigate(`/dashboard?dag=${encodeURIComponent(dag.name)}`);
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
                          onChange={(e) => handleStatusToggle(dag.id || dag.name, dag.status, e)}
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
                      fontWeight: '500'
                    }}>
                      {dag.name}
                    </td>
                    <td style={{
                      padding: '12px 15px',
                      color: '#666',
                      maxWidth: '300px'
                    }}>
                      {dag.description || '-'}
                    </td>
                    <td style={{
                      padding: '12px 15px',
                      color: '#666'
                    }}>
                      {dag.owner || '-'}
                    </td>
                    <td style={{
                      padding: '12px 15px',
                      color: '#666',
                      fontFamily: 'monospace',
                      fontSize: '13px'
                    }}>
                      {dag.schedule?.value || dag.schedule || '-'}
                    </td>
                    <td style={{
                      padding: '12px 15px',
                      color: '#666',
                      textAlign: 'center'
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
      </header>
    </div>
  );
}

export default DagListPage;
