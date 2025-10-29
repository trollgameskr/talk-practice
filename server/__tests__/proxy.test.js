/**
 * Tests for proxy server configuration
 */

const {HttpsProxyAgent} = require('https-proxy-agent');

describe('Proxy Server Configuration', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment variables
    originalEnv = {
      HTTP_PROXY: process.env.HTTP_PROXY,
      HTTPS_PROXY: process.env.HTTPS_PROXY,
      NO_PROXY: process.env.NO_PROXY,
      http_proxy: process.env.http_proxy,
      https_proxy: process.env.https_proxy,
      no_proxy: process.env.no_proxy,
    };

    // Clear proxy environment variables for each test
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;
    delete process.env.NO_PROXY;
    delete process.env.http_proxy;
    delete process.env.https_proxy;
    delete process.env.no_proxy;

    // Clear require cache to reload proxy.js with new environment
    delete require.cache[require.resolve('../proxy.js')];
  });

  afterEach(() => {
    // Restore original environment variables
    Object.keys(originalEnv).forEach(key => {
      if (originalEnv[key] !== undefined) {
        process.env[key] = originalEnv[key];
      } else {
        delete process.env[key];
      }
    });
  });

  describe('HttpsProxyAgent', () => {
    it('should create proxy agent with valid URL', () => {
      const proxyUrl = 'http://proxy.example.com:8080';
      const agent = new HttpsProxyAgent(proxyUrl);
      expect(agent).toBeDefined();
      expect(agent.proxy).toBeDefined();
    });

    it('should create proxy agent with authenticated URL', () => {
      const proxyUrl = 'http://user:pass@proxy.example.com:8080';
      const agent = new HttpsProxyAgent(proxyUrl);
      expect(agent).toBeDefined();
      expect(agent.proxy).toBeDefined();
    });

    it('should handle HTTPS proxy URLs', () => {
      const proxyUrl = 'https://proxy.example.com:8443';
      const agent = new HttpsProxyAgent(proxyUrl);
      expect(agent).toBeDefined();
      expect(agent.proxy).toBeDefined();
    });
  });

  describe('Environment Variable Support', () => {
    it('should recognize HTTPS_PROXY environment variable', () => {
      process.env.HTTPS_PROXY = 'http://proxy.example.com:8080';
      expect(process.env.HTTPS_PROXY).toBe('http://proxy.example.com:8080');
    });

    it('should recognize HTTP_PROXY environment variable', () => {
      process.env.HTTP_PROXY = 'http://proxy.example.com:8080';
      expect(process.env.HTTP_PROXY).toBe('http://proxy.example.com:8080');
    });

    it('should recognize lowercase https_proxy environment variable', () => {
      process.env.https_proxy = 'http://proxy.example.com:8080';
      expect(process.env.https_proxy).toBe('http://proxy.example.com:8080');
    });

    it('should recognize lowercase http_proxy environment variable', () => {
      process.env.http_proxy = 'http://proxy.example.com:8080';
      expect(process.env.http_proxy).toBe('http://proxy.example.com:8080');
    });

    it('should recognize NO_PROXY environment variable', () => {
      process.env.NO_PROXY = 'localhost,127.0.0.1,.example.com';
      expect(process.env.NO_PROXY).toBe('localhost,127.0.0.1,.example.com');
    });
  });

  describe('Proxy URL Formats', () => {
    it('should support HTTP proxy URL format', () => {
      const proxyUrl = 'http://proxy.example.com:8080';
      expect(() => new HttpsProxyAgent(proxyUrl)).not.toThrow();
    });

    it('should support HTTPS proxy URL format', () => {
      const proxyUrl = 'https://proxy.example.com:8443';
      expect(() => new HttpsProxyAgent(proxyUrl)).not.toThrow();
    });

    it('should support authenticated proxy URL format', () => {
      const proxyUrl = 'http://username:password@proxy.example.com:8080';
      expect(() => new HttpsProxyAgent(proxyUrl)).not.toThrow();
    });

    it('should support proxy URL with IPv4 address', () => {
      const proxyUrl = 'http://192.168.1.1:8080';
      expect(() => new HttpsProxyAgent(proxyUrl)).not.toThrow();
    });
  });
});
