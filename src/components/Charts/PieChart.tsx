import React from 'react';
import BaseChart from './BaseChart';
import type { EChartsOption } from 'echarts';

interface PieChartProps {
  title?: string;
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  height?: string | number;
  showLegend?: boolean;
  center?: [string | number, string | number];
  radius?: [string | number, string | number];
  loading?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({
  title,
  data,
  height = 300,
  showLegend = true,
  center = ['50%', '50%'],
  radius = ['40%', '70%'],
  loading = false,
}) => {
  const colors = [
    '#3b82f6',
    '#10b981', 
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
    '#84cc16',
    '#f97316',
  ];

  const processedData = data.map((item, index) => ({
    ...item,
    itemStyle: {
      color: item.color || colors[index % colors.length],
    },
  }));

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
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: showLegend
      ? {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: data.map(item => item.name),
        }
      : undefined,
    series: [
      {
        name: title || '数据分布',
        type: 'pie',
        radius,
        center,
        data: processedData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          show: true,
          formatter: '{b}: {d}%',
          fontSize: 12,
          color: '#6b7280',
        },
      },
    ],
  };

  return <BaseChart option={option} height={height} loading={loading} />;
};

export default PieChart;