import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';

export const trackAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  // Skip analytics for health checks and static files
  if (req.path === '/api/health' || req.path.includes('static')) {
    return next();
  }

  try {
    // Only track for authenticated users
    if (req.user?.id) {
      await prisma.userAnalytics.create({
        data: {
          userId: req.user.id,
          event: `${req.method}_${req.path}`,
          metadata: JSON.stringify({
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            query: req.query,
            timestamp: new Date().toISOString()
          })
        }
      });
    }
  } catch (error) {
    // Don't block the request if analytics fails
    console.warn('Analytics tracking failed:', error);
  }

  next();
};

export const trackVideoEvent = async (userId: string, event: string, metadata: any) => {
  try {
    await prisma.userAnalytics.create({
      data: {
        userId,
        event,
        metadata: JSON.stringify(metadata)
      }
    });
  } catch (error) {
    console.warn('Video analytics tracking failed:', error);
  }
};