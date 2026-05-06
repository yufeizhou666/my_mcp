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
async function queryFile(filePath, startTime, endTime, level, limit) {
    const results = [];
    const stream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: stream });
    for await (const line of rl) {
        const entry = parseLogLine(line);
        if (!entry)
            continue;
        if (!isWithinTimeRange(entry, startTime, endTime))
            continue;
        if (level && entry.level !== level)
            continue;
        results.push(`[${entry.timestamp.toISOString()}] [${entry.level}] ${entry.message}`);
        if (limit && results.length >= limit)
            break;
    }
    return results;
}
export async function queryByTimerange(input) {
    const { startTime, endTime, logPath = '/var/log', level, limit = 100 } = input;
    if (!startTime || !endTime) {
        return { content: [{ type: 'text', text: 'Error: startTime and endTime are required' }] };
    }
    const files = findLogFiles(logPath);
    if (files.length === 0) {
        return { content: [{ type: 'text', text: `No .log files found in ${logPath}` }] };
    }
    const allResults = [];
    for (const file of files) {
        const results = await queryFile(file, startTime, endTime, level, limit - allResults.length);
        allResults.push(...results);
        if (allResults.length >= limit)
            break;
    }
    return {
        content: [{
                type: 'text',
                text: allResults.length > 0
                    ? allResults.join('\n')
                    : `No logs found between ${startTime} and ${endTime}`
            }]
    };
}
