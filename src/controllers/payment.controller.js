const Order = require('../models/Order');
const crypto = require('crypto');

exports.createStripePaymentIntent = async (req, res, next) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const amount = Math.round(order.totalAmount * 100); // cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { orderId: order._id.toString() },
    });

    res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    next(error);
  }
};

exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const options = {
      amount: Math.round(order.totalAmount * 100), // paise
      currency: 'INR',
      receipt: order._id.toString(),
    };

    const razorpayOrder = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order: razorpayOrder });
  } catch (error) {
    next(error);
  }
};

exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'COMPLETED',
        paymentId: razorpay_payment_id,
      });
      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  } catch (error) {
    next(error);
  }
};
