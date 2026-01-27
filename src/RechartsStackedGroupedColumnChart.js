import React from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { DEFAULT_JOBS_DATA } from './services/api';

// 설정값 상수화 (이 값만 바꾸면 전체 적용됨)
const BAR_WIDTH = 10;        // Bar 너비
const JOB_GAP = 70;          // Job 사이 간격
const LEFT_MARGIN = 60;      // 좌측 margin
const RIGHT_MARGIN = 30;     // 우측 margin
const SQUARE_SIZE = 10;      // 사각형 너비/높이

const RechartsStackedGroupedColumnChart = ({ data }) => {
  // 새로운 구조의 데이터를 평면 구조로 변환하는 함수
  const transformData = (nestedData) => {
    if (!nestedData || !Array.isArray(nestedData)) {
      return [];
    }
    
    return nestedData.map(item => {
      const flatData = { job_id: item.job_id };
      
      // level_infos를 순회하며 평면 구조로 변환
      if (item.level_infos && Array.isArray(item.level_infos)) {
        item.level_infos.forEach(levelInfo => {
          const levelType = levelInfo.level_type;
          
          if (levelInfo.step_infos && Array.isArray(levelInfo.step_infos)) {
            levelInfo.step_infos.forEach(stepInfo => {
              const stepInfoName = stepInfo.step_info;
              const key = `${levelType}_${stepInfoName}`;
              flatData[key] = stepInfo.step_duration || 0;
            });
          }
        });
      }
      
      return flatData;
    });
  };

  // 데이터 변환: 새로운 구조를 평면 구조로 변환
  const inputData = data || DEFAULT_JOBS_DATA;
  const chartData = transformData(inputData);
  
  // 원본 데이터 유지 (사각형 표시를 위해)
  const originalData = inputData;

  // 색상 정의 - S1, S2, S3, S4, S 5는 각각 동일한 색상 사용
  const colors = {
    S1: '#8884d8',
    S2: '#82ca9d',
    S3: '#ffc658',
    S4: '#ff7300',
    'S 5': '#9c27b0'
  };

  // 상태별 색상 함수
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

  // 차트 너비 계산: job 개수 * (barSize + gap) + 좌우 margin
  const chartWidth = chartData.length * (BAR_WIDTH + JOB_GAP) + LEFT_MARGIN + RIGHT_MARGIN;

  return (
    <div style={{ width: '100%', overflowX: 'auto', margin: '20px 0' }}>
      <div style={{ width: `${chartWidth}px`, position: 'relative', marginLeft: 'auto' }}>
        <ComposedChart
          width={chartWidth}
          height={350}
          data={chartData}
          margin={{
            top: 60,
            right: RIGHT_MARGIN,
            left: LEFT_MARGIN,
            bottom: 20,
          }}
          barCategoryGap={JOB_GAP}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          {/* 상단 job_id 축 */}
          <XAxis 
            dataKey="job_id" 
            orientation="top"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#999' }}
          />
          {/* 하단 사각형 축 */}
          <XAxis 
            xAxisId="status"
            dataKey="job_id"
            orientation="bottom"
            axisLine={false}
            tickLine={false}
            interval={0} 
            tick={(props) => {
              const { x, y, index } = props;
              const jobItem = originalData[index];
              // state 정보가 있으면 사용, 없으면 기본값
              const state = jobItem?.state || 'empty';
              const statusColor = getStatusColor(state);
              
              return (
                <g transform={`translate(${x},${y})`}>
                  <rect 
                    x={-SQUARE_SIZE / 2}
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
            }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#999' }}
            width={60}
          />
          {/* <Tooltip 
            cursor={{ fill: '#f5f5f5' }}
            formatter={(value, name) => [`${value}초`, name]}
            labelFormatter={(label) => `Job ID: ${label}`}
          /> */}
          <Legend 
            verticalAlign="middle"
            align="right"
            layout="vertical"
            iconType="rect"
            wrapperStyle={{ paddingLeft: '20px' }}
            payload={[
              { value: 'S1', type: 'rect', id: 'S1', color: colors.S1 },
              { value: 'S2', type: 'rect', id: 'S2', color: colors.S2 },
              { value: 'S3', type: 'rect', id: 'S3', color: colors.S3 },
              { value: 'S4', type: 'rect', id: 'S4', color: colors.S4 },
              { value: 'S 5', type: 'rect', id: 'S 5', color: colors['S 5'] }
            ]}
          />
          
          {/* L1 Group - S1 (Stack) */}
          <Bar 
            dataKey="L1_S1" 
            stackId="L1" 
            name="L1 - S1" 
            fill={colors.S1}
            barSize={BAR_WIDTH}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L1 Group - S2 (Stack) */}
          <Bar 
            dataKey="L1_S2" 
            stackId="L1" 
            name="L1 - S2" 
            fill={colors.S2}
            barSize={BAR_WIDTH}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L1 Group - S3 (Stack) */}
          <Bar 
            dataKey="L1_S3" 
            stackId="L1" 
            name="L1 - S3" 
            fill={colors.S3}
            barSize={BAR_WIDTH}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L1 Group - S4 (Stack) */}
          <Bar 
            dataKey="L1_S4" 
            stackId="L1" 
            name="L1 - S4" 
            fill={colors.S4}
            barSize={BAR_WIDTH}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L1 Group - S 5 (Stack) */}
          <Bar 
            dataKey="L1_S 5" 
            stackId="L1" 
            name="L1 - S 5" 
            fill={colors['S 5']}
            barSize={BAR_WIDTH}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L2 Group - S1 (Stack) */}
          <Bar 
            dataKey="L2_S1" 
            stackId="L2" 
            name="L2 - S1" 
            fill={colors.S1}
            barSize={BAR_WIDTH}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L2 Group - S2 (Stack) */}
          <Bar 
            dataKey="L2_S2" 
            stackId="L2" 
            name="L2 - S2" 
            fill={colors.S2}
            barSize={BAR_WIDTH}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L2 Group - S3 (Stack) */}
          <Bar 
            dataKey="L2_S3" 
            stackId="L2" 
            name="L2 - S3" 
            fill={colors.S3}
            barSize={BAR_WIDTH}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L2 Group - S4 (Stack) */}
          <Bar 
            dataKey="L2_S4" 
            stackId="L2" 
            name="L2 - S4" 
            fill={colors.S4}
            barSize={BAR_WIDTH}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L2 Group - S 5 (Stack) */}
          <Bar 
            dataKey="L2_S 5" 
            stackId="L2" 
            name="L2 - S 5" 
            fill={colors['S 5']}
            barSize={BAR_WIDTH}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L3 Group - S1 (Stack) */}
          <Bar 
            dataKey="L3_S1" 
            stackId="L3" 
            name="L3 - S1" 
            fill={colors.S1}
            barSize={BAR_WIDTH}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L3 Group - S2 (Stack) */}
          <Bar 
            dataKey="L3_S2" 
            stackId="L3" 
            name="L3 - S2" 
            fill={colors.S2}
            barSize={BAR_WIDTH}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L3 Group - S3 (Stack) */}
          <Bar 
            dataKey="L3_S3" 
            stackId="L3" 
            name="L3 - S3" 
            fill={colors.S3}
            barSize={BAR_WIDTH}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L3 Group - S4 (Stack) */}
          <Bar 
            dataKey="L3_S4" 
            stackId="L3" 
            name="L3 - S4" 
            fill={colors.S4}
            barSize={BAR_WIDTH}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L3 Group - S 5 (Stack) */}
          <Bar 
            dataKey="L3_S 5" 
            stackId="L3" 
            name="L3 - S 5" 
            fill={colors['S 5']}
            barSize={BAR_WIDTH}
            radius={[0, 0, 0, 0]}
          />
        </ComposedChart>
      </div>
    </div>
  );
};

export default RechartsStackedGroupedColumnChart;
