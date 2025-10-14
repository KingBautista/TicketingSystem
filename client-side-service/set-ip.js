#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Set specific IP address for client service
 * Usage: node set-ip.js <ip> [port]
 */

const args = process.argv.slice(2);
const ip = args[0] || '192.168.0.176';
const port = args[1] || '4000';

console.log(`🔧 Setting client service IP to: ${ip}:${port}`);

// Update the frontend configuration
const configContent = `// Auto-generated client service configuration
// Generated at: ${new Date().toISOString()}
// Manual IP setting: ${ip}:${port}

export const CLIENT_SERVICE_CONFIG = {
    serviceUrl: 'http://${ip}:${port}',
    host: '${ip}',
    port: ${port},
    computerName: '${process.env.COMPUTERNAME || 'Unknown'}'
};

// For backward compatibility
export const CLIENT_SERVICE_URL = 'http://${ip}:${port}';
`;

// Write to admin-panel src directory
const adminConfigPath = path.join(__dirname, '..', 'admin-panel', 'src', 'utils', 'client-service-config.js');
fs.writeFileSync(adminConfigPath, configContent, 'utf8');
console.log(`✅ Updated frontend config: ${adminConfigPath}`);

// Also write to local directory
const localConfigPath = path.join(__dirname, 'frontend-config.js');
fs.writeFileSync(localConfigPath, configContent, 'utf8');
console.log(`✅ Updated local config: ${localConfigPath}`);

console.log(`\n🎯 Frontend will now connect to: http://${ip}:${port}`);
console.log(`📋 Make sure your client service is running on ${ip}:${port}`);
console.log(`🚀 Start the service with: npm start`);
