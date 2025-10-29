# Proxy Server Configuration for Google Cloud TTS

This guide explains how to configure the proxy server to use an HTTP/HTTPS proxy when connecting to Google Cloud Text-to-Speech API.

## Overview

The proxy server (`server/proxy.js`) now supports routing Google Cloud TTS API requests through an HTTP/HTTPS proxy server. This is useful in corporate environments or networks that require all outbound connections to go through a proxy.

## Supported Environment Variables

The proxy server supports standard proxy environment variables:

| Variable | Description |
|----------|-------------|
| `HTTPS_PROXY` or `https_proxy` | HTTPS proxy server URL (preferred) |
| `HTTP_PROXY` or `http_proxy` | HTTP proxy server URL (fallback) |
| `NO_PROXY` or `no_proxy` | Comma-separated list of domains to exclude from proxying |

The proxy server will use `HTTPS_PROXY` first, then fall back to `HTTP_PROXY` if not set.

## Configuration Examples

### Basic Proxy Configuration

Set the proxy URL in your `.env` file or environment:

```bash
HTTPS_PROXY=http://proxy.example.com:8080
```

### Authenticated Proxy

If your proxy requires authentication, include credentials in the URL:

```bash
HTTPS_PROXY=http://username:password@proxy.example.com:8080
```

**Security Note**: Store credentials securely. Consider using environment variables instead of `.env` files for sensitive credentials in production.

### HTTPS Proxy

For HTTPS proxy servers:

```bash
HTTPS_PROXY=https://proxy.example.com:8443
```

### Excluding Domains

To exclude certain domains from proxying:

```bash
HTTPS_PROXY=http://proxy.example.com:8080
NO_PROXY=localhost,127.0.0.1,.internal.example.com
```

## Starting the Proxy Server

### Local Development

Start the proxy server with proxy configuration:

```bash
# Set environment variable and start
HTTPS_PROXY=http://proxy.example.com:8080 npm run proxy
```

Or use a `.env` file:

```bash
# .env file
HTTPS_PROXY=http://proxy.example.com:8080
GOOGLE_TTS_API_KEY=AIza...your-key...

# Start normally
npm run proxy
```

### Production Deployment

For production environments, set environment variables in your hosting platform:

- **Heroku**: `heroku config:set HTTPS_PROXY=http://proxy.example.com:8080`
- **AWS Lambda**: Set environment variables in Lambda configuration
- **Google Cloud Run**: Set environment variables in service configuration
- **Docker**: Use `-e` flag or `docker-compose.yml`

## Verification

### Test Proxy Configuration

Use the included test script:

```bash
# Test without proxy
node test-proxy-config.js

# Test with proxy
HTTPS_PROXY=http://proxy.example.com:8080 node test-proxy-config.js
```

### Run Tests

Run the proxy configuration tests:

```bash
npm test -- server/__tests__/proxy.test.js
```

### Check Logs

When a TTS request is made through the proxy, you'll see:

```
[proxy] Using proxy server: http://proxy.example.com:8080
[proxy] POST /api/synthesize
```

## Troubleshooting

### Proxy Connection Fails

**Symptoms**: 
- TTS requests fail with connection errors
- Timeout errors

**Solutions**:
1. Verify proxy URL is correct
2. Check proxy server is accessible from your network
3. Verify proxy authentication credentials
4. Check firewall rules allow connections to proxy

### Proxy Authentication Fails

**Symptoms**:
- 407 Proxy Authentication Required errors

**Solutions**:
1. Verify username and password are correct
2. Check if proxy requires special encoding for credentials
3. Ensure credentials are URL-encoded if they contain special characters

### Wrong Domains Being Proxied

**Symptoms**:
- Internal services being proxied when they shouldn't be

**Solutions**:
1. Set `NO_PROXY` to exclude internal domains
2. Example: `NO_PROXY=localhost,127.0.0.1,.internal,.local`

## Security Considerations

1. **Credential Storage**: Never commit proxy credentials to version control
2. **HTTPS**: Use HTTPS endpoints even when proxying for end-to-end encryption
3. **Least Privilege**: Use proxy accounts with minimal required permissions
4. **Audit Logs**: Enable proxy server logging to track API requests
5. **Secrets Management**: Use secrets management tools (AWS Secrets Manager, HashiCorp Vault) for credentials in production

## How It Works

1. The proxy server reads `HTTPS_PROXY` or `HTTP_PROXY` environment variables
2. When a TTS request is made to `/api/synthesize`, the proxy creates an `HttpsProxyAgent`
3. The agent is passed to the `fetch` call, routing the request through the proxy
4. The proxy server forwards the request to Google Cloud TTS API
5. The response is returned to the client

## Implementation Details

The proxy configuration is implemented in `server/proxy.js`:

```javascript
const {HttpsProxyAgent} = require('https-proxy-agent');

// Read proxy configuration from environment
const PROXY_CONFIG = {
  httpProxy: process.env.HTTP_PROXY || process.env.http_proxy || null,
  httpsProxy: process.env.HTTPS_PROXY || process.env.https_proxy || null,
  noProxy: process.env.NO_PROXY || process.env.no_proxy || null,
};

// Create proxy agent
function createProxyAgent() {
  const proxyUrl = PROXY_CONFIG.httpsProxy || PROXY_CONFIG.httpProxy;
  if (!proxyUrl) return undefined;
  
  return new HttpsProxyAgent(proxyUrl);
}

// Use in fetch call
const proxyAgent = createProxyAgent();
if (proxyAgent) {
  fetchOptions.agent = proxyAgent;
}
```

## Related Documentation

- [Local Proxy Setup](docs/LOCAL_PROXY.md)
- [Testing TTS Proxy](TESTING_TTS_PROXY.md)
- [Environment Variables](.env.example)

## Support

If you encounter issues with proxy configuration:

1. Check the troubleshooting section above
2. Review the test output: `npm test -- server/__tests__/proxy.test.js`
3. Run the verification script: `node test-proxy-config.js`
4. Check proxy server logs for detailed error messages
5. Open an issue on GitHub with:
   - Proxy server type and version
   - Error messages from logs
   - Network configuration details (sanitized)
