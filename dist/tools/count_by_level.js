import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { parseLogLine, isWithinTimeRange } from '../utils/log_parser.js';
function findLogFiles(logPath) {
    try {
        const stats = fs.statSync(logPath);
        if (stats.isFile()) {
            return logPath.endsWith('.log') ? [logPath] : [];
        }
        if (stats.isDirectory()) {
            return fs.readdirSync(logPath)
                .filter(f => f.endsWith('.log'))
                .map(f => path.join(logPath, f));
        }
    }
    catch {
        return [];
    }
    return [];
}
async function countFile(filePath, startTime, endTime) {
    const counts = { ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0, total: 0 };
    const stream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: stream });
    for await (const line of rl) {
        const entry = parseLogLine(line);
        if (entry && isWithinTimeRange(entry, startTime, endTime)) {
            counts[entry.level]++;
            counts.total++;
        }
    }
    return counts;
}
export async function countByLevel(input) {
    const { logPath = '/var/log', startTime, endTime } = input;
    const files = findLogFiles(logPath);
    if (files.length === 0) {
        return { content: [{ type: 'text', text: `No .log files found in ${logPath}` }] };
    }
    const totalCounts = { ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0, total: 0 };
    for (const file of files) {
        const counts = await countFile(file, startTime, endTime);
        totalCounts.ERROR += counts.ERROR;
        totalCounts.WARN += counts.WARN;
        totalCounts.INFO += counts.INFO;
        totalCounts.DEBUG += counts.DEBUG;
        totalCounts.total += counts.total;
    }
    const text = `Log Level Distribution:
  ERROR: ${totalCounts.ERROR}
  WARN:  ${totalCounts.WARN}
  INFO:  ${totalCounts.INFO}
  DEBUG: ${totalCounts.DEBUG}
  ────────────
  Total: ${totalCounts.total}`;
    return { content: [{ type: 'text', text }] };
}
