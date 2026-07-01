const express = require('express');
const { createOrder, getMyOrders, getOrders, updateOrderStatus } = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createOrder)
  .get(authorize('SUPER_ADMIN', 'MANAGER'), getOrders);

router.route('/myorders').get(getMyOrders);

router.route('/:id/status')
  .put(authorize('SUPER_ADMIN', 'MANAGER'), updateOrderStatus);

module.exports = router;
