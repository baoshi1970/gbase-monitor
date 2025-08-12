import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface BaseChartProps {
  option: EChartsOption;
  height?: string | number;
  width?: string | number;
  className?: string;
  loading?: boolean;
}

const BaseChart: React.FC<BaseChartProps> = ({
  option,
  height = 400,
  width = '100%',
  className = '',
  loading = false,
}) => {
  return (
    <ReactECharts
      option={option}
      style={{ height, width }}
      className={className}
      showLoading={loading}
      opts={{ renderer: 'canvas' }}
    />
  );
};

export default BaseChart;