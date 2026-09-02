import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Terminal color codes
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

console.log(`${BOLD}${CYAN}======================================================${RESET}`);
console.log(`${BOLD}${GREEN}  🚀 Starting Shree Sai Classes Billing & Fee System  ${RESET}`);
console.log(`${BOLD}${CYAN}======================================================${RESET}\n`);

// Helper to auto-kill stale processes on ports 5000 and 5173
const killPort = (port) => {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      const lines = output.trim().split('\n');
      lines.forEach((line) => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && pid !== `${process.pid}`) {
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          } catch (_) {}
        }
      });
    }
  } catch (_) {}
};

console.log(`${YELLOW}🧹 Freeing ports 5000 and 5173...${RESET}`);
killPort(5000);
killPort(5173);

// Give Windows socket a brief moment to fully release
await new Promise((resolve) => setTimeout(resolve, 600));

// Helper to spawn process cross-platform
const spawnProcess = (command, args, cwd, prefix, color) => {
  const isWindows = process.platform === 'win32';
  const executable = command === 'npm' && isWindows ? 'npm.cmd' : command;

  const proc = spawn(executable, args, {
    cwd,
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        console.log(`${color}${prefix}${RESET} ${line}`);
      }
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        console.error(`${color}${prefix} [ERR]${RESET} ${line}`);
      }
    });
  });

  proc.on('error', (err) => {
    console.error(`${color}${prefix} Error:${RESET}`, err.message);
  });

  proc.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`${color}${prefix}${RESET} Process exited with code ${code}`);
    }
  });

  return proc;
};

// 1. Launch Server (Express API on Port 5000)
console.log(`${YELLOW}⚡ Launching Server on http://localhost:5000...${RESET}`);
const serverProc = spawnProcess('node', ['src/server.js'], path.join(__dirname, 'server'), '[SERVER]', GREEN);

// 2. Launch Client (Vite React UI on Port 5173)
console.log(`${YELLOW}⚡ Launching Client on http://localhost:5173...${RESET}`);
const clientProc = spawnProcess('npm', ['run', 'dev'], path.join(__dirname, 'client'), '[CLIENT]', CYAN);

// Handle graceful exit
const cleanup = () => {
  console.log(`\n${YELLOW}🛑 Shutting down Shree Sai Classes services...${RESET}`);
  try {
    serverProc.kill();
  } catch (_) {}
  try {
    clientProc.kill();
  } catch (_) {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
