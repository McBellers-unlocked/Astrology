const path = require('path');
const fs = require('fs');

// Load .env file into env object for PM2
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const env = { NODE_ENV: 'production' };
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
    }
  } catch {
    console.warn('.env file not found — using defaults');
  }
  return env;
}

module.exports = {
  apps: [
    {
      name: 'stellara-api',
      script: 'dist/index.js',
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: loadEnv(),
    },
  ],
};
