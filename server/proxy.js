#!/usr/bin/env node
const express = require('express');
const bodyParser = require('body-parser');
const {GoogleGenerativeAI} = require('@google/generative-ai');

// Load .env for local development (if present)
try {
  require('dotenv').config();
} catch (e) {
  // dotenv is optional; if not installed, environment variables should be set externally.
}

// Minimal local config for the proxy. Do not import TypeScript config file directly.
const GEMINI_CONFIG = {
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite-preview-09-2025',
  generation: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
    candidateCount: 1,
  },
};

const app = express();
const port = process.env.PROXY_PORT || 4000;

app.use(bodyParser.json());

// Log incoming requests for easier debugging
app.use((req, res, next) => {
  try {
    console.log(`[proxy] ${req.method} ${req.originalUrl}`);
  } catch (e) {
    // ignore logging errors
  }
  next();
});

// Basic health
app.get('/api/health', (req, res) => res.json({status: 'ok'}));

// POST /api/generateContent { prompt }
app.post('/api/generateContent', async (req, res) => {
  const prompt = req.body.prompt || '';
  const apiKey = process.env.GEMINI_API_KEY || null;

  if (!apiKey) {
    console.error('Proxy request but no GEMINI_API_KEY configured');
    return res.status(400).json({error: 'Missing GEMINI_API_KEY on server'});
  }

  try {
    const client = new GoogleGenerativeAI({apiKey});
    const model = client.getGenerativeModel({
      model: GEMINI_CONFIG.model,
      generationConfig: GEMINI_CONFIG.generation,
    });

    const result = await model.generateContent(prompt);
    const text = result && result.response ? (typeof result.response.text === 'function' ? result.response.text() : result.response.text) : '';
    res.json({text});
  } catch (err) {
    console.error('Proxy generateContent error:', err?.message || err);
    // Provide structured error responses to the client for easier debugging
    const message = err?.message || String(err);
    const status = err?.code === 400 ? 400 : 500;
    res.status(status).json({error: message});
  }
});

// Catch-all for other /api routes to return JSON instead of Express HTML 404 page.
app.all('/api/*', (req, res) => {
  console.warn(`[proxy] 404 for ${req.method} ${req.originalUrl}`);
  res.status(404).json({error: 'Not found'});
});

app.listen(port, () => {
  console.log(`Proxy server listening on http://localhost:${port}`);
});
