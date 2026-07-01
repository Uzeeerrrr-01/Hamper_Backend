const prisma = require('../config/db');

// Create new order
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, notes, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'No order items' });
    }

    // Calculate total amount from DB to prevent tampering
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) return res.status(404).json({ success: false, error: `Product not found: ${item.productId}` });
      if (product.stock < item.quantity) return res.status(400).json({ success: false, error: `Insufficient stock for ${product.name}` });
      
      const price = product.price;
      totalAmount += price * item.quantity;
      
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: price
      });
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user.id,
        totalAmount,
        shippingAddress,
        notes,
        paymentMethod,
        items: {
          create: orderItemsData
        }
      },
      include: { items: true }
    });

    // Update stock
    for (const item of orderItemsData) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// Get logged in user orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// Get all orders (Admin)
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// Update order status (Admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, trackingUrl } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status, trackingNumber, trackingUrl }
    });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
