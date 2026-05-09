import { z } from 'zod';

export const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  weight: z.number().positive(),
  fragility: z.number().min(1).max(5),
  category: z.string(),
  maxLoad: z.number().positive(),
  price: z.number().positive(),
  description: z.string(),
  image: z.string(),
  unit: z.string().optional(),
});

export const CartItemSchema = z.object({
  id: z.string(),
  quantity: z.number().int().positive(),
});

export const CartSchema = z.object({
  items: z.array(CartItemSchema).min(1),
  roadCondition: z.enum(['smooth', 'normal', 'bumpy']).default('normal'),
});
