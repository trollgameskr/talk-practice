# Local Proxy for Gemini API (Development)

This project includes a lightweight local proxy at `server/proxy.js` to avoid exposing your Gemini API key in the browser. Use this document to set up and test the proxy.

## Setup
1. Copy `.env.example` to `.env` at the repo root and add your Gemini API key:

```bash
# Windows PowerShell (current session)
$env:GEMINI_API_KEY = "AIxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
# Or create .env file with:
# GEMINI_API_KEY=AIxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

2. Start the proxy server:

```bash
cd /d D:\GIT\talk-practice
npm run proxy
```

The proxy listens on port `4000` by default. It exposes the endpoint:

- `POST /api/generateContent` with JSON body `{ "prompt": "your prompt here" }`.

The webpack dev server is configured to proxy `/api` to this local proxy during development.

## Proxy Server Configuration (Optional)

If you need to access Google Cloud services through a corporate or network proxy, you can configure the proxy server to use an HTTP/HTTPS proxy.

### Environment Variables

The proxy server supports standard proxy environment variables:

- `HTTPS_PROXY` or `https_proxy`: HTTPS proxy server URL
- `HTTP_PROXY` or `http_proxy`: HTTP proxy server URL (used as fallback)
- `NO_PROXY` or `no_proxy`: Comma-separated list of domains to exclude from proxying

### Configuration Examples

#### Basic Proxy Configuration

```bash
# In .env file or environment
HTTPS_PROXY=http://proxy.example.com:8080
```

#### Authenticated Proxy

```bash
HTTPS_PROXY=http://username:password@proxy.example.com:8080
```

#### Excluding Domains from Proxy

```bash
HTTPS_PROXY=http://proxy.example.com:8080
NO_PROXY=localhost,127.0.0.1,.example.com
```

### Testing Proxy Configuration

When the proxy server starts with a proxy configured, you'll see:

```
[proxy] Using proxy server: http://proxy.example.com:8080
Proxy server listening on http://localhost:4000
```

## Quick test (from terminal)

PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/generateContent -ContentType 'application/json' -Body (@{ prompt = "Say hello in English." } | ConvertTo-Json)
```

CMD (curl):

```batch
curl -X POST http://localhost:4000/api/generateContent -H "Content-Type: application/json" -d "{\"prompt\":\"Say hello in English.\"}"
```

Successful response example:

```json
{ "text": "Hello! How can I help you today?" }
```

## Notes
- Keep your API key secret. Do not commit `.env` to source control.
- The proxy configuration applies to both Gemini API and Google Cloud Text-to-Speech API calls.
- If you want automatic restart during development, install `nodemon` globally and run:

```bash
npm i -g nodemon
nodemon server/proxy.js
```

- If you see errors like `API key not valid`, verify the key and that it has generative AI access enabled on Google Cloud.

If you want, I can also add a small test script that hits the proxy and validates the response automatically; tell me to add it and I will implement it.
