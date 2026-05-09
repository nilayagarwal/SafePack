import { Router } from 'express';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { CartSchema } from '../models/item.js';
import { optimizePacking } from '../algorithms/packer.js';
import { authMiddleware } from '../middleware/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRODUCTS_FILE = join(__dirname, '../data/products.json');

function readProducts() {
  return JSON.parse(readFileSync(PRODUCTS_FILE, 'utf-8'));
}

const router = Router();

// GET /api/products — public
router.get('/', (req, res) => {
  const products = readProducts();
  res.json({ products });
});

// POST /api/calculate-stack — protected
router.post('/calculate-stack', authMiddleware, (req, res) => {
  try {
    const { items, roadCondition } = CartSchema.parse(req.body);
    const products = readProducts();

    // Map cart items to full product data with quantities
    const cartProducts = items.map(cartItem => {
      const product = products.find(p => p.id === cartItem.id);
      if (!product) {
        throw new Error(`Product not found: ${cartItem.id}`);
      }
      return { ...product, quantity: cartItem.quantity };
    });

    const packingPlan = optimizePacking(cartProducts, roadCondition);
    res.json(packingPlan);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors[0].message });
    }
    res.status(400).json({ error: err.message || 'Invalid request.' });
  }
});

export default router;
