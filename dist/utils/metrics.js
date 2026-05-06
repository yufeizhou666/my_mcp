import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
async function getWindowsCpuUsage() {
    try {
        const { stdout } = await execAsync('wmic cpu get loadpercentage /value', { windowsHide: true });
        const match = stdout.match(/LoadPercentage=(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
    }
    catch {
        return 0;
    }
}
async function getWindowsMemory() {
    try {
        const { stdout } = await execAsync('wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value', { windowsHide: true });
        const totalMatch = stdout.match(/TotalVisibleMemorySize=(\d+)/);
        const freeMatch = stdout.match(/FreePhysicalMemory=(\d+)/);
        if (totalMatch && freeMatch) {
            const total = parseInt(totalMatch[1], 10) * 1024;
            const free = parseInt(freeMatch[1], 10) * 1024;
            const used = total - free;
            return { total, used, percent: Math.round((used / total) * 100) };
        }
    }
    catch {
        // fallback
    }
    const total = os.totalmem();
    const free = os.freemem();
    return { total, used: total - free, percent: Math.round(((total - free) / total) * 100) };
}
async function getWindowsDisk() {
    try {
        const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption /value', { windowsHide: true });
        const matches = stdout.match(/FreeSpace=(\d+).*Size=(\d+)/g);
        if (matches && matches.length > 0) {
            let total = 0;
            let free = 0;
            matches.forEach(m => {
                const fm = m.match(/FreeSpace=(\d+)/);
                const sm = m.match(/Size=(\d+)/);
                if (fm && sm) {
                    free += parseInt(fm[1], 10);
                    total += parseInt(sm[1], 10);
                }
            });
            const used = total - free;
            return { total, used, percent: total > 0 ? Math.round((used / total) * 100) : 0 };
        }
    }
    catch {
        // fallback
    }
    return { total: 0, used: 0, percent: 0 };
}
async function getLinuxCpuUsage() {
    try {
        const { stdout } = await execAsync("top -bn1 | grep '%Cpu' | awk '{print $2}' | cut -d'%' -f1");
        return parseFloat(stdout.trim()) || 0;
    }
    catch {
        return 0;
    }
}
async function getLinuxMemory() {
    try {
        const { stdout } = await execAsync("free -b | tail -1 | awk '{print $2,$3}'");
        const [total, used] = stdout.trim().split(/\s+/).map(Number);
        return { total, used, percent: Math.round((used / total) * 100) };
    }
    catch {
        return { total: os.totalmem(), used: os.totalmem() - os.freemem(), percent: 0 };
    }
}
async function getLinuxDisk() {
    try {
        const { stdout } = await execAsync("df -B1 . | tail -1 | awk '{print $2,$3,$5}'");
        const [total, used, percentStr] = stdout.trim().split(/\s+/);
        return {
            total: parseInt(total, 10),
            used: parseInt(used, 10),
            percent: parseInt(percentStr, 10) || 0
        };
    }
    catch {
        return { total: 0, used: 0, percent: 0 };
    }
}
export async function getSystemMetrics() {
    const platform = os.platform();
    let cpu = { usage: 0, cores: os.cpus().length };
    if (platform === 'win32') {
        cpu.usage = await getWindowsCpuUsage();
    }
    else if (platform === 'linux') {
        cpu.usage = await getLinuxCpuUsage();
    }
    const memory = platform === 'win32'
        ? await getWindowsMemory()
        : await getLinuxMemory();
    const disk = platform === 'win32'
        ? await getWindowsDisk()
        : await getLinuxDisk();
    return { cpu, memory, disk };
}
