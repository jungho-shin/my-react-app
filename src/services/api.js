// API 서비스 유틸리티
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

class ApiService {
  // 기본 fetch 래퍼
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // GET 요청
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST 요청
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT 요청
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE 요청
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // 메인페이지 데이터
  async getMainPageData() {
    try {
      return await this.get('/main');
    } catch (error) {
      // API 실패 시 기본 데이터 반환
      return {
        podInfo: {
          podName: process.env.REACT_APP_POD_NAME || 'react-app-pod',
          nodeName: process.env.REACT_APP_NODE_NAME || 'minikube',
          namespace: process.env.REACT_APP_NAMESPACE || 'default'
        },
        status: 'running',
        features: [
          '실시간 시계',
          'Kubernetes 환경 정보',
          '반응형 디자인',
          'Docker 컨테이너화',
          'K8s 배포 준비',
          'Highcharts 차트',
          'Jobs',
          '실시간 로그 모니터링'
        ]
      };
    }
  }

  // Highcharts 차트 데이터
  async getHighchartsData() {
    try {
      return await this.get('/charts/highcharts');
    } catch (error) {
      // API 실패 시 기본 데이터 반환
      return {
        series: [
          {
            name: 'John',
            data: [5, 3, 4, 7, 2, 3, 4, 5, 6, 7, 8, 9],
            stack: 'male'
          },
          {
            name: 'Joe',
            data: [3, 4, 4, 2, 5, 6, 7, 8, 9, 10, 11, 12],
            stack: 'male'
          },
          {
            name: 'Jane',
            data: [2, 5, 6, 2, 1, 2, 3, 4, 5, 6, 7, 8],
            stack: 'female'
          },
          {
            name: 'Janet',
            data: [3, 0, 4, 4, 2, 3, 4, 5, 6, 7, 8, 9],
            stack: 'female'
          }
        ],
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      };
    }
  }

  // Jobs 가져오기
  async getJobs() {
    try {
      return await this.get('/charts/jobs');
    } catch (error) {
      // API 실패 시 기본 데이터 반환 (새로운 구조)
      return [
        {
          job_id: 'Job1',
          level_infos: [
            {
              level_type: "L1",
              step_infos: [
                { step_info: "S1", duration: 2 },
                { step_info: "S2", duration: 3 },
                { step_info: "S3", duration: 1 },
                { step_info: "S4", duration: 1 }
              ]
            },
            {
              level_type: "L2",
              step_infos: [
                { step_info: "S1", duration: 1 },
                { step_info: "S2", duration: 2 },
                { step_info: "S3", duration: 1 },
                { step_info: "S4", duration: 1 }
              ]
            },
            {
              level_type: "L3",
              step_infos: [
                { step_info: "S1", duration: 1 },
                { step_info: "S2", duration: 1 },
                { step_info: "S3", duration: 1 },
                { step_info: "S4", duration: 1 }
              ]
            }
          ]
        },
        {
          job_id: 'Job2',
          level_infos: [
            {
              level_type: "L1",
              step_infos: [
                { step_info: "S1", duration: 3 },
                { step_info: "S2", duration: 2 },
                { step_info: "S3", duration: 2 },
                { step_info: "S4", duration: 1 }
              ]
            },
            {
              level_type: "L2",
              step_infos: [
                { step_info: "S1", duration: 2 },
                { step_info: "S2", duration: 1 },
                { step_info: "S3", duration: 2 },
                { step_info: "S4", duration: 1 }
              ]
            },
            {
              level_type: "L3",
              step_infos: [
                { step_info: "S1", duration: 1 },
                { step_info: "S2", duration: 1 },
                { step_info: "S3", duration: 1 },
                { step_info: "S4", duration: 0 }
              ]
            }
          ]
        },
        {
          job_id: 'Job3',
          level_infos: [
            {
              level_type: "L1",
              step_infos: [
                { step_info: "S1", duration: 1 },
                { step_info: "S2", duration: 4 },
                { step_info: "S3", duration: 2 },
                { step_info: "S4", duration: 2 }
              ]
            },
            {
              level_type: "L2",
              step_infos: [
                { step_info: "S1", duration: 1 },
                { step_info: "S2", duration: 1 },
                { step_info: "S3", duration: 1 },
                { step_info: "S4", duration: 1 }
              ]
            },
            {
              level_type: "L3",
              step_infos: [
                { step_info: "S1", duration: 2 },
                { step_info: "S2", duration: 1 },
                { step_info: "S3", duration: 1 },
                { step_info: "S4", duration: 1 }
              ]
            }
          ]
        },
        {
          job_id: 'Job4',
          level_infos: [
            {
              level_type: "L1",
              step_infos: [
                { step_info: "S1", duration: 2 },
                { step_info: "S2", duration: 2 },
                { step_info: "S3", duration: 3 },
                { step_info: "S4", duration: 1 }
              ]
            },
            {
              level_type: "L2",
              step_infos: [
                { step_info: "S1", duration: 2 },
                { step_info: "S2", duration: 1 },
                { step_info: "S3", duration: 1 },
                { step_info: "S4", duration: 1 }
              ]
            },
            {
              level_type: "L3",
              step_infos: [
                { step_info: "S1", duration: 1 },
                { step_info: "S2", duration: 1 },
                { step_info: "S3", duration: 1 },
                { step_info: "S4", duration: 1 }
              ]
            }
          ]
        },
        {
          job_id: 'Job5',
          level_infos: [
            {
              level_type: "L1",
              step_infos: [
                { step_info: "S1", duration: 3 },
                { step_info: "S2", duration: 3 },
                { step_info: "S3", duration: 1 },
                { step_info: "S4", duration: 2 }
              ]
            },
            {
              level_type: "L2",
              step_infos: [
                { step_info: "S1", duration: 2 },
                { step_info: "S2", duration: 2 },
                { step_info: "S3", duration: 1 },
                { step_info: "S4", duration: 1 }
              ]
            },
            {
              level_type: "L3",
              step_infos: [
                { step_info: "S1", duration: 1 },
                { step_info: "S2", duration: 1 },
                { step_info: "S3", duration: 1 },
                { step_info: "S4", duration: 0 }
              ]
            }
          ]
        }
      ];
    }
  }

  // Dags 가져오기
  async getDags(tagName = null) {
    try {
      const endpoint = tagName ? `/dags/${encodeURIComponent(tagName)}` : '/dags';
      return await this.get(endpoint);
    } catch (error) {
      // API 실패 시 기본 데이터 반환
      return [
        {
          dag_id: 'hello',
          dag_display_name: 'hello',
          description: 'Hello DAG - 간단한 테스트 워크플로우',
          last_date: null,
          next_date: null,
          status: true,
          owner: 'admin',
          schedule: {
            __type: 'CronExpression',
            value: '@daily'
          },
          tags: [
            {
              "name": 'DEV'
            },
            {
              "name": 'test'
            },
            {
              "name": 'example'
            }
          ],
          runs_stat: [
            {"count": 1, "state": "queued"},
            {"count": 34, "state": "success"},
            {"count": 1, "state": "running"},
            {"count": 1, "state": "failed"}
          ],
          tasks: 3
        },
        {
          dag_id: 'airflow',
          dag_display_name: 'airflow',
          description: 'Airflow DAG - 데이터 파이프라인 워크플로우',
          last_date: null,
          next_date: null,
          status: true,
          owner: 'admin',
          schedule: {
            __type: 'CronExpression',
            value: '@hourly'
          },
          tags: [
            {
              "name": 'PROD'
            },
            {
              "name": 'test'
            },
            {
              "name": 'airflow'
            }
          ],
          runs_stat: [
            {"count": 0, "state": "queued"},
            {"count": 342, "state": "success"},
            {"count": 0, "state": "running"},
            {"count": 0, "state": "failed"}
          ],
          tasks: 5
        },
        {
          dag_id: 'data_processing',
          dag_display_name: 'data_processing',
          description: '데이터 처리 파이프라인',
          last_date: '2025-01-13T04:47:00+00:00',
          next_date: '2025-01-13T04:48:00+00:00',
          status: false,
          owner: 'data_team',
          schedule: {
            __type: 'CronExpression',
            value: '0 2 * * *'
          },
          tags: [
            {
              "name": 'DEV'
            },
            {
              "name": 'test'
            },
            {
              "name": 'data_processing'
            }
          ],
          runs_stat: [
            {"count": 0, "state": "queued"},
            {"count": 18960, "state": "success"},
            {"count": 0, "state": "running"},
            {"count": 37, "state": "failed"}
          ],
          tasks: 8
        },
        {
          dag_id: 'etl_pipeline',
          dag_display_name: 'etl_pipeline',
          description: 'ETL 파이프라인 - 추출, 변환, 로드',
          last_date: null,
          next_date: null,
          status: true,
          owner: 'etl_team',
          schedule: {
            __type: 'CronExpression',
            value: '0 */6 * * *'
          },
          tags: [
            {
              "name": 'PROD'
            },
            {
              "name": 'etl_pipeline'
            }
          ],
          runs_stat: [],
          tasks: 12
        },
        {
          dag_id: 'report_generation',
          dag_display_name: 'report_generation',
          description: '일일 리포트 생성 워크플로우',
          last_date: null,
          next_date: null,
          status: true,
          owner: 'report_team',
          schedule: {
            __type: 'CronExpression',
            value: '0 9 * * 1-5'
          },
          tags: [
            {
              "name": 'PROD'
            },
            {
              "name": 'report_generation'
            }
          ],
          runs_stat: [],
          tasks: 6
        }
      ];
    }
  }

  // Runs 가져오기
  async getTags() {
    try {
      return await this.get('/tags');
    } catch (error) {
      console.error('Failed to fetch tags, returning empty array:', error);
      return ["DEV", "PROD", "test", "example", "airflow", "data_processing", "etl_pipeline", "report_generation"];
    }
  }

  async getRuns(dag_name, dataCount = 5) {
    const generateSampleData = (count = 5) => {
      const data = [];
      const today = new Date();
      
      // 날짜를 지정된 형식으로 포맷팅하는 함수
      const formatDate = (date) => {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        const milliseconds = date.getUTCMilliseconds();
        // 마이크로초를 6자리로 만들기 (밀리초를 3자리 + 랜덤 3자리)
        const microseconds = String(milliseconds).padStart(3, '0') + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${microseconds}+00:00`;
      };
      
      for (let i = count - 1; i >= 0; i--) {
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - i);
        
        const duration = Math.random() * 11;
        const endDate = new Date(startDate);
        endDate.setSeconds(endDate.getSeconds() + Math.floor(duration));
        endDate.setMilliseconds(endDate.getMilliseconds() + ((duration % 1) * 1000));
        
        // state 값 랜덤 할당: running, success, failed
        const stateValues = ['running', 'success', 'failed'];
        const randomState = stateValues[Math.floor(Math.random() * stateValues.length)];
        
        data.push({
          dag_run_id: "manual__" + formatDate(startDate),
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
          duration: duration,
          state: randomState
        });
      }
      
      return data;
    };

    try {
      const response = await this.get(`/airflowlike/dag_status/${dag_name}?count=${dataCount}`);
      let dag_runs = response.response.dag_runs;
      
      // duration 계산 함수: start_date와 end_date의 차이를 초 단위로 계산
      // state가 'running'인 경우 현재 시간을 사용
      const calculateDuration = (startDateStr, endDateStr, state) => {
        try {
          // ISO 8601 형식 파싱 (마이크로초 포함)
          const startDate = new Date(startDateStr);
          let endDate;
          
          // state가 'running'인 경우 현재 시간 사용
          if (state === 'running') {
            endDate = new Date();
          } else {
            endDate = new Date(endDateStr);
          }
          
          // 밀리초 차이를 초로 변환
          const diffInSeconds = (endDate.getTime() - startDate.getTime()) / 1000;
          return diffInSeconds;
        } catch (error) {
          console.error('Error calculating duration:', error);
          return 0;
        }
      };
      
      // 응답 데이터에 duration 추가
      if (dag_runs && Array.isArray(dag_runs)) {
        dag_runs = dag_runs.map(item => {
          if (item.start_date && !item.duration) {
            // state가 'running'인 경우 end_date가 없어도 현재 시간으로 계산
            if (item.state === 'running') {
              item.duration = calculateDuration(item.start_date, null, item.state);
            } else if (item.end_date) {
              item.duration = calculateDuration(item.start_date, item.end_date, item.state);
            }
          }
          return item;
        });
      }
      
      const data = {
        dag_runs: dag_runs
      }
      
      return data;
    } catch (error) {
      // API 실패 시 기본 데이터 반환
      const dag_runs = generateSampleData(dataCount);
      const data = {
        dag_runs: dag_runs
      };

      console.log('getRuns - fallback data:', data);

      return data;
    }
  }

  // 로그 가져오기
  async getLogs(dagName = null, runId = null, startDate = null, endDate = null, taskId = null, limit = 100, urlParams = null) {
    try {
      let endpoint = '/logs';

      if (urlParams) {
        endpoint += urlParams;
      } else {
        const params = new URLSearchParams();
      
        if (dagName) params.append('dag', dagName);
        if (runId) params.append('run', runId);
        if (startDate) params.append('_from', startDate);
        if (endDate) params.append('_to', endDate);
        if (taskId) params.append('task', taskId);
        if (limit) params.append('limit', limit.toString());
        
        if (params.toString()) {
          endpoint += `?${params.toString()}`;
        }
      }
      
      return await this.get(endpoint);
    } catch (error) {
      // API 실패 시 null 반환 (컴포넌트에서 자동 생성 로그 사용)
      console.error('Failed to fetch logs:', error);
      throw error;
    }
  }
}

export default new ApiService();
