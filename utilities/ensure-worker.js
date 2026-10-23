// Generates src/workers/worker.ts (not committed) when missing or older than its sources.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'src', 'workers', 'worker.ts');
const sourceDirs = ['src/workers', 'src/reader', 'src/common'].map(d => path.join(root, d));

function newestSource(dir) {
    let newest = 0;
    fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            newest = Math.max(newest, newestSource(p));
        } else if (e.name.endsWith('.ts') && p !== output) {
            newest = Math.max(newest, fs.statSync(p).mtimeMs);
        }
    });
    return newest;
}

const stale = !fs.existsSync(output) ||
    fs.statSync(output).mtimeMs < Math.max(...sourceDirs.map(newestSource));

if (stale) {
    console.log('Generating src/workers/worker.ts');
    execSync('npm run build:worker', { cwd: root, stdio: 'inherit' });
}
