const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Mock data
const mockUsers = [
  {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'test123', // In real app, this would be hashed
    role: 'USER',
    profiles: [
      { id: '1', name: 'Default Profile', avatar: null, isKid: false }
    ]
  },
  {
    id: '2',
    email: 'admin@streaming.com',
    name: 'Admin User',
    password: 'admin123',
    role: 'ADMIN',
    profiles: [
      { id: '2', name: 'Admin Profile', avatar: null, isKid: false }
    ]
  }
];

const mockContent = [
  {
    id: '1',
    title: 'Sample Movie',
    description: 'A great sample movie for testing the streaming platform.',
    type: 'MOVIE',
    genre: 'Action',
    releaseYear: 2023,
    duration: 120,
    videoUrl: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
    videoType: 'HLS',
    posterUrl: 'https://via.placeholder.com/300x450/0066cc/ffffff?text=Sample+Movie',
    backdropUrl: 'https://via.placeholder.com/1920x1080/0066cc/ffffff?text=Sample+Movie',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Sample Series',
    description: 'An exciting series with multiple episodes.',
    type: 'SERIES',
    genre: 'Drama',
    releaseYear: 2023,
    videoUrl: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
    videoType: 'HLS',
    posterUrl: 'https://via.placeholder.com/300x450/cc6600/ffffff?text=Sample+Series',
    backdropUrl: 'https://via.placeholder.com/1920x1080/cc6600/ffffff?text=Sample+Series',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Comedy Special',
    description: 'Hilarious comedy special.',
    type: 'MOVIE',
    genre: 'Comedy',
    releaseYear: 2024,
    duration: 90,
    videoUrl: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
    videoType: 'HLS',
    posterUrl: 'https://via.placeholder.com/300x450/cc0066/ffffff?text=Comedy+Special',
    backdropUrl: 'https://via.placeholder.com/1920x1080/cc0066/ffffff?text=Comedy+Special',
    createdAt: new Date().toISOString()
  }
];

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token: 'mock-jwt-token'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  const existingUser = mockUsers.find(u => u.email === email);
  
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }
  
  const newUser = {
    id: String(mockUsers.length + 1),
    email,
    name,
    password,
    role: 'USER',
    profiles: []
  };
  
  mockUsers.push(newUser);
  
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: userWithoutPassword,
    token: 'mock-jwt-token'
  });
});

app.get('/api/auth/me', (req, res) => {
  // Mock authenticated user (in real app, would verify JWT)
  const user = mockUsers[0];
  const { password: _, ...userWithoutPassword } = user;
  res.json({
    success: true,
    data: userWithoutPassword
  });
});

// Content routes
app.get('/api/content', (req, res) => {
  const { type, genre, search, year, page = 1, limit = 20 } = req.query;
  let filteredContent = [...mockContent];
  
  if (type) {
    filteredContent = filteredContent.filter(c => c.type === type);
  }
  
  if (genre) {
    filteredContent = filteredContent.filter(c => 
      c.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }
  
  if (search) {
    filteredContent = filteredContent.filter(c => 
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (year) {
    filteredContent = filteredContent.filter(c => c.releaseYear === parseInt(year));
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedContent = filteredContent.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    content: paginatedContent,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredContent.length,
      totalPages: Math.ceil(filteredContent.length / limit)
    }
  });
});

app.get('/api/content/:id', (req, res) => {
  const content = mockContent.find(c => c.id === req.params.id);
  if (content) {
    res.json({
      success: true,
      data: content
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Content not found'
    });
  }
});

app.get('/api/content/:id/video', (req, res) => {
  const content = mockContent.find(c => c.id === req.params.id);
  if (content) {
    res.json({
      success: true,
      data: {
        id: content.id,
        title: content.title,
        url: content.videoUrl,
        type: content.videoType.toLowerCase()
      }
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Content not found'
    });
  }
});

app.get('/api/content/metadata/genres', (req, res) => {
  const genres = [...new Set(mockContent.map(c => c.genre))];
  res.json({
    success: true,
    data: genres
  });
});

app.get('/api/content/metadata/years', (req, res) => {
  const years = [...new Set(mockContent.map(c => c.releaseYear))].sort((a, b) => b - a);
  res.json({
    success: true,
    data: years
  });
});

// User routes
app.get('/api/user/profiles', (req, res) => {
  res.json({
    success: true,
    data: mockUsers[0].profiles
  });
});

app.post('/api/user/watchlist', (req, res) => {
  res.json({
    success: true,
    message: 'Added to watchlist'
  });
});

app.post('/api/user/favorites', (req, res) => {
  res.json({
    success: true,
    message: 'Added to favorites'
  });
});

// Analytics routes
app.post('/api/analytics/video-event', (req, res) => {
  console.log('Video event:', req.body);
  res.json({
    success: true,
    message: 'Event tracked'
  });
});

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log('\n📧 Test credentials:');
  console.log('  Email: test@example.com, Password: test123');
  console.log('  Email: admin@streaming.com, Password: admin123');
});

module.exports = app;