import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.resolve(__dirname, 'dist'));
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // Lazy initialization of the Gemini Client
  let aiClient: GoogleGenAI | null = null;
  function getAi() {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not defined. Please configure it in your Settings > Secrets.');
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
    return aiClient;
  }

  // API endpoint for offline-client parsed PDF text content intelligence
  app.post('/api/gemini/analyze', async (req, res) => {
    try {
      const { textContent, query, mode } = req.body;
      const ai = getAi();
      
      let prompt = '';
      if (mode === 'summary') {
        prompt = `You are a highly structured PDF assistant. Provide a professional, clean summary of the following PDF document text content. Format with bold markdown key insights, clear bulleted structural takeaways, and target facts.\n\nDOCUMENT TEXT CONTENT:\n${textContent || '[No text extracted]'}`;
      } else {
        prompt = `You are a highly detailed and helpful PDF assistant. Use the text below to resolve the user's specific query. Keep answers precise, accurate, and completely objective based on the context.\n\nQUERY: ${query}\n\nDOCUMENT TEXT CONTENT:\n${textContent || '[No text extracted]'}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt
      });

      res.json({ result: response.text });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      res.status(500).json({ error: err.message || 'An unexpected error occurred in Gemini API.' });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server fully operational at http://localhost:${PORT}`);
  });
}

startServer();
