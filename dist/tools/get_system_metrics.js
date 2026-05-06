import { getSystemMetrics } from '../utils/metrics.js';
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
export async function getMetrics(input) {
    const { metrics = ['cpu', 'memory', 'disk'] } = input;
    const data = await getSystemMetrics();
    const lines = ['System Metrics:\n'];
    if (metrics.includes('cpu')) {
        lines.push(`  CPU: ${data.cpu.usage}% (${data.cpu.cores} cores)`);
    }
    if (metrics.includes('memory')) {
        const usedStr = formatBytes(data.memory.used);
        const totalStr = formatBytes(data.memory.total);
        lines.push(`  Memory: ${usedStr} / ${totalStr} (${data.memory.percent}%)`);
    }
    if (metrics.includes('disk')) {
        const usedStr = formatBytes(data.disk.used);
        const totalStr = formatBytes(data.disk.total);
        lines.push(`  Disk: ${usedStr} / ${totalStr} (${data.disk.percent}%)`);
    }
    return { content: [{ type: 'text', text: lines.join('\n') }] };
}
