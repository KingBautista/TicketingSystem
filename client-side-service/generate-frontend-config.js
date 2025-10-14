#!/usr/bin/env node

import { serviceConfig } from './config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate frontend configuration file
 * This script creates a config file that the frontend can use
 */
function generateFrontendConfig() {
    try {
        const config = serviceConfig.getFrontendConfig();
        const configContent = serviceConfig.generateFrontendConfig();
        
        // Write to client-side-service directory
        const localConfigPath = path.join(__dirname, 'frontend-config.js');
        fs.writeFileSync(localConfigPath, configContent, 'utf8');
        console.log(`✅ Generated local config: ${localConfigPath}`);
        
        // Also write to admin-panel src directory
        const adminConfigPath = path.join(__dirname, '..', 'admin-panel', 'src', 'utils', 'client-service-config.js');
        fs.writeFileSync(adminConfigPath, configContent, 'utf8');
        console.log(`✅ Generated admin-panel config: ${adminConfigPath}`);
        
        console.log(`\n🔧 Frontend Configuration:`);
        console.log(`   Service URL: ${config.serviceUrl}`);
        console.log(`   Host: ${config.host}`);
        console.log(`   Port: ${config.port}`);
        console.log(`   Computer: ${config.computerName}`);
        
        return config;
    } catch (error) {
        console.error('❌ Error generating frontend config:', error);
        return null;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    generateFrontendConfig();
}

export { generateFrontendConfig };
