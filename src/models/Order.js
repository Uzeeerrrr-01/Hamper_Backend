const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price:    { type: Number, required: true },
  },
  { _id: true }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber:     { type: String, unique: true },
    user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items:           [OrderItemSchema],
    totalAmount:     { type: Number, required: true },
    status:          { type: String, enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], default: 'PENDING' },
    paymentStatus:   { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'], default: 'PENDING' },
    paymentMethod:   { type: String },
    paymentId:       { type: String },
    shippingAddress: { type: mongoose.Schema.Types.Mixed },
    notes:           { type: String },
    trackingNumber:  { type: String },
    trackingUrl:     { type: String },
  },
  { timestamps: true }
);

// Auto-generate order number before saving
OrderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
