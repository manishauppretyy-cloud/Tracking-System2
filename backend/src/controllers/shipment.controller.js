const prisma = require('../config/prisma');

const getAll = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { customerName: { contains: search, mode: 'insensitive' } },
          { pickupAddress: { contains: search, mode: 'insensitive' } },
          { deliveryAddress: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where, skip, take: Number(limit),
        include: { vehicle: true, deliveryLogs: { orderBy: { updatedAt: 'desc' }, take: 1 } },
        orderBy: { [sortBy]: order },
      }),
      prisma.shipment.count({ where }),
    ]);

    res.json({ shipments, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id },
      include: {
        vehicle: { include: { driver: { include: { user: { select: { name: true } } } } } },
        deliveryLogs: { orderBy: { updatedAt: 'desc' } },
      },
    });
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { customerName, pickupAddress, deliveryAddress, vehicleId, estimatedArrival } = req.body;
    const shipment = await prisma.shipment.create({
      data: {
        customerName, pickupAddress, deliveryAddress,
        ...(vehicleId && { vehicleId }),
        ...(estimatedArrival && { estimatedArrival: new Date(estimatedArrival) }),
        deliveryLogs: { create: { status: 'PENDING' } },
      },
      include: { vehicle: true },
    });
    res.status(201).json(shipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { status, vehicleId, estimatedArrival, customerName, pickupAddress, deliveryAddress } = req.body;
    const shipment = await prisma.shipment.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(vehicleId && { vehicleId }),
        ...(estimatedArrival && { estimatedArrival: new Date(estimatedArrival) }),
        ...(customerName && { customerName }),
        ...(pickupAddress && { pickupAddress }),
        ...(deliveryAddress && { deliveryAddress }),
        ...(status && { deliveryLogs: { create: { status } } }),
      },
      include: { vehicle: true, deliveryLogs: { orderBy: { updatedAt: 'desc' } } },
    });
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await prisma.shipment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Shipment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };
