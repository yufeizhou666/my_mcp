# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

log-analyzer-mcp is an MCP (Model Context Protocol) server that provides log analysis and system metrics tools. It connects to Claude Code via stdio transport and exposes tools for searching, counting, and analyzing log files.

## Commands

```bash
npm run build   # Compile TypeScript to dist/
npm start       # Run the compiled MCP server
npm run dev     # Run with tsx watch mode for development
```

## Architecture

```
src/
├── index.ts           # MCP Server entry point - initializes Server, registers tools, connects stdio transport
├── tools/             # Individual MCP tool implementations (search_logs, count_by_level, etc.)
├── utils/             # Shared utilities: log_parser.ts (timestamp/level parsing), metrics.ts (CPU/memory/disk)
└── types/             # TypeScript type definitions
```

The server uses `@modelcontextprotocol/sdk` Server class with StdioServerTransport. Tools are registered via `CallToolRequestSchema` handler in index.ts.

## MCP Server Integration

This project is configured as a local MCP server. When working in this directory, Claude Code will automatically have access to these tools:
- `search_logs` - Search log files by keywords or regex
- `count_by_level` - Count logs by severity level (ERROR/WARN/INFO/DEBUG)
- `query_by_timerange` - Filter logs by time range
- `get_system_metrics` - Get CPU, memory, disk usage
- `explain_error` - Format error content for AI analysis