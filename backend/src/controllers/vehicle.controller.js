const prisma = require('../config/prisma');

const getAll = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { vehicleNumber: { contains: search, mode: 'insensitive' } },
          { type: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where, skip, take: Number(limit),
        include: { driver: { include: { user: { select: { name: true, email: true } } } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vehicle.count({ where }),
    ]);

    res.json({ vehicles, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
      include: {
        driver: { include: { user: { select: { name: true, email: true } } } },
        locations: { orderBy: { timestamp: 'desc' }, take: 1 },
        shipments: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { vehicleNumber, type, status } = req.body;
    const vehicle = await prisma.vehicle.create({ data: { vehicleNumber, type, status } });
    res.status(201).json(vehicle);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Vehicle number already exists' });
    res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await prisma.vehicle.delete({ where: { id: req.params.id } });
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;
    // Unassign previous vehicle from driver
    await prisma.driver.updateMany({ where: { vehicleId: req.params.id }, data: { vehicleId: null } });
    const driver = await prisma.driver.update({
      where: { id: driverId },
      data: { vehicleId: req.params.id },
    });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove, assignDriver };
