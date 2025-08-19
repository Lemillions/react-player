import express from 'express';
import { query } from 'express-validator';
import { prisma } from '../index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all content (public)
router.get('/', 
  [
    query('type').optional().isIn(['MOVIE', 'SERIES', 'CHANNEL']),
    query('genre').optional().isString(),
    query('search').optional().isString(),
    query('year').optional().isInt({ min: 1900, max: 2030 }),
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
  ],
  asyncHandler(async (req, res) => {
    const { type, genre, search, year, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (type) where.type = type;
    if (genre) where.genre = { contains: genre as string, mode: 'insensitive' };
    if (year) where.releaseYear = Number(year);
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [content, total] = await Promise.all([
      prisma.content.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          genre: true,
          releaseYear: true,
          duration: true,
          posterUrl: true,
          backdropUrl: true,
          videoType: true,
          createdAt: true
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
  })
);

// Get single content item
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const content = await prisma.content.findUnique({
    where: { id },
    include: {
      seasons: {
        include: {
          episodes: {
            select: {
              id: true,
              number: true,
              title: true,
              description: true,
              duration: true,
              videoType: true
            },
            orderBy: { number: 'asc' }
          }
        },
        orderBy: { number: 'asc' }
      },
      episodes: {
        select: {
          id: true,
          number: true,
          title: true,
          description: true,
          duration: true,
          videoType: true
        },
        orderBy: { number: 'asc' }
      }
    }
  });

  if (!content) {
    return res.status(404).json({
      success: false,
      message: 'Content not found'
    });
  }

  res.json({
    success: true,
    content
  });
}));

// Get video URL (authenticated)
router.get('/:id/video', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const content = await prisma.content.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      videoUrl: true,
      videoType: true
    }
  });

  if (!content) {
    return res.status(404).json({
      success: false,
      message: 'Content not found'
    });
  }

  res.json({
    success: true,
    video: {
      id: content.id,
      title: content.title,
      url: content.videoUrl,
      type: content.videoType.toLowerCase()
    }
  });
}));

// Get episode video URL (authenticated)
router.get('/episode/:episodeId/video', authenticateToken, asyncHandler(async (req, res) => {
  const { episodeId } = req.params;

  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: {
      id: true,
      title: true,
      videoUrl: true,
      videoType: true,
      content: {
        select: {
          title: true
        }
      }
    }
  });

  if (!episode) {
    return res.status(404).json({
      success: false,
      message: 'Episode not found'
    });
  }

  res.json({
    success: true,
    video: {
      id: episode.id,
      title: `${episode.content.title} - ${episode.title}`,
      url: episode.videoUrl,
      type: episode.videoType.toLowerCase()
    }
  });
}));

// Get genres
router.get('/metadata/genres', asyncHandler(async (req, res) => {
  const genres = await prisma.content.findMany({
    select: { genre: true },
    distinct: ['genre'],
    orderBy: { genre: 'asc' }
  });

  res.json({
    success: true,
    genres: genres.map(g => g.genre).filter(Boolean)
  });
}));

// Get release years
router.get('/metadata/years', asyncHandler(async (req, res) => {
  const years = await prisma.content.findMany({
    select: { releaseYear: true },
    distinct: ['releaseYear'],
    orderBy: { releaseYear: 'desc' }
  });

  res.json({
    success: true,
    years: years.map(y => y.releaseYear).filter(Boolean)
  });
}));

export default router;