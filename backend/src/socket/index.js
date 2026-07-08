const prisma = require('../config/prisma');
const { verifyToken } = require('../utils/jwt');

const initSocket = (io) => {
  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      socket.user = verifyToken(token);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} | User: ${socket.user.id}`);

    // Driver joins their own room
    if (socket.user.role === 'DRIVER') {
      socket.join(`driver:${socket.user.id}`);
    }

    // Admin joins the admin room to receive all updates
    if (socket.user.role === 'ADMIN') {
      socket.join('admins');
    }

    // Driver sends GPS coordinates
    socket.on('location:update', async (data) => {
      const { vehicleId, latitude, longitude } = data;
      if (!vehicleId || latitude == null || longitude == null) return;

      try {
        const location = await prisma.location.create({
          data: { vehicleId, latitude, longitude },
        });

        // Update vehicle status to ACTIVE
        await prisma.vehicle.update({
          where: { id: vehicleId },
          data: { status: 'ACTIVE' },
        });

        // Broadcast to all admins
        io.to('admins').emit('location:updated', { vehicleId, latitude, longitude, timestamp: location.timestamp });
      } catch (err) {
        console.error('Location update error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocket;
