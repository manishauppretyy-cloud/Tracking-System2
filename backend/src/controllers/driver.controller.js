const prisma = require('../config/prisma');

const getAll = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search ? {
      OR: [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
      ],
    } : {};

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where, skip, take: Number(limit),
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          vehicle: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.driver.count({ where }),
    ]);

    res.json({ drivers, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        vehicle: true,
      },
    });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { phone, licenseNumber, name } = req.body;
    const driver = await prisma.driver.findUnique({ where: { id: req.params.id } });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    const [updatedDriver] = await prisma.$transaction([
      prisma.driver.update({ where: { id: req.params.id }, data: { phone, licenseNumber } }),
      ...(name ? [prisma.user.update({ where: { id: driver.userId }, data: { name } })] : []),
    ]);
    res.json(updatedDriver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const driver = await prisma.driver.findUnique({ where: { id: req.params.id } });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    await prisma.user.delete({ where: { id: driver.userId } }); // cascades to driver
    res.json({ message: 'Driver deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getOne, update, remove };
