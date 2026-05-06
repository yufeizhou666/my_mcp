export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  source?: string;
  raw: string;
}

export interface LogQueryOptions {
  keywords?: string[];
  regex?: string;
  level?: LogLevel;
  startTime?: string;
  endTime?: string;
  limit?: number;
  logPath?: string;
}

export interface CountResult {
  ERROR: number;
  WARN: number;
  INFO: number;
  DEBUG: number;
  total: number;
}

export interface CpuMetrics {
  usage: number;
  cores: number;
}

export interface MemoryMetrics {
  total: number;
  used: number;
  percent: number;
}

export interface DiskMetrics {
  total: number;
  used: number;
  percent: number;
}

export interface SystemMetrics {
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics;
}

export interface ToolInput {
  [key: string]: unknown;
}