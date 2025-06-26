import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";
import { Unify } from "./adapter";

export async function createPagesHandler() {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
      // Convert Next.js API route format to NextRequest
      const url = `http://localhost:3000${req.url}`;
      const request = new NextRequest(url, {
        method: req.method || 'GET',
        headers: req.headers as any,
        body: req.method !== 'GET' && req.method !== 'HEAD' 
          ? JSON.stringify(req.body) 
          : undefined,
      });

      // Extract route parameters
      const route = Array.isArray(req.query.route) 
        ? req.query.route as string[]
        : [req.query.route as string].filter(Boolean);
      
      if (route.length === 0) {
        return res.status(400).json({ error: "Route parameters are required" });
      }

      // Use the main handler
      const response = await Unify.handler(request, { params: { route } });
      
      // Convert response back to Next.js format
      const data = await response.json();
      return res.status(response.status).json(data);
      
    } catch (error) {
      console.error('Pages handler error:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  };
} 