import React from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { DEFAULT_JOBS_DATA } from './services/api';

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
              flatData[key] = stepInfo.duration || 0;
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

  // 색상 정의 - S1, S2, S3, S4는 각각 동일한 색상 사용
  const colors = {
    S1: '#8884d8',
    S2: '#82ca9d',
    S3: '#ffc658',
    S4: '#ff7300'
  };

  return (
    <div style={{ width: '100%', height: '500px', margin: '20px 0' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="job_id" 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#666' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#666' }}
            label={{ value: 'Duration', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '5px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
            formatter={(value, name) => [`${value}초`, name]}
            labelFormatter={(label) => `Job ID: ${label}`}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="rect"
            wrapperStyle={{ paddingTop: '10px' }}
            payload={[
              { value: 'S1', type: 'rect', id: 'S1', color: colors.S1 },
              { value: 'S2', type: 'rect', id: 'S2', color: colors.S2 },
              { value: 'S3', type: 'rect', id: 'S3', color: colors.S3 },
              { value: 'S4', type: 'rect', id: 'S4', color: colors.S4 }
            ]}
          />
          
          {/* L1 Group - S1 (Stack) */}
          <Bar 
            dataKey="L1_S1" 
            stackId="L1" 
            name="L1 - S1" 
            fill={colors.S1}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L1 Group - S2 (Stack) */}
          <Bar 
            dataKey="L1_S2" 
            stackId="L1" 
            name="L1 - S2" 
            fill={colors.S2}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L1 Group - S3 (Stack) */}
          <Bar 
            dataKey="L1_S3" 
            stackId="L1" 
            name="L1 - S3" 
            fill={colors.S3}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L1 Group - S4 (Stack) */}
          <Bar 
            dataKey="L1_S4" 
            stackId="L1" 
            name="L1 - S4" 
            fill={colors.S4}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L2 Group - S1 (Stack) */}
          <Bar 
            dataKey="L2_S1" 
            stackId="L2" 
            name="L2 - S1" 
            fill={colors.S1}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L2 Group - S2 (Stack) */}
          <Bar 
            dataKey="L2_S2" 
            stackId="L2" 
            name="L2 - S2" 
            fill={colors.S2}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L2 Group - S3 (Stack) */}
          <Bar 
            dataKey="L2_S3" 
            stackId="L2" 
            name="L2 - S3" 
            fill={colors.S3}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L2 Group - S4 (Stack) */}
          <Bar 
            dataKey="L2_S4" 
            stackId="L2" 
            name="L2 - S4" 
            fill={colors.S4}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L3 Group - S1 (Stack) */}
          <Bar 
            dataKey="L3_S1" 
            stackId="L3" 
            name="L3 - S1" 
            fill={colors.S1}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L3 Group - S2 (Stack) */}
          <Bar 
            dataKey="L3_S2" 
            stackId="L3" 
            name="L3 - S2" 
            fill={colors.S2}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L3 Group - S3 (Stack) */}
          <Bar 
            dataKey="L3_S3" 
            stackId="L3" 
            name="L3 - S3" 
            fill={colors.S3}
            radius={[0, 0, 0, 0]}
          />
          
          {/* L3 Group - S4 (Stack) */}
          <Bar 
            dataKey="L3_S4" 
            stackId="L3" 
            name="L3 - S4" 
            fill={colors.S4}
            radius={[0, 0, 0, 0]}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
    </div>
  );
};

export default RechartsStackedGroupedColumnChart;
