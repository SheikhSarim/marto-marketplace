import { z } from 'zod';

export const customerLoginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const customerRegisterSchema = z
  .object({
    full_name: z.string().trim().min(2, 'Full name must be at least 2 characters.').max(120),
    email: z.string().trim().email('Enter a valid email address.'),
    phone: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || /^\+?[0-9\-\s]{7,20}$/.test(v), 'Enter a valid phone number.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(72, 'Password must be 72 characters or fewer.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be between 8 and 72 characters.')
      .max(72, 'Password must be between 8 and 72 characters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export const sellerLoginSchema = z.object({
  email: z.string().trim().email('Enter a valid seller email.'),
  password: z.string().min(1, 'Password is required.'),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email('Enter a valid administrator email.'),
  password: z.string().min(1, 'Password is required.'),
});

export const sellerApplicationStatusSchema = z.object({
  email: z.string().trim().email('Enter the registered seller email address.'),
});

export const sellerRegisterSchema = z
  .object({
    name: z.string().trim().min(2, 'Full name is required.').max(120),
    email: z.string().trim().email('Enter a valid personal login email.'),
    password: z.string().min(8, 'Password must be at least 8 characters.').max(72),
    confirmPassword: z.string(),
    business_name: z.string().trim().min(2, 'Business name is required.').max(150),
    business_email: z.string().trim().email('Enter a valid business email.'),
    business_phone: z.string().trim().min(7, 'Business phone is required.').max(30),
    cnic: z
      .string()
      .trim()
      .regex(/^\d{5}-?\d{7}-?\d$/, 'Enter a valid 13-digit CNIC (e.g. 42101-1234567-1).'),
    business_address: z.string().trim().min(5, 'Business address is required.').max(255),
    city: z.string().trim().min(2, 'City is required.').max(100),
    shop_name: z.string().trim().min(2, 'Shop name is required.').max(150),
    shop_description: z.string().trim().min(10, 'Describe your shop in at least 10 characters.'),
    shop_category: z.string().trim().min(1, 'Select a shop category.'),
    custom_category_name: z.string().trim().max(150).optional(),
    delivery_information: z.string().trim().min(5, 'Provide delivery coverage & terms.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export const productFormSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required.').max(200),
  description: z.string().trim().optional(),
  brand: z.string().trim().max(100).optional(),
  primary_category_id: z.string().uuid('Select a valid marketplace category.'),
  shop_category_ids: z.array(z.string()).optional(),
  price: z.number({ message: 'Enter a valid price.' }).min(0.01, 'Price must be greater than 0.'),
  discount_type: z.enum(['NONE', 'PERCENTAGE', 'FIXED']),
  discount_value: z.number({ message: 'Enter a valid discount value.' }).min(0),
  sale_starts_at: z.string().optional(),
  sale_ends_at: z.string().optional(),
  stock_quantity: z.number({ message: 'Enter stock quantity.' }).int().min(0, 'Stock cannot be negative.'),
  low_stock_threshold: z.number({ message: 'Enter low stock threshold.' }).int().min(0),
  weight: z.number().min(0.01).optional(),
  is_prepaid_only: z.boolean(),
  tags: z.array(z.string()),
});

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, 'Category name is required.').max(100),
  description: z.string().trim().max(500).optional(),
  parent_id: z.string().optional(),
  sort_order: z.number({ message: 'Enter a valid sort order.' }).int().min(0),
  image_url: z.string().trim().url('Enter a valid URL').optional().or(z.literal('')),
});

export const rejectSellerSchema = z.object({
  reason: z.string().trim().min(5, 'Provide a clear reason for rejection (min 5 characters).'),
});
