# log-analyzer-mcp

An MCP (Model Context Protocol) server that provides log analysis and system metrics tools. Connects to Claude Code via stdio transport and exposes 5 tools for searching, counting, and analyzing local log files.

## Features

| Tool | Description |
|------|-------------|
| `search_logs` | Search log files by keywords or regex patterns |
| `count_by_level` | Count log entries by severity level (ERROR/WARN/INFO/DEBUG) |
| `query_by_timerange` | Filter logs within a specific time range |
| `get_system_metrics` | Get CPU, memory, and disk usage metrics |
| `explain_error` | Format error content for AI-assisted analysis |

## Quick Start

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run the server
npm start
```

## Development

```bash
# Run with hot reload
npm run dev
```

## Integration with Claude Code

Add the server to Claude Code:

```bash
# Project-level (only available in this directory)
claude mcp add log-analyzer -- node /path/to/log-analyzer-mcp/dist/index.js

# User-level (available globally)
claude mcp add log-analyzer --scope user -- node /path/to/log-analyzer-mcp/dist/index.js
```

Verify the connection:

```bash
claude mcp list
```

## Tool Details

### search_logs

Search log files by keywords or regex. Supports searching a single `.log` file or an entire directory.

```json
{
  "keywords": ["ERROR", "timeout"],
  "regex": "connection.*failed",
  "logPath": "/var/log",
  "limit": 100
}
```

### count_by_level

Count log entries by severity level, optionally filtered by time range.

```json
{
  "logPath": "/var/log",
  "startTime": "2026-04-29T00:00:00Z",
  "endTime": "2026-04-30T00:00:00Z"
}
```

### query_by_timerange

Filter logs within a specific time range, with optional level filter.

```json
{
  "startTime": "2026-04-29T00:00:00Z",
  "endTime": "2026-04-30T00:00:00Z",
  "logPath": "/var/log",
  "level": "ERROR",
  "limit": 100
}
```

### get_system_metrics

Get CPU, memory, and disk metrics. Supports Windows and Linux.

```json
{
  "metrics": ["cpu", "memory", "disk"]
}
```

### explain_error

Format error content for AI-assisted root cause analysis.

```json
{
  "errorContent": "java.lang.NullPointerException\n  at com.example.Service.process(Service.java:42)",
  "contextLines": 10
}
```

## Architecture

```
src/
├── index.ts           # MCP Server entry point
├── tools/             # Individual MCP tool implementations
├── utils/
│   ├── log_parser.ts  # Timestamp/level parsing, keyword/regex matching
│   └── metrics.ts     # Cross-platform CPU/memory/disk metrics
└── types/             # TypeScript type definitions
```

The server uses `@modelcontextprotocol/sdk` with `StdioServerTransport`. Tools are registered via `CallToolRequestSchema` handler.

### Key Design Decisions

- **Stream processing**: Uses `readline + createReadStream` to handle large log files without loading them entirely into memory
- **Cross-platform**: Windows (WMIC) and Linux (top/free/df) dual-path implementation with runtime platform detection
- **Tolerant parsing**: Non-standard log formats are preserved rather than dropped (missing levels default to INFO, missing timestamps default to current time)

## License

MIT
