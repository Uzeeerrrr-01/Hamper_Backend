const express = require('express');
const { getProducts, getFeaturedProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/featured')
  .get(getFeaturedProducts);

router.route('/')
  .get(getProducts)
  .post(protect, authorize('SUPER_ADMIN', 'MANAGER'), createProduct);

router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('SUPER_ADMIN', 'MANAGER'), updateProduct)
  .delete(protect, authorize('SUPER_ADMIN', 'MANAGER'), deleteProduct);

module.exports = router;
