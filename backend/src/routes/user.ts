import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../index.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import { trackVideoEvent } from '../middleware/analytics.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user profiles
router.get('/profiles', asyncHandler(async (req, res) => {
  const profiles = await prisma.profile.findMany({
    where: { userId: req.user!.id },
    select: {
      id: true,
      name: true,
      avatar: true,
      isKid: true,
      createdAt: true
    },
    orderBy: { createdAt: 'asc' }
  });

  res.json({
    success: true,
    profiles
  });
}));

// Create profile
router.post('/profiles', 
  [
    body('name').isLength({ min: 1, max: 50 }).trim(),
    body('isKid').optional().isBoolean(),
    body('avatar').optional().isURL()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400);
    }

    const { name, isKid = false, avatar } = req.body;

    // Check profile limit (max 5 profiles per user)
    const profileCount = await prisma.profile.count({
      where: { userId: req.user!.id }
    });

    if (profileCount >= 5) {
      throw createError('Maximum 5 profiles allowed per account', 400);
    }

    const profile = await prisma.profile.create({
      data: {
        name,
        isKid,
        avatar,
        userId: req.user!.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      profile
    });
  })
);

// Delete profile
router.delete('/profiles/:profileId', 
  [param('profileId').isString()],
  asyncHandler(async (req, res) => {
    const { profileId } = req.params;

    const profile = await prisma.profile.findFirst({
      where: {
        id: profileId,
        userId: req.user!.id
      }
    });

    if (!profile) {
      throw createError('Profile not found', 404);
    }

    await prisma.profile.delete({
      where: { id: profileId }
    });

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  })
);

// Get watchlist
router.get('/watchlist', asyncHandler(async (req, res) => {
  const { profileId } = req.query;

  const watchlist = await prisma.watchlistItem.findMany({
    where: {
      userId: req.user!.id,
      ...(profileId && { profileId: profileId as string })
    },
    include: {
      content: {
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          genre: true,
          releaseYear: true,
          duration: true,
          posterUrl: true,
          backdropUrl: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    watchlist: watchlist.map(item => ({
      id: item.id,
      addedAt: item.createdAt,
      content: item.content
    }))
  });
}));

// Add to watchlist
router.post('/watchlist',
  [
    body('contentId').isString(),
    body('profileId').optional().isString()
  ],
  asyncHandler(async (req, res) => {
    const { contentId, profileId } = req.body;

    // Check if already in watchlist
    const existing = await prisma.watchlistItem.findFirst({
      where: {
        userId: req.user!.id,
        contentId,
        profileId: profileId || null
      }
    });

    if (existing) {
      throw createError('Item already in watchlist', 400);
    }

    const watchlistItem = await prisma.watchlistItem.create({
      data: {
        userId: req.user!.id,
        contentId,
        profileId: profileId || null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Added to watchlist',
      watchlistItem
    });
  })
);

// Remove from watchlist
router.delete('/watchlist/:itemId', asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const item = await prisma.watchlistItem.findFirst({
    where: {
      id: itemId,
      userId: req.user!.id
    }
  });

  if (!item) {
    throw createError('Watchlist item not found', 404);
  }

  await prisma.watchlistItem.delete({
    where: { id: itemId }
  });

  res.json({
    success: true,
    message: 'Removed from watchlist'
  });
}));

// Get favorites (similar to watchlist)
router.get('/favorites', asyncHandler(async (req, res) => {
  const { profileId } = req.query;

  const favorites = await prisma.favoriteItem.findMany({
    where: {
      userId: req.user!.id,
      ...(profileId && { profileId: profileId as string })
    },
    include: {
      content: {
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          genre: true,
          releaseYear: true,
          duration: true,
          posterUrl: true,
          backdropUrl: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    favorites: favorites.map(item => ({
      id: item.id,
      addedAt: item.createdAt,
      content: item.content
    }))
  });
}));

// Add to favorites
router.post('/favorites',
  [
    body('contentId').isString(),
    body('profileId').optional().isString()
  ],
  asyncHandler(async (req, res) => {
    const { contentId, profileId } = req.body;

    const existing = await prisma.favoriteItem.findFirst({
      where: {
        userId: req.user!.id,
        contentId,
        profileId: profileId || null
      }
    });

    if (existing) {
      throw createError('Item already in favorites', 400);
    }

    const favoriteItem = await prisma.favoriteItem.create({
      data: {
        userId: req.user!.id,
        contentId,
        profileId: profileId || null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      favoriteItem
    });
  })
);

// Remove from favorites
router.delete('/favorites/:itemId', asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const item = await prisma.favoriteItem.findFirst({
    where: {
      id: itemId,
      userId: req.user!.id
    }
  });

  if (!item) {
    throw createError('Favorite item not found', 404);
  }

  await prisma.favoriteItem.delete({
    where: { id: itemId }
  });

  res.json({
    success: true,
    message: 'Removed from favorites'
  });
}));

// Record watch progress
router.post('/watch-progress',
  [
    body('contentId').isString(),
    body('progress').isFloat({ min: 0, max: 1 }),
    body('episodeId').optional().isString(),
    body('profileId').optional().isString()
  ],
  asyncHandler(async (req, res) => {
    const { contentId, progress, episodeId, profileId } = req.body;

    // Update or create watch history
    const watchHistory = await prisma.watchHistory.upsert({
      where: {
        userId_profileId_contentId_episodeId: {
          userId: req.user!.id,
          profileId: profileId || null,
          contentId,
          episodeId: episodeId || null
        }
      },
      update: {
        progress,
        watchedAt: new Date(),
        completed: progress >= 0.9
      },
      create: {
        userId: req.user!.id,
        profileId: profileId || null,
        contentId,
        episodeId: episodeId || null,
        progress,
        completed: progress >= 0.9
      }
    });

    // Track video event
    trackVideoEvent(req.user!.id, 'video_progress', {
      contentId,
      episodeId,
      progress,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Watch progress recorded',
      watchHistory
    });
  })
);

// Get watch history
router.get('/watch-history', asyncHandler(async (req, res) => {
  const { profileId, limit = 20 } = req.query;

  const history = await prisma.watchHistory.findMany({
    where: {
      userId: req.user!.id,
      ...(profileId && { profileId: profileId as string })
    },
    include: {
      content: {
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          genre: true,
          posterUrl: true,
          backdropUrl: true
        }
      },
      episode: {
        select: {
          id: true,
          title: true,
          number: true
        }
      }
    },
    orderBy: { watchedAt: 'desc' },
    take: Number(limit)
  });

  res.json({
    success: true,
    history
  });
}));

// Get recommendations
router.get('/recommendations', asyncHandler(async (req, res) => {
  const { profileId, limit = 10 } = req.query;

  // Simple recommendation based on watch history genres
  const watchedGenres = await prisma.watchHistory.findMany({
    where: {
      userId: req.user!.id,
      ...(profileId && { profileId: profileId as string })
    },
    include: {
      content: {
        select: { genre: true }
      }
    },
    distinct: ['contentId'],
    take: 50
  });

  const genreCounts: { [key: string]: number } = {};
  watchedGenres.forEach(item => {
    const genre = item.content.genre;
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
  });

  const topGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([genre]) => genre);

  if (topGenres.length === 0) {
    // No watch history, return popular content
    const recommendations = await prisma.content.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        genre: true,
        releaseYear: true,
        posterUrl: true,
        backdropUrl: true
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    });

    return res.json({
      success: true,
      recommendations,
      reason: 'Popular content'
    });
  }

  // Get content from favorite genres
  const recommendations = await prisma.content.findMany({
    where: {
      genre: {
        in: topGenres
      },
      // Exclude already watched
      NOT: {
        watchHistory: {
          some: {
            userId: req.user!.id,
            ...(profileId && { profileId: profileId as string })
          }
        }
      }
    },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      genre: true,
      releaseYear: true,
      posterUrl: true,
      backdropUrl: true
    },
    orderBy: { createdAt: 'desc' },
    take: Number(limit)
  });

  res.json({
    success: true,
    recommendations,
    reason: `Based on your interest in ${topGenres.join(', ')}`
  });
}));

export default router;