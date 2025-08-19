import express from 'express';
import { body } from 'express-validator';
import { prisma } from '../index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import { trackVideoEvent } from '../middleware/analytics.js';

const router = express.Router();

// Track video events
router.post('/video-event', 
  authenticateToken,
  [
    body('event').isIn(['play', 'pause', 'seek', 'complete', 'error']),
    body('contentId').isString(),
    body('episodeId').optional().isString(),
    body('timestamp').optional().isNumeric(),
    body('duration').optional().isNumeric(),
    body('metadata').optional().isObject()
  ],
  asyncHandler(async (req, res) => {
    const { event, contentId, episodeId, timestamp, duration, metadata } = req.body;

    await trackVideoEvent(req.user!.id, `video_${event}`, {
      contentId,
      episodeId,
      timestamp,
      duration,
      ...metadata,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Event tracked successfully'
    });
  })
);

// Track user engagement
router.post('/engagement',
  authenticateToken,
  [
    body('event').isString(),
    body('metadata').optional().isObject()
  ],
  asyncHandler(async (req, res) => {
    const { event, metadata } = req.body;

    await prisma.userAnalytics.create({
      data: {
        userId: req.user!.id,
        event,
        metadata: JSON.stringify({
          ...metadata,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          timestamp: new Date().toISOString()
        })
      }
    });

    res.json({
      success: true,
      message: 'Engagement tracked successfully'
    });
  })
);

export default router;