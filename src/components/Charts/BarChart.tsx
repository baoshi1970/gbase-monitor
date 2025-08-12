import React from 'react';
import BaseChart from './BaseChart';
import type { EChartsOption } from 'echarts';

interface BarChartProps {
  title?: string;
  data: {
    categories: string[];
    series: {
      name: string;
      data: number[];
      color?: string;
    }[];
  };
  height?: string | number;
  horizontal?: boolean;
  yAxisFormatter?: (value: number) => string;
  loading?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({
  title,
  data,
  height = 300,
  horizontal = false,
  yAxisFormatter = (value: number) => `${value}`,
  loading = false,
}) => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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
        type: 'shadow',
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
      data: data.series.map(item => item.name),
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
      type: horizontal ? 'value' : 'category',
      data: horizontal ? undefined : data.categories,
      axisLabel: {
        color: '#6b7280',
        formatter: horizontal ? yAxisFormatter : undefined,
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
    },
    yAxis: {
      type: horizontal ? 'category' : 'value',
      data: horizontal ? data.categories : undefined,
      axisLabel: {
        color: '#6b7280',
        formatter: horizontal ? undefined : yAxisFormatter,
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
    series: data.series.map((item, index) => ({
      name: item.name,
      type: 'bar',
      data: item.data,
      itemStyle: {
        color: item.color || colors[index % colors.length],
        borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
        },
      },
    })),
  };

  return <BaseChart option={option} height={height} loading={loading} />;
};

export default BarChart;