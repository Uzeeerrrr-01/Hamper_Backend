const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user.id);
  res.status(statusCode).json({ success: true, token, user: { id: user.id, email: user.email, role: user.role } });
};

exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ success: false, error: 'Email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword, phone }
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ success: false, error: 'Please provide an email and password' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, phone: true, avatar: true }
    });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
