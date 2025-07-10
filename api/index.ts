import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';

// Create and configure Express app for serverless
const app = express();

// Custom middleware to ensure body is properly parsed
app.use((req, res, next) => {
  // Vercel automatically parses JSON bodies, so we need to handle this properly
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    // If body is a string, try to parse it
    if (typeof req.body === 'string') {
      try {
        req.body = JSON.parse(req.body);
      } catch (e) {
        console.error('[Vercel] Failed to parse body as JSON:', e);
      }
    }
    
    // Ensure body is an object
    if (!req.body || typeof req.body !== 'object') {
      req.body = {};
    }
  }
  next();
});

// CORS middleware for Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize routes once
let routesInitialized = false;

async function initializeRoutes() {
  if (!routesInitialized) {
    console.log('[Vercel] Initializing routes...');
    await registerRoutes(app);
    routesInitialized = true;
    console.log('[Vercel] Routes initialized successfully');
  }
}

// Export handler for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`[Vercel] ${req.method} ${req.url}`);
    console.log('[Vercel] Headers:', req.headers['content-type']);
    console.log('[Vercel] Body type:', typeof req.body);
    
    // Log body for POST requests
    if (req.method === 'POST') {
      console.log('[Vercel] Body content:', JSON.stringify(req.body).substring(0, 200));
    }
    
    // Initialize routes if not already done
    await initializeRoutes();
    
    // Create a promise to handle the Express app
    await new Promise<void>((resolve, reject) => {
      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 9000); // 9 seconds (Vercel has 10s limit)
      
      // Cast to any to handle type mismatch
      (app as any)(req, res, (err: any) => {
        clearTimeout(timeout);
        if (err) {
          console.error('[Vercel] Express error:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('[Vercel] Handler error:', error);
    console.error('[Vercel] Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    // Ensure we send a response
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        path: req.url,
        method: req.method
      });
    }
  }
} 