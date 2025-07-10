import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API routes
let server: any = null;

async function getServer() {
  if (!server) {
    server = await registerRoutes(app);
  }
  return server;
}

// Export handler for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await getServer();
  return app(req, res);
} 