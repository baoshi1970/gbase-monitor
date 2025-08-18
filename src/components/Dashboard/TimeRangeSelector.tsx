import React, { useState, useCallback } from 'react';
import {
  Select,
  DatePicker,
  Space,
  Button,
  Tooltip,
  Tag,
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface TimeRange {
  startDate: string;
  endDate: string;
  granularity: 'hour' | 'day' | 'week' | 'month';
}

interface TimeRangeSelectorProps {
  value?: TimeRange;
  onChange?: (range: TimeRange) => void;
  autoRefresh?: boolean;
  onAutoRefreshChange?: (enabled: boolean) => void;
  refreshInterval?: number;
  onRefreshIntervalChange?: (interval: number) => void;
  onRefreshNow?: () => void;
  className?: string;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  value,
  onChange,
  autoRefresh = false,
  onAutoRefreshChange,
  refreshInterval = 30,
  onRefreshIntervalChange,
  onRefreshNow,
  className = '',
}) => {
  const [customMode, setCustomMode] = useState(false);

  // 预设时间范围
  const presets = [
    {
      label: '最近1小时',
      value: 'last_hour',
      range: () => ({
        startDate: dayjs().subtract(1, 'hour').toISOString(),
        endDate: dayjs().toISOString(),
        granularity: 'hour' as const,
      }),
    },
    {
      label: '最近24小时',
      value: 'last_24h',
      range: () => ({
        startDate: dayjs().subtract(24, 'hour').toISOString(),
        endDate: dayjs().toISOString(),
        granularity: 'hour' as const,
      }),
    },
    {
      label: '最近7天',
      value: 'last_7d',
      range: () => ({
        startDate: dayjs().subtract(7, 'day').toISOString(),
        endDate: dayjs().toISOString(),
        granularity: 'day' as const,
      }),
    },
    {
      label: '最近30天',
      value: 'last_30d',
      range: () => ({
        startDate: dayjs().subtract(30, 'day').toISOString(),
        endDate: dayjs().toISOString(),
        granularity: 'day' as const,
      }),
    },
    {
      label: '自定义',
      value: 'custom',
      range: null,
    },
  ];

  const refreshIntervals = [
    { label: '10秒', value: 10 },
    { label: '30秒', value: 30 },
    { label: '1分钟', value: 60 },
    { label: '5分钟', value: 300 },
    { label: '15分钟', value: 900 },
  ];

  const handlePresetChange = useCallback((presetValue: string) => {
    if (presetValue === 'custom') {
      setCustomMode(true);
      return;
    }

    const preset = presets.find(p => p.value === presetValue);
    if (preset?.range && onChange) {
      onChange(preset.range());
    }
    setCustomMode(false);
  }, [onChange, presets]);

  const handleCustomRangeChange = useCallback((dates: [Dayjs, Dayjs] | null, granularity: 'hour' | 'day' | 'week' | 'month') => {
    if (dates && onChange) {
      const [start, end] = dates;
      onChange({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        granularity,
      });
    }
  }, [onChange]);

  const getCurrentPreset = () => {
    if (customMode || !value) return 'custom';
    
    for (const preset of presets) {
      if (preset.range) {
        const range = preset.range();
        if (
          Math.abs(dayjs(value.startDate).diff(dayjs(range.startDate), 'minute')) < 5 &&
          Math.abs(dayjs(value.endDate).diff(dayjs(range.endDate), 'minute')) < 5
        ) {
          return preset.value;
        }
      }
    }
    return 'custom';
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* 时间范围选择 */}
      <div className="flex items-center space-x-2">
        <CalendarOutlined className="text-gray-500" />
        <Select
          value={getCurrentPreset()}
          onChange={handlePresetChange}
          style={{ width: 120 }}
          size="small"
        >
          {presets.map(preset => (
            <Option key={preset.value} value={preset.value}>
              {preset.label}
            </Option>
          ))}
        </Select>
      </div>

      {/* 自定义时间范围 */}
      {(customMode || getCurrentPreset() === 'custom') && (
        <div className="flex items-center space-x-2">
          <RangePicker
            size="small"
            showTime={{ format: 'HH:mm' }}
            format="MM-DD HH:mm"
            value={value ? [dayjs(value.startDate), dayjs(value.endDate)] : null}
            onChange={(dates) => handleCustomRangeChange(dates as [Dayjs, Dayjs], 'hour')}
            style={{ width: 300 }}
          />
          <Select
            value={value?.granularity || 'day'}
            onChange={(granularity) => {
              if (value && onChange) {
                onChange({ ...value, granularity });
              }
            }}
            size="small"
            style={{ width: 80 }}
          >
            <Option value="hour">小时</Option>
            <Option value="day">天</Option>
            <Option value="week">周</Option>
            <Option value="month">月</Option>
          </Select>
        </div>
      )}

      {/* 自动刷新控制 */}
      <div className="flex items-center space-x-2">
        <ClockCircleOutlined className="text-gray-500" />
        <Button
          size="small"
          type={autoRefresh ? 'primary' : 'default'}
          onClick={() => onAutoRefreshChange?.(!autoRefresh)}
          icon={<SyncOutlined spin={autoRefresh} />}
        >
          自动刷新
        </Button>
        
        {autoRefresh && (
          <Select
            value={refreshInterval}
            onChange={onRefreshIntervalChange}
            size="small"
            style={{ width: 80 }}
          >
            {refreshIntervals.map(interval => (
              <Option key={interval.value} value={interval.value}>
                {interval.label}
              </Option>
            ))}
          </Select>
        )}
      </div>

      {/* 立即刷新 */}
      <Tooltip title="立即刷新">
        <Button
          size="small"
          icon={<SyncOutlined />}
          onClick={onRefreshNow}
        >
          刷新
        </Button>
      </Tooltip>

      {/* 当前状态显示 */}
      {value && (
        <div className="flex items-center space-x-1">
          <Tag color="blue" className="text-xs">
            {dayjs(value.startDate).format('MM-DD HH:mm')} - {dayjs(value.endDate).format('MM-DD HH:mm')}
          </Tag>
          {autoRefresh && (
            <Tag color="green" className="text-xs">
              自动刷新 {refreshInterval}s
            </Tag>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeRangeSelector;