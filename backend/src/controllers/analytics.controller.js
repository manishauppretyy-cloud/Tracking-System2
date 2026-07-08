const prisma = require('../config/prisma');

const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      deliveriesToday,
      activeDeliveries,
      completedDeliveries,
      delayedDeliveries,
      totalVehicles,
      activeVehicles,
      totalDrivers,
    ] = await Promise.all([
      prisma.shipment.count({ where: { status: 'DELIVERED', updatedAt: { gte: today, lt: tomorrow } } }),
      prisma.shipment.count({ where: { status: 'IN_TRANSIT' } }),
      prisma.shipment.count({ where: { status: 'DELIVERED' } }),
      prisma.shipment.count({ where: { status: 'DELAYED' } }),
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: 'ACTIVE' } }),
      prisma.driver.count(),
    ]);

    const vehicleUtilization = totalVehicles > 0
      ? Math.round((activeVehicles / totalVehicles) * 100)
      : 0;

    res.json({
      deliveriesToday,
      activeDeliveries,
      completedDeliveries,
      delayedDeliveries,
      totalVehicles,
      activeVehicles,
      totalDrivers,
      vehicleUtilization,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDeliveryTrend = async (req, res) => {
  try {
    const days = 7;
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const next = new Date(date);
      next.setDate(next.getDate() + 1);

      const [delivered, delayed] = await Promise.all([
        prisma.shipment.count({ where: { status: 'DELIVERED', updatedAt: { gte: date, lt: next } } }),
        prisma.shipment.count({ where: { status: 'DELAYED', updatedAt: { gte: date, lt: next } } }),
      ]);

      result.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        delivered,
        delayed,
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getVehicleStatusBreakdown = async (req, res) => {
  try {
    const statuses = ['ACTIVE', 'IDLE', 'MAINTENANCE', 'OFFLINE'];
    const counts = await Promise.all(
      statuses.map((status) => prisma.vehicle.count({ where: { status } }))
    );
    res.json(statuses.map((status, i) => ({ status, count: counts[i] })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats, getDeliveryTrend, getVehicleStatusBreakdown };
