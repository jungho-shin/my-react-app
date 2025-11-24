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
          'Recharts 차트',
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

  // Recharts 차트 데이터
  async getRechartsData() {
    try {
      return await this.get('/charts/recharts');
    } catch (error) {
      // API 실패 시 기본 데이터 반환
      return [
        { month: 'Jan', John: 5, Joe: 3, Jane: 2, Janet: 3 },
        { month: 'Feb', John: 3, Joe: 4, Jane: 5, Janet: 0 },
        { month: 'Mar', John: 4, Joe: 4, Jane: 6, Janet: 4 },
        { month: 'Apr', John: 7, Joe: 2, Jane: 2, Janet: 4 },
        { month: 'May', John: 2, Joe: 5, Jane: 1, Janet: 2 },
        { month: 'Jun', John: 3, Joe: 6, Jane: 2, Janet: 3 },
        { month: 'Jul', John: 4, Joe: 7, Jane: 3, Janet: 4 },
        { month: 'Aug', John: 5, Joe: 8, Jane: 4, Janet: 5 },
        { month: 'Sep', John: 6, Joe: 9, Jane: 5, Janet: 6 },
        { month: 'Oct', John: 7, Joe: 10, Jane: 6, Janet: 7 },
        { month: 'Nov', John: 8, Joe: 11, Jane: 7, Janet: 8 },
        { month: 'Dec', John: 9, Joe: 12, Jane: 8, Janet: 9 }
      ];
    }
  }

  // DAG 목록 가져오기
  async getDagList() {
    try {
      return await this.get('/dags');
    } catch (error) {
      // API 실패 시 기본 데이터 반환
      return [
        {
          id: 'hello',
          name: 'hello',
          description: 'Hello DAG - 간단한 테스트 워크플로우',
          status: 'running',
          owner: 'admin',
          schedule: '@daily',
          tasks: 3
        },
        {
          id: 'airflow',
          name: 'airflow',
          description: 'Airflow DAG - 데이터 파이프라인 워크플로우',
          status: 'running',
          owner: 'admin',
          schedule: '@hourly',
          tasks: 5
        },
        {
          id: 'data_processing',
          name: 'data_processing',
          description: '데이터 처리 파이프라인',
          status: 'paused',
          owner: 'data_team',
          schedule: '0 2 * * *',
          tasks: 8
        },
        {
          id: 'etl_pipeline',
          name: 'etl_pipeline',
          description: 'ETL 파이프라인 - 추출, 변환, 로드',
          status: 'running',
          owner: 'etl_team',
          schedule: '0 */6 * * *',
          tasks: 12
        },
        {
          id: 'report_generation',
          name: 'report_generation',
          description: '일일 리포트 생성 워크플로우',
          status: 'running',
          owner: 'report_team',
          schedule: '0 9 * * 1-5',
          tasks: 6
        }
      ];
    }
  }

  // 로그 모니터링 대시보드 데이터
  async getLogMonitorData(dataCount = 5) {
    try {
      return await this.get(`/monitor/logs?count=${dataCount}`);
    } catch (error) {
      // API 실패 시 기본 데이터 반환
      const generateSampleData = (count = 5) => {
        const data = [];
        const today = new Date();
        
        for (let i = count - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          
          data.push({
            date: date.toISOString().split('T')[0],
            displayDate: date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: '2-digit', 
              hour: '2-digit', 
              minute: '2-digit' 
            }).replace(',', ''),
            duration: Math.random() * 11,
            timestamp: date.getTime()
          });
        }
        
        return data;
      };

      const generateStatusData = (count = 5) => {
        const helloStatus = [];
        const airflowStatus = [];
        
        for (let i = 0; i < count; i++) {
          const helloValue = Math.random();
          if (helloValue > 0.9) {
            helloStatus.push({ status: 'highlight', index: i });
          } else {
            helloStatus.push({ status: 'success', index: i });
          }
          
          const airflowValue = Math.random();
          if (i === count - 1) {
            airflowStatus.push({ status: 'empty', index: i });
          } else if (airflowValue > 0.8) {
            airflowStatus.push({ status: 'pending', index: i });
          } else {
            airflowStatus.push({ status: 'success', index: i });
          }
        }
        
        return { hello: helloStatus, airflow: airflowStatus };
      };

      return {
        chartData: generateSampleData(dataCount),
        statusData: generateStatusData(dataCount)
      };
    }
  }
}

export default new ApiService();
