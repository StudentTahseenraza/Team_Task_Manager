import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { initializeDefaultAdmin } from './controllers/authController.js';

dotenv.config();

const app = express();
const server = createServer(app);

// Socket.io configuration
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// Store online users
const onlineUsers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  // User joins with their ID
  socket.on('user-online', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('users-online', Array.from(onlineUsers.keys()));
    console.log(`👤 User ${userId} is online`);
  });
  
  // Join a specific project room
  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`📁 Socket ${socket.id} joined project ${projectId}`);
  });
  
  // Leave project room
  socket.on('leave-project', (projectId) => {
    socket.leave(`project-${projectId}`);
    console.log(`📁 Socket ${socket.id} left project ${projectId}`);
  });
  
  // Task created event
  socket.on('task-created', (data) => {
    io.to(`project-${data.projectId}`).emit('task-added', {
      task: data.task,
      message: `New task created: ${data.task.title}`
    });
    console.log(`✅ Task created in project ${data.projectId}`);
  });
  
  // Task updated event
  socket.on('task-updated', (data) => {
    io.to(`project-${data.projectId}`).emit('task-changed', {
      task: data.task,
      status: data.status,
      message: `Task updated: ${data.task.title}`
    });
    console.log(`🔄 Task updated in project ${data.projectId}`);
  });
  
  // Task deleted event
  socket.on('task-deleted', (data) => {
    io.to(`project-${data.projectId}`).emit('task-removed', {
      taskId: data.taskId,
      message: `Task deleted: ${data.taskTitle}`
    });
    console.log(`🗑️ Task deleted from project ${data.projectId}`);
  });
  
  // Member added to project
  socket.on('member-added', (data) => {
    io.to(`project-${data.projectId}`).emit('project-member-added', {
      member: data.member,
      message: `${data.member.name} joined the project`
    });
    console.log(`👥 Member added to project ${data.projectId}`);
  });
  
  // Real-time comment on task
  socket.on('task-comment', (data) => {
    io.to(`project-${data.projectId}`).emit('new-comment', {
      taskId: data.taskId,
      comment: data.comment,
      user: data.user,
      timestamp: new Date()
    });
    console.log(`💬 New comment on task ${data.taskId}`);
  });
  
  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(`project-${data.projectId}`).emit('user-typing', {
      userId: data.userId,
      userName: data.userName,
      isTyping: data.isTyping
    });
  });
  
  // User disconnects
  socket.on('disconnect', () => {
    // Remove user from online users
    let disconnectedUser = null;
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUser = userId;
        onlineUsers.delete(userId);
        break;
      }
    }
    if (disconnectedUser) {
      io.emit('users-online', Array.from(onlineUsers.keys()));
      console.log(`👤 User ${disconnectedUser} went offline`);
    }
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Team Task Manager API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      tasks: '/api/tasks',
      dashboard: '/api/dashboard',
      ai: '/api/ai'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(async () => {
  console.log('✅ MongoDB connected successfully');
  console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
  
  // Initialize default admin user
  await initializeDefaultAdmin();
  
  // Start server
  server.listen(PORT, () => {
    console.log(`
    🚀 Server is running!
    📡 URL: http://localhost:${PORT}
    🧪 Health: http://localhost:${PORT}/health
    🔌 Socket.io enabled
    🌐 Environment: ${process.env.NODE_ENV || 'development'}
    `);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export { io, server };