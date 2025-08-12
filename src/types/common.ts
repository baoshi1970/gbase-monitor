// 通用类型定义（非API相关）

export interface AppConfig {
  version: string;
  apiUrl: string;
  debug: boolean;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error;
}

export interface Theme {
  mode: 'light' | 'dark';
  primaryColor: string;
}
