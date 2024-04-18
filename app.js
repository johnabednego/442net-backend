require('dotenv').config()
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./config/db');
const { loadModels } = require('./utils/faceApiCommons');

// Load Face-API models and database connection before handling requests
async function loadApp() {
  try {
    await loadModels();
    console.log('Face-API models loaded successfully');
    await connectDB();
  } catch (error) {
    console.error('Failed to load models or connect to the database:', error);
    process.exit(1);
  }
}

loadApp();

const app = express();

app.use(express.json());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use('/.netlify/functions/api/auth', authRoutes);
app.use(errorHandler);

// Export the app for serverless usage
module.exports = app;
