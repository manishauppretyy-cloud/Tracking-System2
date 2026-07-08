const router = require('express').Router();
const ctrl = require('../controllers/location.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/live', ctrl.getAllLatest);
router.get('/:vehicleId', ctrl.getLatest);

module.exports = router;
