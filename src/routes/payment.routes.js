const express = require('express');
const { createStripePaymentIntent, createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/stripe/intent', createStripePaymentIntent);
router.post('/razorpay/order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

module.exports = router;
