const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/Product');

dotenv.config();

const dummyProducts = [
  {
    name: 'The Royal Ivory Hamper',
    description: 'A luxurious assortment of premium artisanal chocolates, organic honey, and hand-poured soy candles, all encased in our signature matte ivory box with deep burgundy ribbons.',
    price: 185.00,
    stock: 20,
    images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2040&auto=format&fit=crop'],
    isFeatured: true,
  },
  {
    name: 'Midnight Velvet Box',
    description: 'A sophisticated collection featuring aged balsamic, truffle oil, and artisanal crackers designed for the ultimate charcuterie experience.',
    price: 145.00,
    stock: 15,
    images: ['https://images.unsplash.com/photo-1577741314755-048d8525d31e?q=80&w=2070&auto=format&fit=crop'],
    isFeatured: true,
  },
  {
    name: 'Champagne & Silk',
    description: 'Celebrate special moments with a bottle of premium champagne, pure silk eye masks, and soothing bath salts.',
    price: 210.00,
    stock: 10,
    images: ['https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1974&auto=format&fit=crop'],
    isFeatured: true,
  },
  {
    name: 'The Artisan Coffee Selection',
    description: 'Single-origin coffee beans, a gold-plated French press, and decadent dark chocolate truffles for the connoisseur.',
    price: 120.00,
    stock: 25,
    images: ['https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=2080&auto=format&fit=crop'],
    isFeatured: true,
  }
];

mongoose
  .connect(process.env.DATABASE_URL)
  .then(async () => {
    console.log('MongoDB Connected');
    await Product.deleteMany();
    console.log('Products cleared');
    await Product.insertMany(dummyProducts);
    console.log('Dummy products inserted');
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
