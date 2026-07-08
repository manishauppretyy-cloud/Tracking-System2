const router = require('express').Router();
const ctrl = require('../controllers/analytics.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('ADMIN'));
router.get('/stats', ctrl.getStats);
router.get('/delivery-trend', ctrl.getDeliveryTrend);
router.get('/vehicle-status', ctrl.getVehicleStatusBreakdown);

module.exports = router;
