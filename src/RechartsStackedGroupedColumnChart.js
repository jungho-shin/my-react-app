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

  // 색상 정의
  const colors = {
    John: '#8884d8',
    Joe: '#82ca9d',
    Jane: '#ffc658',
    Janet: '#ff7300'
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
            dataKey="month" 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#666' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#666' }}
            label={{ value: 'Total fruit consumption', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '5px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
            formatter={(value, name) => [value, name]}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="rect"
            wrapperStyle={{ paddingTop: '10px' }}
          />
          
          {/* Male Group - John */}
          <Bar 
            dataKey="John" 
            stackId="male" 
            name="John" 
            fill={colors.John}
            radius={[0, 0, 0, 0]}
          />
          
          {/* Male Group - Joe */}
          <Bar 
            dataKey="Joe" 
            stackId="male" 
            name="Joe" 
            fill={colors.Joe}
            radius={[0, 0, 0, 0]}
          />
          
          {/* Female Group - Jane */}
          <Bar 
            dataKey="Jane" 
            stackId="female" 
            name="Jane" 
            fill={colors.Jane}
            radius={[0, 0, 0, 0]}
          />
          
          {/* Female Group - Janet */}
          <Bar 
            dataKey="Janet" 
            stackId="female" 
            name="Janet" 
            fill={colors.Janet}
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
          <li>John과 Joe는 남성 그룹(male)으로 스택됩니다</li>
          <li>Jane과 Janet은 여성 그룹(female)으로 스택됩니다</li>
          <li>각 그룹은 서로 다른 컬럼으로 표시되어 그룹화됩니다</li>
          <li>마우스를 올리면 툴팁으로 상세 정보를 확인할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
};

export default RechartsStackedGroupedColumnChart;
