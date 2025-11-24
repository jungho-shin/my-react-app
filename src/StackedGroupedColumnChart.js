import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const StackedGroupedColumnChart = ({ data }) => {
  // API 데이터가 있으면 사용, 없으면 기본 데이터 사용
  const series = data?.series || [
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
  ];

  const categories = data?.categories || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const options = {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Stacked and Grouped Column Chart',
      style: {
        fontSize: '18px',
        fontWeight: 'bold'
      }
    },
    subtitle: {
      text: 'Highcharts React 샘플 - 스택 및 그룹 컬럼 차트'
    },
    xAxis: {
      categories: categories
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Total fruit consumption'
      },
      stackLabels: {
        enabled: true,
        style: {
          fontWeight: 'bold',
          color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
        }
      }
    },
    legend: {
      align: 'right',
      x: -30,
      verticalAlign: 'top',
      y: 25,
      floating: true,
      backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
      borderColor: '#CCC',
      borderWidth: 1,
      shadow: false
    },
    tooltip: {
      headerFormat: '<b>{point.x}</b><br/>',
      pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: true
        }
      }
    },
    series: series,
    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          legend: {
            align: 'center',
            verticalAlign: 'bottom',
            layout: 'horizontal'
          },
          yAxis: {
            stackLabels: {
              style: {
                fontSize: '10px'
              }
            }
          }
        }
      }]
    }
  };

  return (
    <div style={{ width: '100%', height: '500px', margin: '20px 0' }}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
};

export default StackedGroupedColumnChart;
