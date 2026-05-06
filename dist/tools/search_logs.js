import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { parseLogLine, matchesKeywords, matchesRegex } from '../utils/log_parser.js';
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
async function searchFile(filePath, keywords, regex, limit) {
    const results = [];
    const stream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: stream });
    for await (const line of rl) {
        let matched = false;
        if (regex) {
            matched = matchesRegex(line, regex);
        }
        else if (keywords && keywords.length > 0) {
            matched = matchesKeywords(line, keywords);
        }
        if (matched) {
            const entry = parseLogLine(line);
            if (entry) {
                results.push(entry);
                if (results.length >= limit)
                    break;
            }
        }
    }
    return results;
}
export async function searchLogs(input) {
    const { keywords, regex, logPath = '/var/log', limit = 100 } = input;
    if (!keywords?.length && !regex) {
        return { content: [{ type: 'text', text: 'Error: Provide keywords or regex' }] };
    }
    const files = findLogFiles(logPath);
    if (files.length === 0) {
        return { content: [{ type: 'text', text: `No .log files found in ${logPath}` }] };
    }
    const allResults = [];
    for (const file of files) {
        const results = await searchFile(file, keywords, regex, limit - allResults.length);
        allResults.push(...results);
        if (allResults.length >= limit)
            break;
    }
    const text = allResults
        .slice(0, limit)
        .map(e => `[${e.timestamp.toISOString()}] [${e.level}] ${e.message}`)
        .join('\n');
    return {
        content: [{ type: 'text', text: text || 'No matches found' }]
    };
}
