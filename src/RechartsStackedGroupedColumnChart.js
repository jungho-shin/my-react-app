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

const RechartsStackedGroupedColumnChart = ({ data }) => {
  // API 데이터가 있으면 사용, 없으면 기본 데이터 사용
  const chartData = data || [
    { job: 'Job1', L1_S1: 2, L1_S2: 3, L1_S3: 1, L1_S4: 1, L2_S1: 1, L2_S2: 2, L2_S3: 1, L2_S4: 1, L3_S1: 1, L3_S2: 1, L3_S3: 1, L3_S4: 1 },
    { job: 'Job2', L1_S1: 3, L1_S2: 2, L1_S3: 2, L1_S4: 1, L2_S1: 2, L2_S2: 1, L2_S3: 2, L2_S4: 1, L3_S1: 1, L3_S2: 1, L3_S3: 1, L3_S4: 0 },
    { job: 'Job3', L1_S1: 1, L1_S2: 4, L1_S3: 2, L1_S4: 2, L2_S1: 1, L2_S2: 1, L2_S3: 1, L2_S4: 1, L3_S1: 2, L3_S2: 1, L3_S3: 1, L3_S4: 1 },
    { job: 'Job4', L1_S1: 2, L1_S2: 2, L1_S3: 3, L1_S4: 1, L2_S1: 2, L2_S2: 1, L2_S3: 1, L2_S4: 1, L3_S1: 1, L3_S2: 1, L3_S3: 1, L3_S4: 1 },
    { job: 'Job5', L1_S1: 3, L1_S2: 3, L1_S3: 1, L1_S4: 2, L2_S1: 2, L2_S2: 2, L2_S3: 1, L2_S4: 1, L3_S1: 1, L3_S2: 1, L3_S3: 1, L3_S4: 0 }
  ];

  // 색상 정의 - S1, S2, S3, S4는 각각 동일한 색상 사용
  const colors = {
    S1: '#8884d8',
    S2: '#82ca9d',
    S3: '#ffc658',
    S4: '#ff7300'
  };

  return (
    <div style={{ width: '100%', height: '500px', margin: '20px 0' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
        Recharts Stacked and Grouped Column Chart
      </h3>
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
            dataKey="job" 
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
            labelFormatter={(label) => `Job: ${label}`}
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
      
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        fontSize: '14px',
        color: '#666'
      }}>
        <strong>차트 설명:</strong>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>X축: Job (작업)</li>
          <li>Y축: Duration (처리 시간, 초)</li>
          <li>L1, L2, L3는 각 Job마다 그룹으로 표시됩니다</li>
          <li>L1, L2, L3 모두 S1, S2, S3, S4를 스택으로 누적하여 표시됩니다</li>
          <li>마우스를 올리면 툴팁으로 상세 정보를 확인할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
};

export default RechartsStackedGroupedColumnChart;
