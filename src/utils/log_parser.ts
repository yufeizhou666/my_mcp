import { LogEntry, LogLevel } from '../types/index.js';

const LOG_LEVEL_PATTERN = /\[(ERROR|WARN|INFO|DEBUG)\]/i;
const TIMESTAMP_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/,
  /^\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}/,
  /^\d{2}\/\w{3}\/\d{4}:\d{2}:\d{2}:\d{2}/
];

export function parseLogLine(line: string): LogEntry | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const levelMatch = trimmed.match(LOG_LEVEL_PATTERN);
  const level: LogLevel | undefined = levelMatch
    ? (levelMatch[1].toUpperCase() as LogLevel)
    : undefined;

  let timestamp: Date | undefined;
  for (const pattern of TIMESTAMP_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      const parsed = new Date(match[0]);
      if (!isNaN(parsed.getTime())) {
        timestamp = parsed;
        break;
      }
    }
  }

  return {
    timestamp: timestamp || new Date(),
    level: level || 'INFO',
    message: trimmed,
    raw: line
  };
}

export function matchesKeywords(line: string, keywords: string[]): boolean {
  return keywords.some(kw => line.includes(kw));
}

export function matchesRegex(line: string, regex: string): boolean {
  try {
    return new RegExp(regex).test(line);
  } catch {
    return false;
  }
}

export function isWithinTimeRange(
  entry: LogEntry,
  startTime?: string,
  endTime?: string
): boolean {
  if (!startTime && !endTime) return true;

  const start = startTime ? new Date(startTime) : null;
  const end = endTime ? new Date(endTime) : null;
  const ts = entry.timestamp;

  if (start && ts < start) return false;
  if (end && ts > end) return false;
  return true;
}