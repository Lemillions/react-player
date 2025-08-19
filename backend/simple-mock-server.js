const http = require('http');
const url = require('url');

const PORT = 3001;

// Mock data
const mockUsers = [
  {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'test123',
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

function parsebody(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const parsed = body ? JSON.parse(body) : {};
      callback(parsed);
    } catch (err) {
      callback({});
    }
  });
}

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  res.setHeader('Content-Type', 'application/json');
  
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;
  
  console.log(`${req.method} ${path}`);
  
  // Health check
  if (path === '/api/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'OK', timestamp: new Date().toISOString() }));
    return;
  }
  
  // Auth routes
  if (path === '/api/auth/login' && req.method === 'POST') {
    parsebody(req, (body) => {
      const { email, password } = body;
      const user = mockUsers.find(u => u.email === email && u.password === password);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Login successful',
          user: userWithoutPassword,
          token: 'mock-jwt-token'
        }));
      } else {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid credentials'
        }));
      }
    });
    return;
  }
  
  if (path === '/api/auth/register' && req.method === 'POST') {
    parsebody(req, (body) => {
      const { email, password, name } = body;
      const existingUser = mockUsers.find(u => u.email === email);
      
      if (existingUser) {
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          message: 'User already exists'
        }));
        return;
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
      res.writeHead(201);
      res.end(JSON.stringify({
        success: true,
        message: 'User registered successfully',
        user: userWithoutPassword,
        token: 'mock-jwt-token'
      }));
    });
    return;
  }
  
  if (path === '/api/auth/me' && req.method === 'GET') {
    const user = mockUsers[0];
    const { password: _, ...userWithoutPassword } = user;
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: userWithoutPassword
    }));
    return;
  }
  
  // Content routes
  if (path === '/api/content' && req.method === 'GET') {
    const { type, genre, search, year, page = 1, limit = 20 } = query;
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
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedContent = filteredContent.slice(startIndex, endIndex);
    
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      content: paginatedContent,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredContent.length,
        totalPages: Math.ceil(filteredContent.length / limitNum)
      }
    }));
    return;
  }
  
  // Single content item
  if (path.match(/^\/api\/content\/[^\/]+$/) && req.method === 'GET') {
    const id = path.split('/').pop();
    const content = mockContent.find(c => c.id === id);
    if (content) {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: content
      }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({
        success: false,
        message: 'Content not found'
      }));
    }
    return;
  }
  
  // Content video URL
  if (path.match(/^\/api\/content\/[^\/]+\/video$/) && req.method === 'GET') {
    const id = path.split('/')[3];
    const content = mockContent.find(c => c.id === id);
    if (content) {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: {
          id: content.id,
          title: content.title,
          url: content.videoUrl,
          type: content.videoType.toLowerCase()
        }
      }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({
        success: false,
        message: 'Content not found'
      }));
    }
    return;
  }
  
  if (path === '/api/content/metadata/genres' && req.method === 'GET') {
    const genres = [...new Set(mockContent.map(c => c.genre))];
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: genres
    }));
    return;
  }
  
  if (path === '/api/content/metadata/years' && req.method === 'GET') {
    const years = [...new Set(mockContent.map(c => c.releaseYear))].sort((a, b) => b - a);
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: years
    }));
    return;
  }
  
  // User routes
  if (path === '/api/user/profiles' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: mockUsers[0].profiles
    }));
    return;
  }
  
  if (path === '/api/user/watchlist' && req.method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      message: 'Added to watchlist'
    }));
    return;
  }
  
  if (path === '/api/user/favorites' && req.method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      message: 'Added to favorites'
    }));
    return;
  }
  
  // Analytics routes
  if (path === '/api/analytics/video-event' && req.method === 'POST') {
    parsebody(req, (body) => {
      console.log('Video event:', body);
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'Event tracked'
      }));
    });
    return;
  }
  
  // 404 handler
  res.writeHead(404);
  res.end(JSON.stringify({ message: 'Route not found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 Mock server running on port ${PORT}`);
  console.log(`📊 Environment: development`);
  console.log(`🔗 Frontend URL: http://localhost:5173`);
  console.log('\n📧 Test credentials:');
  console.log('  Email: test@example.com, Password: test123');
  console.log('  Email: admin@streaming.com, Password: admin123');
});