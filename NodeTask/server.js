const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Route files

const auth = require('./routes/auth.routes');

const app = express();
app.use(cors());
// Body parser
app.use(express.json());
// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); 

// Mount routers
app.use('/api/v1/auth', auth);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
