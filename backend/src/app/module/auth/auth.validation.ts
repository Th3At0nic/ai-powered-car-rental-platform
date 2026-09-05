import { z } from 'zod';

export const registerValidationSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters long')
      .max(100, 'Full name cannot exceed 100 characters'),

    email: z
      .string()
      .trim()
      .email('Please provide a valid email address')
      .toLowerCase(),

    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .max(100, 'Password cannot exceed 100 characters'),
  }),
});

export const loginValidationSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email('Please provide a valid email address')
      .toLowerCase(),

    password: z.string().min(1, 'Password is required'),
  }),
});
