import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isWindows = os.platform() === 'win32';
const backendDir = path.join(__dirname, 'backend');

let command;
let args;

if (isWindows) {
  command = 'cmd.exe';
  args = ['/c', 'start-dev.bat'];
} else {
  command = 'bash';
  args = ['start-dev.sh'];
}

const backend = spawn(command, args, {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true
});

backend.on('error', (err) => {
  console.error('Failed to start backend:', err);
  process.exit(1);
});

backend.on('exit', (code) => {
  process.exit(code);
});
