require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { createServer } = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const documentRoutes = require('./routes/documents');
const notesRoutes = require('./routes/notes');
const quizRoutes = require('./routes/quiz');
const userRoutes = require('./routes/user');
const testRoutes = require('./routes/test');
const adminRoutes = require('./routes/admin');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const frontendBuildPath = path.join(__dirname, '../../frontend/build');
const hasFrontendBuild = fs.existsSync(frontendBuildPath);
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3001,http://localhost:3002')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const onRenderOriginPattern = /^https:\/\/[a-z0-9-]+\.onrender\.com$/i;
const webOriginPattern = /^https?:\/\/[^/\s]+$/i;

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  if (onRenderOriginPattern.test(origin)) {
    return true;
  }

  // Accept any standard web origin for browser clients.
  if (webOriginPattern.test(origin)) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    credentials: true
  }
});

mongoose.set('bufferCommands', false);

// Middleware
app.set('trust proxy', 1); // Trust first proxy
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: isDbConnected ? 'OK' : 'DEGRADED',
    db: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', (req, res, next) => {
  if (req.path === '/health') {
    return next();
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database is not connected. Check MongoDB Atlas network access and MONGODB_URI.'
    });
  }

  return next();
});

if (process.env.NODE_ENV === 'production' && hasFrontendBuild) {
  app.use(express.static(frontendBuildPath));
}

app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production' && hasFrontendBuild) {
    return res.sendFile(path.join(frontendBuildPath, 'index.html'));
  }

  return res.json({
    status: 'OK',
    message: 'Backend is running',
    health: '/api/health'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', (req, res, next) => {
  console.log(`Document route: ${req.method} ${req.path}`);
  next();
}, documentRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/user', userRoutes);
app.use('/api/test', testRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

if (process.env.NODE_ENV === 'production' && hasFrontendBuild) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }

    return res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-chat', (userId) => {
    socket.join(`user-${userId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (String(err.message || '').toLowerCase().includes('cors')) {
    return res.status(403).json({ error: err.message || 'CORS blocked this origin' });
  }
  return res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
