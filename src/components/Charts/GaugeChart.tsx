import React from 'react';
import BaseChart from './BaseChart';
import type { EChartsOption } from 'echarts';

interface GaugeChartProps {
  title?: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  height?: string | number;
  colors?: string[];
  loading?: boolean;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  title,
  value,
  min = 0,
  max = 100,
  unit = '%',
  height = 300,
  colors = ['#ff4d4f', '#faad14', '#52c41a'],
  loading = false,
}) => {
  const option: EChartsOption = {
    title: {
      text: title,
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16,
        fontWeight: 500,
        color: '#1f2937',
      },
    },
    series: [
      {
        name: title || '指标',
        type: 'gauge',
        center: ['50%', '60%'],
        radius: '90%',
        min,
        max,
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            width: 8,
            color: [
              [0.3, colors[0]],
              [0.7, colors[1]],
              [1, colors[2]],
            ],
          },
        },
        pointer: {
          itemStyle: {
            color: 'inherit',
          },
        },
        axisTick: {
          distance: -30,
          length: 8,
          lineStyle: {
            color: '#fff',
            width: 2,
          },
        },
        splitLine: {
          distance: -30,
          length: 30,
          lineStyle: {
            color: '#fff',
            width: 4,
          },
        },
        axisLabel: {
          color: 'inherit',
          distance: 40,
          fontSize: 12,
        },
        detail: {
          valueAnimation: true,
          formatter: `{value}${unit}`,
          color: 'inherit',
          fontSize: 20,
          fontWeight: 'bold',
          offsetCenter: [0, '40%'],
        },
        data: [
          {
            value,
            name: title || '当前值',
          },
        ],
      },
    ],
  };

  return <BaseChart option={option} height={height} loading={loading} />;
};

export default GaugeChart;