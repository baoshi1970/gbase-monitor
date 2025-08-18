import React from 'react';
import { Typography } from 'antd';
import BaseChart from '../../../components/Charts/BaseChart';
import type { 
  SystemHealthResponse, 
  ResolutionRateResponse, 
  NegativeFeedbackResponse, 
  EscalationRateResponse, 
  QualityScoreResponse 
} from '../../../types/api';

const { Text } = Typography;

interface SystemHealthChartProps {
  systemHealth: SystemHealthResponse | null;
  qualityMetrics: {
    resolutionRate: ResolutionRateResponse | null;
    negativeFeedback: NegativeFeedbackResponse | null;
    escalationRate: EscalationRateResponse | null;
    qualityScore: QualityScoreResponse | null;
  };
}

const SystemHealthChart: React.FC<SystemHealthChartProps> = ({ 
  systemHealth, 
  qualityMetrics 
}) => {
  if (!systemHealth || !qualityMetrics.resolutionRate || !qualityMetrics.qualityScore) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '300px' 
      }}>
        <Text type="secondary">暂无趋势数据</Text>
      </div>
    );
  }

  // 生成最近30天的模拟数据
  const generateHealthTrendData = () => {
    const dates: string[] = [];
    const uptimeData: number[] = [];
    const responseTimeData: number[] = [];
    const qualityData: number[] = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }));
      
      // 模拟数据波动
      uptimeData.push(Number((systemHealth.uptime + (Math.random() - 0.5) * 2).toFixed(2)));
      responseTimeData.push(systemHealth.responseTime.avg + Math.round((Math.random() - 0.5) * 100));
      qualityData.push(Number(((qualityMetrics.qualityScore?.overall || 90) + (Math.random() - 0.5) * 6).toFixed(1)));
    }

    return { dates, uptimeData, responseTimeData, qualityData };
  };

  const { dates, uptimeData, responseTimeData, qualityData } = generateHealthTrendData();

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e8e8e8',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 12,
      },
      formatter: (params: any) => {
        let content = `<div style="font-weight: 600; margin-bottom: 8px;">${params[0].axisValueLabel}</div>`;
        params.forEach((param: any, index: number) => {
          const unit = index === 0 ? '%' : index === 1 ? 'ms' : '';
          content += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 4px 0;">
              <span style="display: flex; align-items: center;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${param.color}; margin-right: 6px;"></span>
                ${param.seriesName}
              </span>
              <span style="font-weight: 600; margin-left: 12px;">${param.value}${unit}</span>
            </div>
          `;
        });
        return content;
      },
    },
    legend: {
      data: ['系统可用性', '响应时间', 'AI质量得分'],
      top: 10,
      textStyle: {
        fontSize: 12,
        color: '#666',
      },
    },
    grid: {
      left: '3%',
      right: '8%',
      bottom: '8%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        color: '#8c8c8c',
        fontSize: 11,
        interval: 2, // 每隔2个显示一个标签
      },
      axisLine: {
        lineStyle: {
          color: '#e8e8e8',
        },
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '百分比 (%)',
        position: 'left',
        axisLabel: {
          formatter: '{value}%',
          color: '#8c8c8c',
          fontSize: 11,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0',
            type: 'dashed',
          },
        },
        min: 85,
        max: 100,
      },
      {
        type: 'value',
        name: '响应时间 (ms)',
        position: 'right',
        axisLabel: {
          formatter: '{value}ms',
          color: '#8c8c8c',
          fontSize: 11,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: '系统可用性',
        type: 'line',
        yAxisIndex: 0,
        data: uptimeData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        itemStyle: {
          color: '#52c41a',
        },
        lineStyle: {
          color: '#52c41a',
          width: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.05)' },
            ],
          },
        },
      },
      {
        name: '响应时间',
        type: 'line',
        yAxisIndex: 1,
        data: responseTimeData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        itemStyle: {
          color: '#1890ff',
        },
        lineStyle: {
          color: '#1890ff',
          width: 2,
        },
      },
      {
        name: 'AI质量得分',
        type: 'line',
        yAxisIndex: 0,
        data: qualityData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        itemStyle: {
          color: '#722ed1',
        },
        lineStyle: {
          color: '#722ed1',
          width: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(114, 46, 209, 0.2)' },
              { offset: 1, color: 'rgba(114, 46, 209, 0.05)' },
            ],
          },
        },
      },
    ],
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <BaseChart 
        option={option} 
        height="320px"
        loading={false}
      />
      <div style={{ 
        textAlign: 'center', 
        marginTop: 8,
        padding: '8px 16px',
        background: '#fafafa',
        borderRadius: 4,
        border: '1px solid #f0f0f0'
      }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          系统健康趋势 - 最近30天数据展示
        </Text>
      </div>
    </div>
  );
};

export default SystemHealthChart;