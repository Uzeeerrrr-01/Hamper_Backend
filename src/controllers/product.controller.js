const Product = require('../models/Product');

exports.getProducts = async (req, res, next) => {
  try {
    const { search, sort, page = 1, limit = 10, ...filters } = req.query;

    // Build query filter
    const query = { isActive: true, ...filters };

    // Handle numeric/boolean types
    for (const key of Object.keys(query)) {
      if (query[key] === 'true') query[key] = true;
      else if (query[key] === 'false') query[key] = false;
      else if (!isNaN(query[key]) && query[key] !== '') query[key] = Number(query[key]);
    }

    // Full-text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sort) {
      sortObj = {};
      sort.split(',').forEach((field) => {
        if (field.startsWith('-')) sortObj[field.substring(1)] = -1;
        else sortObj[field] = 1;
      });
    }

    const [products, total] = await Promise.all([
      Product.find(query).populate('category').sort(sortObj).skip(skip).limit(parseInt(limit)),
      Product.countDocuments(query),
    ]);

    res.status(200).json({ success: true, count: products.length, total, data: products });
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
