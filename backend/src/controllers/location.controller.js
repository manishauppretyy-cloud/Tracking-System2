const prisma = require('../config/prisma');

const getLatest = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      where: { vehicleId: req.params.vehicleId },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllLatest = async (req, res) => {
  try {
    // Get the latest location for each vehicle
    const vehicles = await prisma.vehicle.findMany({
      where: { status: 'ACTIVE' },
      include: {
        locations: { orderBy: { timestamp: 'desc' }, take: 1 },
        driver: { include: { user: { select: { name: true } } } },
      },
    });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getLatest, getAllLatest };
