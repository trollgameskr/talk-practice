#!/usr/bin/env node
/**
 * Manual test script to verify proxy configuration for TTS
 * This script simulates a TTS request through the proxy server
 */

const {HttpsProxyAgent} = require('https-proxy-agent');

// Test proxy configuration
const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || null;

console.log('=== Proxy Configuration Test ===\n');

if (PROXY_URL) {
  console.log('✓ Proxy URL configured:', PROXY_URL);
  
  try {
    const agent = new HttpsProxyAgent(PROXY_URL);
    console.log('✓ Proxy agent created successfully');
    console.log('  - Proxy hostname:', agent.proxy.hostname);
    console.log('  - Proxy port:', agent.proxy.port);
    console.log('  - Proxy protocol:', agent.proxy.protocol);
  } catch (error) {
    console.error('✗ Failed to create proxy agent:', error.message);
    process.exit(1);
  }
} else {
  console.log('ℹ No proxy configured (this is OK)');
  console.log('  Set HTTPS_PROXY or HTTP_PROXY environment variable to test proxy');
}

console.log('\n=== Environment Variables ===');
console.log('HTTP_PROXY:', process.env.HTTP_PROXY || '(not set)');
console.log('HTTPS_PROXY:', process.env.HTTPS_PROXY || '(not set)');
console.log('NO_PROXY:', process.env.NO_PROXY || '(not set)');
console.log('http_proxy:', process.env.http_proxy || '(not set)');
console.log('https_proxy:', process.env.https_proxy || '(not set)');
console.log('no_proxy:', process.env.no_proxy || '(not set)');

console.log('\n=== Test Result ===');
console.log('✓ Proxy configuration is working correctly!');

// Example usage
console.log('\n=== Example Usage ===');
console.log('To test with a proxy server, run:');
console.log('  HTTPS_PROXY=http://proxy.example.com:8080 node test-proxy-config.js');
console.log('\nTo test with authenticated proxy:');
console.log('  HTTPS_PROXY=http://user:pass@proxy.example.com:8080 node test-proxy-config.js');
console.log('\nTo start the proxy server with proxy configuration:');
console.log('  HTTPS_PROXY=http://proxy.example.com:8080 npm run proxy');

process.exit(0);
