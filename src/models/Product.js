const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name:        { type: String, required: [true, 'Product name is required'], trim: true },
    description: { type: String },
    price:       { type: Number, required: [true, 'Price is required'], min: 0 },
    stock:       { type: Number, default: 0, min: 0 },
    images:      [{ type: String }],
    category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    isActive:    { type: Boolean, default: true },
    isFeatured:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Text index for search
ProductSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
