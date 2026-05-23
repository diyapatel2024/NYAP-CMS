export interface IVendor {
  _id: string
  name: string
  location: string
  mobileNumber: string
  email: string
  status: "active" | "inactive"
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface IProduct {
  _id: string
  name: string
  description: string
  vendorId: string | IVendor
  unit: string
  currentPurchasePrice: number
  status: "active" | "inactive"
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface IProductPriceHistory {
  _id: string
  productId: string
  versionNumber: number
  versionName: string
  price: number
  effectiveDate: string
  isCurrent: boolean
  createdAt: string
}

export interface ICustomer {
  _id: string
  name: string
  username: string
  mobileNumber: string
  alternateMobileNumber: string
  email: string
  location: string
  status: "active" | "inactive"
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface ICustomerProduct {
  _id: string
  customerId: string | ICustomer
  productId: string | IProduct
  currentSellingPrice: number
  createdAt: string
  updatedAt: string
}

export interface ICustomerProductPriceHistory {
  _id: string
  customerProductId: string
  versionNumber: number
  versionName: string
  price: number
  basedOnVendorVersion: string
  effectiveDate: string
  isCurrent: boolean
  createdAt: string
}

export interface IOrder {
  _id: string
  customerId: string | ICustomer
  deliveryDate: string
  status: "Pending" | "Confirmed" | "Delivered" | "Cancelled"
  totalAmount: number
  notes: string
  items?: IOrderItem[]
  createdAt: string
  updatedAt: string
}

export interface IOrderItem {
  _id: string
  orderId: string
  productId: string | IProduct
  quantity: number
  defaultSellingPrice: number
  customPrice: number | null
  finalPriceUsed: number
  totalPrice: number
  priceVersionUsed: string
}

export interface IBulkOrder {
  _id: string
  customerName: string
  mobileNumber: string
  productId: string | IProduct
  quantity: number
  specialPrice: number
  deliveryDate: string
  notes: string
  status: "Pending" | "Confirmed" | "Delivered" | "Cancelled"
  createdAt: string
  updatedAt: string
}

export interface IUser {
  _id: string
  name: string
  email: string
  password?: string
  role: "admin" | "staff"
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalOrdersToday: number
  pendingOrders: number
  activeCustomers: number
  activeVendors: number
}

export interface TomorrowOrderSummary {
  productId: string
  productName: string
  unit: string
  totalQuantity: number
}

export interface VendorPurchaseSummary {
  vendorId: string
  vendorName: string
  productId: string
  productName: string
  unit: string
  totalQuantity: number
}
