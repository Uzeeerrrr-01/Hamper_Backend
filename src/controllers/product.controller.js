const prisma = require('../config/db');
const APIFeatures = require('../utils/apiFeatures');

exports.getProducts = async (req, res, next) => {
  try {
    const features = new APIFeatures(req.query, req.query);
    const where = features.filter();
    
    if (req.query.search) {
      where.OR = [
        { name: { contains: req.query.search, mode: 'insensitive' } },
        { description: { contains: req.query.search, mode: 'insensitive' } }
      ];
    }

    const { skip, take } = features.paginate();
    const orderBy = features.sort();

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take, orderBy, include: { category: true } }),
      prisma.product.count({ where })
    ]);

    res.status(200).json({ success: true, count: products.length, total, pagination: { skip, take }, data: products });
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true }
    });
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
