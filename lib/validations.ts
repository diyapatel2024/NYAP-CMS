import { z } from "zod"

export const vendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().optional().default(""),
  mobileNumber: z.string().min(1, "Mobile number is required"),
  email: z.string().email().optional().or(z.literal("")).default(""),
  status: z.enum(["active", "inactive"]).default("active"),
})

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().default(""),
  vendorId: z.string().min(1, "Vendor is required"),
  unit: z.string().min(1, "Unit is required"),
  currentPurchasePrice: z.coerce.number().min(0, "Price must be >= 0"),
  status: z.enum(["active", "inactive"]).default("active"),
})

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  mobileNumber: z.string().min(1, "Mobile number is required"),
  alternateMobileNumber: z.string().optional().default(""),
  email: z.string().email().optional().or(z.literal("")).default(""),
  location: z.string().optional().default(""),
  status: z.enum(["active", "inactive"]).default("active"),
})

export const customerProductSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  currentSellingPrice: z.coerce.number().min(0, "Price must be >= 0"),
})

export const orderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be > 0"),
  customPrice: z.coerce.number().nullable().optional(),
})

export const orderSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  notes: z.string().optional().default(""),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
})

export const bulkOrderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  mobileNumber: z.string().min(1, "Mobile number is required"),
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be > 0"),
  specialPrice: z.coerce.number().min(0, "Price must be >= 0"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  notes: z.string().optional().default(""),
})

export const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "staff"]).default("staff"),
})

export type VendorInput = z.infer<typeof vendorSchema>
export type ProductInput = z.infer<typeof productSchema>
export type CustomerInput = z.infer<typeof customerSchema>
export type CustomerProductInput = z.infer<typeof customerProductSchema>
export type OrderInput = z.infer<typeof orderSchema>
export type OrderItemInput = z.infer<typeof orderItemSchema>
export type BulkOrderInput = z.infer<typeof bulkOrderSchema>
export type UserInput = z.infer<typeof userSchema>
