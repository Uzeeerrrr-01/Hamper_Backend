const Order = require('../models/Order');
const Product = require('../models/Product');

// Create new order
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, notes, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'No order items' });
    }

    // Calculate total from DB prices (prevent tampering)
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ success: false, error: `Product not found: ${item.productId}` });
      if (product.stock < item.quantity)
        return res.status(400).json({ success: false, error: `Insufficient stock for ${product.name}` });

      totalAmount += product.price * item.quantity;
      orderItemsData.push({ product: product._id, quantity: item.quantity, price: product.price });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItemsData,
      totalAmount,
      shippingAddress,
      notes,
      paymentMethod,
    });

    // Decrement stock
    for (const item of orderItemsData) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    const populated = await order.populate('items.product');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// Get logged in user orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// Get all orders (Admin)
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// Update order status (Admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, trackingUrl } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, trackingNumber, trackingUrl },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
