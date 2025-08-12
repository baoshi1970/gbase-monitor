import React from 'react';
import { DatePicker, Select, Space, Typography } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

export interface TimeRangeValue {
  startDate: string;
  endDate: string;
  preset?: string;
}

interface TimeRangeSelectorProps {
  value?: TimeRangeValue;
  onChange?: (value: TimeRangeValue) => void;
  showPresets?: boolean;
  className?: string;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  value,
  onChange,
  showPresets = true,
  className = '',
}) => {

  // 预设时间范围
  const presets = [
    { label: '今天', value: 'today', days: 0 },
    { label: '昨天', value: 'yesterday', days: 1 },
    { label: '最近3天', value: 'last3days', days: 3 },
    { label: '最近7天', value: 'last7days', days: 7 },
    { label: '最近14天', value: 'last14days', days: 14 },
    { label: '最近30天', value: 'last30days', days: 30 },
    { label: '本月', value: 'thisMonth', days: -1 },
    { label: '上月', value: 'lastMonth', days: -2 },
  ];

  // 获取预设时间范围
  const getPresetRange = (preset: string): [Dayjs, Dayjs] => {
    const now = dayjs();
    
    switch (preset) {
      case 'today':
        return [now.startOf('day'), now.endOf('day')];
      case 'yesterday':
        const yesterday = now.subtract(1, 'day');
        return [yesterday.startOf('day'), yesterday.endOf('day')];
      case 'last3days':
      case 'last7days':
      case 'last14days':
      case 'last30days':
        const days = parseInt(preset.replace(/[^0-9]/g, ''));
        return [now.subtract(days, 'day').startOf('day'), now.endOf('day')];
      case 'thisMonth':
        return [now.startOf('month'), now.endOf('month')];
      case 'lastMonth':
        const lastMonth = now.subtract(1, 'month');
        return [lastMonth.startOf('month'), lastMonth.endOf('month')];
      default:
        return [now.subtract(7, 'day').startOf('day'), now.endOf('day')];
    }
  };

  // 处理预设选择
  const handlePresetChange = (preset: string) => {
    const [start, end] = getPresetRange(preset);
    const newValue: TimeRangeValue = {
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD'),
      preset,
    };
    onChange?.(newValue);
  };

  // 处理日期范围选择
  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      const newValue: TimeRangeValue = {
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
        preset: undefined, // 清除预设
      };
      onChange?.(newValue);
    }
  };

  // 获取当前日期范围值
  const getCurrentDateRange = (): [Dayjs, Dayjs] | undefined => {
    if (!value) return undefined;
    
    if (value.preset) {
      return getPresetRange(value.preset);
    }
    
    if (value.startDate && value.endDate) {
      return [dayjs(value.startDate), dayjs(value.endDate)];
    }
    
    return undefined;
  };

  const dateRange = getCurrentDateRange();

  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      {showPresets && (
        <Space align="center">
          <Text className="text-gray-600 font-medium">
            <CalendarOutlined className="mr-1" />
            时间范围:
          </Text>
          <Select
            value={value?.preset || 'custom'}
            onChange={handlePresetChange}
            style={{ width: 120 }}
            options={[
              ...presets.map(preset => ({
                label: preset.label,
                value: preset.value,
              })),
              { label: '自定义', value: 'custom' },
            ]}
          />
        </Space>
      )}
      
      <Space align="center">
        <RangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          format="YYYY-MM-DD"
          allowClear={false}
          className="border-gray-300 hover:border-blue-400 focus:border-blue-500"
          placeholder={['开始日期', '结束日期']}
          disabledDate={(current) => current && current > dayjs().endOf('day')}
        />
      </Space>
    </div>
  );
};

export default TimeRangeSelector;