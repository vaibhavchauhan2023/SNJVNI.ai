import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import uploadRoutes from './api/reports/upload.js';
import getReportRouter from './api/reports/[id].js';
import ionRoutes from './api/ion/chat.js';

const app = express();
const port = process.env.PORT || 5000;

// Restrict CORS to your domains only
app.use(cors({
  origin: [
    'https://snjvni-ai.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));

app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Health check — Render uses this to confirm server is alive
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SNJVNI backend running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/reports/upload', uploadRoutes);
app.use('/api/reports', getReportRouter);
app.use('/api/ion/chat', ionRoutes);

// Generic Gemini generate endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ result: response.text });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// 404 handler — catch undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});