const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Razorpay = require('razorpay');
const prisma = require('../config/db');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createStripePaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    // Stripe requires amount in cents
    const amount = Math.round(order.totalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { orderId: order.id }
    });

    res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    next(error);
  }
};

exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    // Razorpay requires amount in paise
    const options = {
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      receipt: order.id
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
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                                  .update(body.toString())
                                  .digest('hex');

    if (expectedSignature === razorpay_signature) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'COMPLETED', paymentId: razorpay_payment_id }
      });
      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  } catch (error) {
    next(error);
  }
};
