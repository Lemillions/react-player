import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

// Get dashboard stats
router.get('/dashboard', asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalContent,
    totalProfiles,
    recentUsers,
    popularContent
  ] = await Promise.all([
    prisma.user.count(),
    prisma.content.count(),
    prisma.profile.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    }),
    prisma.watchHistory.groupBy({
      by: ['contentId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })
  ]);

  // Get popular content details
  const popularContentIds = popularContent.map(p => p.contentId);
  const popularContentDetails = await prisma.content.findMany({
    where: {
      id: { in: popularContentIds }
    },
    select: {
      id: true,
      title: true,
      type: true,
      genre: true
    }
  });

  const popularContentWithCounts = popularContent.map(p => ({
    ...popularContentDetails.find(c => c.id === p.contentId),
    watchCount: p._count.id
  }));

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalContent,
      totalProfiles,
      recentUsers,
      popularContent: popularContentWithCounts
    }
  });
}));

// Get all users
router.get('/users', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            profiles: true,
            watchHistory: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    }),
    prisma.user.count()
  ]);

  res.json({
    success: true,
    users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    }
  });
}));

// Get all content
router.get('/content', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (type) where.type = type;

  const [content, total] = await Promise.all([
    prisma.content.findMany({
      where,
      include: {
        _count: {
          select: {
            watchHistory: true,
            favorites: true,
            watchlist: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    }),
    prisma.content.count({ where })
  ]);

  res.json({
    success: true,
    content,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    }
  });
}));

// Create content
router.post('/content',
  [
    body('title').isLength({ min: 1 }).trim(),
    body('description').optional().trim(),
    body('type').isIn(['MOVIE', 'SERIES', 'CHANNEL']),
    body('genre').isLength({ min: 1 }).trim(),
    body('releaseYear').isInt({ min: 1900, max: 2030 }),
    body('duration').optional().isInt({ min: 1 }),
    body('videoUrl').isURL(),
    body('videoType').isIn(['HLS', 'DASH']),
    body('posterUrl').optional().isURL(),
    body('backdropUrl').optional().isURL()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400);
    }

    const content = await prisma.content.create({
      data: req.body
    });

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      content
    });
  })
);

// Update content
router.put('/content/:id',
  [
    body('title').optional().isLength({ min: 1 }).trim(),
    body('description').optional().trim(),
    body('type').optional().isIn(['MOVIE', 'SERIES', 'CHANNEL']),
    body('genre').optional().isLength({ min: 1 }).trim(),
    body('releaseYear').optional().isInt({ min: 1900, max: 2030 }),
    body('duration').optional().isInt({ min: 1 }),
    body('videoUrl').optional().isURL(),
    body('videoType').optional().isIn(['HLS', 'DASH']),
    body('posterUrl').optional().isURL(),
    body('backdropUrl').optional().isURL()
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const content = await prisma.content.findUnique({
      where: { id }
    });

    if (!content) {
      throw createError('Content not found', 404);
    }

    const updatedContent = await prisma.content.update({
      where: { id },
      data: req.body
    });

    res.json({
      success: true,
      message: 'Content updated successfully',
      content: updatedContent
    });
  })
);

// Delete content
router.delete('/content/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const content = await prisma.content.findUnique({
    where: { id }
  });

  if (!content) {
    throw createError('Content not found', 404);
  }

  await prisma.content.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Content deleted successfully'
  });
}));

// Get user analytics
router.get('/analytics/users', asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const startDate = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

  const [
    dailyActiveUsers,
    topEvents,
    userGrowth
  ] = await Promise.all([
    prisma.$queryRaw`
      SELECT 
        DATE(timestamp) as date,
        COUNT(DISTINCT userId) as activeUsers
      FROM user_analytics 
      WHERE timestamp >= ${startDate}
      GROUP BY DATE(timestamp)
      ORDER BY date
    `,
    prisma.userAnalytics.groupBy({
      by: ['event'],
      _count: {
        id: true
      },
      where: {
        timestamp: {
          gte: startDate
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    }),
    prisma.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as newUsers
      FROM users 
      WHERE createdAt >= ${startDate}
      GROUP BY DATE(createdAt)
      ORDER BY date
    `
  ]);

  res.json({
    success: true,
    analytics: {
      dailyActiveUsers,
      topEvents: topEvents.map(e => ({
        event: e.event,
        count: e._count.id
      })),
      userGrowth
    }
  });
}));

// Get content analytics
router.get('/analytics/content', asyncHandler(async (req, res) => {
  const [
    mostWatchedContent,
    contentByType,
    contentByGenre,
    avgWatchProgress
  ] = await Promise.all([
    prisma.watchHistory.groupBy({
      by: ['contentId'],
      _count: {
        id: true
      },
      _avg: {
        progress: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    }),
    prisma.content.groupBy({
      by: ['type'],
      _count: {
        id: true
      }
    }),
    prisma.content.groupBy({
      by: ['genre'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    }),
    prisma.watchHistory.aggregate({
      _avg: {
        progress: true
      }
    })
  ]);

  // Get content details for most watched
  const contentIds = mostWatchedContent.map(c => c.contentId);
  const contentDetails = await prisma.content.findMany({
    where: { id: { in: contentIds } },
    select: {
      id: true,
      title: true,
      type: true,
      genre: true
    }
  });

  const mostWatchedWithDetails = mostWatchedContent.map(c => ({
    ...contentDetails.find(detail => detail.id === c.contentId),
    watchCount: c._count.id,
    avgProgress: c._avg.progress
  }));

  res.json({
    success: true,
    analytics: {
      mostWatchedContent: mostWatchedWithDetails,
      contentByType: contentByType.map(c => ({
        type: c.type,
        count: c._count.id
      })),
      contentByGenre: contentByGenre.map(c => ({
        genre: c.genre,
        count: c._count.id
      })),
      avgWatchProgress: avgWatchProgress._avg.progress || 0
    }
  });
}));

export default router;