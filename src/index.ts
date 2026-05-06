import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import { searchLogs } from './tools/search_logs.js';
import { countByLevel } from './tools/count_by_level.js';
import { queryByTimerange } from './tools/query_by_timerange.js';
import { getMetrics } from './tools/get_system_metrics.js';
import { explainError } from './tools/explain_error.js';

const TOOLS = [
  {
    name: 'search_logs',
    description: 'Search log files by keywords or regex patterns. Returns matching log entries with timestamps.',
    inputSchema: {
      type: 'object',
      properties: {
        keywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'Keywords to search for in log files'
        },
        regex: {
          type: 'string',
          description: 'Regular expression pattern to match'
        },
        logPath: {
          type: 'string',
          default: '/var/log',
          description: 'Path to log file or directory'
        },
        limit: {
          type: 'number',
          default: 100,
          description: 'Maximum number of results'
        }
      }
    }
  },
  {
    name: 'count_by_level',
    description: 'Count log entries by severity level (ERROR, WARN, INFO, DEBUG)',
    inputSchema: {
      type: 'object',
      properties: {
        logPath: {
          type: 'string',
          default: '/var/log',
          description: 'Path to log file or directory'
        },
        startTime: {
          type: 'string',
          description: 'Start time in ISO8601 format'
        },
        endTime: {
          type: 'string',
          description: 'End time in ISO8601 format'
        }
      }
    }
  },
  {
    name: 'query_by_timerange',
    description: 'Query logs within a specific time range',
    inputSchema: {
      type: 'object',
      properties: {
        startTime: {
          type: 'string',
          description: 'Start time in ISO8601 format'
        },
        endTime: {
          type: 'string',
          description: 'End time in ISO8601 format'
        },
        logPath: {
          type: 'string',
          default: '/var/log',
          description: 'Path to log file or directory'
        },
        level: {
          type: 'string',
          enum: ['ERROR', 'WARN', 'INFO', 'DEBUG'],
          description: 'Filter by log level'
        },
        limit: {
          type: 'number',
          default: 100,
          description: 'Maximum number of results'
        }
      },
      required: ['startTime', 'endTime']
    }
  },
  {
    name: 'get_system_metrics',
    description: 'Get CPU, memory, and disk metrics from the system',
    inputSchema: {
      type: 'object',
      properties: {
        metrics: {
          type: 'array',
          items: { type: 'string' },
          default: ['cpu', 'memory', 'disk'],
          description: 'Which metrics to retrieve: cpu, memory, disk'
        }
      }
    }
  },
  {
    name: 'explain_error',
    description: 'AI-assisted error analysis. Formats error content for AI analysis.',
    inputSchema: {
      type: 'object',
      properties: {
        errorContent: {
          type: 'string',
          description: 'The error log or stack trace to analyze'
        },
        contextLines: {
          type: 'number',
          default: 10,
          description: 'Number of context lines around the error'
        }
      },
      required: ['errorContent']
    }
  }
];

const server = new Server(
  { name: 'log-analyzer-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_logs':
        return await searchLogs(args || {});
      case 'count_by_level':
        return await countByLevel(args || {});
      case 'query_by_timerange':
        return await queryByTimerange(args || {});
      case 'get_system_metrics':
        return await getMetrics(args || {});
      case 'explain_error':
        return await explainError(args || {});
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }]
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Log Analyzer MCP Server running on stdio');