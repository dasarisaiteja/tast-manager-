
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// ===============================
// CORS Configuration
// ===============================
app.use(cors({
  origin: [
    'https://tast-manager-umber.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ===============================
// Global Middleware
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// Serve Frontend Static Assets
// ===============================
app.use(express.static(path.join(__dirname, '../client')));

// ===============================
// Health Check Endpoint
// ===============================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    message: 'TaskFlow API is running',
    timestamp: new Date().toISOString()
  });
});

// ===============================
// API Routes
// ===============================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// ===============================
// Handle Unknown API Routes
// ===============================
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// ===============================
// Frontend Fallback
// ===============================
app.get('*', (req, res) => {
  res.sendFile(
    path.join(__dirname, '../client/index.html'),
    (err) => {
      if (err) {
        res.status(404).send('Frontend application not found');
      }
    }
  );
});

// ===============================
// Centralized Error Handler
// ===============================
app.use(errorHandler);

// ===============================
// Start Server After DB Connection
// ===============================
const PORT = process.env.PORT || 5123;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `[Server] Running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`
      );
    });

  } catch (error) {
    console.error('[Server] Startup failed:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
