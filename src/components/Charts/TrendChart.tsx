import React from 'react';
import BaseChart from './BaseChart';
import type { EChartsOption } from 'echarts';

interface TrendChartProps {
  title?: string;
  data: {
    dates: string[];
    values: number[];
    name: string;
    color?: string;
  }[];
  height?: string | number;
  yAxisFormatter?: (value: number) => string;
  loading?: boolean;
}

const TrendChart: React.FC<TrendChartProps> = ({
  title,
  data,
  height = 300,
  yAxisFormatter = (value: number) => `${value}%`,
  loading = false,
}) => {
  const option: EChartsOption = {
    title: {
      text: title,
      left: 'left',
      textStyle: {
        fontSize: 16,
        fontWeight: 500,
        color: '#1f2937',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
      formatter: function (params: any) {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach((item: any) => {
          result += `${item.marker}${item.seriesName}: ${yAxisFormatter(item.value)}<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: data.map(item => item.name),
      top: 30,
      right: 'right',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data[0]?.dates || [],
      axisLabel: {
        color: '#6b7280',
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: yAxisFormatter,
        color: '#6b7280',
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
        },
      },
    },
    series: data.map((item, index) => ({
      name: item.name,
      type: 'line',
      data: item.values,
      smooth: true,
      lineStyle: {
        width: 3,
        color: item.color || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4],
      },
      itemStyle: {
        color: item.color || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4],
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: item.color || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4] + '20',
            },
            {
              offset: 1,
              color: item.color || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4] + '02',
            },
          ],
        },
      },
    })),
  };

  return <BaseChart option={option} height={height} loading={loading} />;
};

export default TrendChart;