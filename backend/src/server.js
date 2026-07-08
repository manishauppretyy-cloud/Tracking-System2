require('dotenv').config();

// Initialize Prisma with DB URL immediately after dotenv loads
const { initPrisma } = require('./config/prisma');
initPrisma(process.env.DATABASE_URL);

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const initSocket = require('./socket');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/vehicles', require('./routes/vehicle.routes'));
app.use('/api/drivers', require('./routes/driver.routes'));
app.use('/api/shipments', require('./routes/shipment.routes'));
app.use('/api/locations', require('./routes/location.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Socket.IO
initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 FleetFlow server running on port ${PORT}`));
