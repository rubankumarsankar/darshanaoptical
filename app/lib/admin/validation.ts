import { NextResponse } from 'next/server';
import { z, ZodSchema } from 'zod';

/**
 * Validates `data` against `schema`. Returns `{ data }` on success or
 * `{ error }` (a ready-to-return 400 NextResponse) on failure.
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): { data: T; error?: undefined } | { data?: undefined; error: NextResponse } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ');
    return { error: NextResponse.json({ error: message }, { status: 400 }) };
  }
  return { data: result.data };
}

const paymentMethod = z.enum(['cash', 'upi', 'card', 'bank']);
const productCategory = z.enum(['frame', 'lens', 'sunglass', 'accessory', 'service']);

export const invoiceItemSchema = z.object({
  product_id: z.string().min(1, 'product_id is required'),
  product_name: z.string().min(1),
  product_code: z.string().min(1),
  category: productCategory,
  quantity: z.coerce.number().positive('quantity must be positive'),
  unit_price: z.coerce.number().nonnegative(),
  discount: z.coerce.number().nonnegative().optional(),
});

export const invoiceCreateSchema = z.object({
  customer_id: z.string().min(1, 'customer_id is required'),
  customer_name: z.string().min(1),
  customer_phone: z.string().min(1),
  eye_test_id: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, 'at least one item is required'),
  discount_percent: z.coerce.number().min(0).max(100).optional(),
  discount_amount: z.coerce.number().min(0).optional(),
  payment_method: paymentMethod.optional(),
  amount_paid: z.coerce.number().min(0).optional(),
  advance_paid: z.coerce.number().min(0).optional(),
  notes: z.string().optional().nullable(),
  has_order: z.boolean().optional(),
  expected_date: z.string().optional().nullable(),
  frame_product: z.string().optional().nullable(),
  lens_product: z.string().optional().nullable(),
});

export const invoiceUpdateSchema = z.object({
  add_payment: z.coerce.number().positive('add_payment must be a positive number').optional(),
  payment_method: paymentMethod.optional(),
  payment_notes: z.string().optional().nullable(),
  order_status: z.enum(['new', 'lens_ordered', 'in_process', 'ready', 'delivered', 'cancelled']).optional(),
  cancel: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

export const purchaseItemSchema = z.object({
  product_id: z.string().optional(),
  product_name: z.string().optional(),
  description: z.string().optional(),
  product_code: z.string().optional(),
  quantity: z.coerce.number().positive('quantity must be positive'),
  purchase_price: z.coerce.number().nonnegative().optional(),
  unit_cost: z.coerce.number().nonnegative().optional(),
});

export const purchaseCreateSchema = z.object({
  supplier_id: z.string().min(1, 'supplier_id is required'),
  supplier_name: z.string().min(1),
  supplier_bill_number: z.string().optional().nullable(),
  items: z.array(purchaseItemSchema).min(1, 'at least one item is required'),
  amount_paid: z.coerce.number().min(0).optional(),
  paid: z.coerce.number().min(0).optional(),
  notes: z.string().optional().nullable(),
});
