import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import BulkOrder from "@/models/BulkOrder"
import Order from "@/models/Order"
import OrderItem from "@/models/OrderItem"
import CustomerProduct from "@/models/CustomerProduct"
import Customer from "@/models/Customer"
import Product from "@/models/Product"

export async function GET() {
  try {
    await dbConnect()
    const bulkOrders = await BulkOrder.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json(bulkOrders)
  } catch (error) {
    console.error("GET /api/bulk-orders error:", error)
    return NextResponse.json({ error: "Failed to fetch bulk orders" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const body = await req.json()
    const { deliveryDate, notes } = body

    if (!deliveryDate) {
      return NextResponse.json({ error: "deliveryDate is required" }, { status: 400 })
    }

    // Get all active customers
    const customers = await Customer.find({ status: "active" }).lean()
    if (customers.length === 0) {
      return NextResponse.json({ error: "No active customers found" }, { status: 400 })
    }

    const orderIds: string[] = []
    let totalAmount = 0
    let totalOrders = 0

    for (const customer of customers) {
      // Get customer's assigned products
      const customerProducts = await CustomerProduct.find({ customerId: customer._id })
        .populate("productId")
        .lean()

      if (customerProducts.length === 0) continue

      // Create order for this customer
      let orderTotal = 0
      const itemsToCreate = []

      for (const cp of customerProducts) {
        const product = cp.productId as unknown as { _id: string; sellingPrice: number }
        const finalPrice = cp.customPrice || product.sellingPrice
        const quantity = 1 // Default quantity for bulk orders
        const itemTotal = finalPrice * quantity

        itemsToCreate.push({
          productId: product._id,
          quantity,
          finalPriceUsed: finalPrice,
          itemTotal,
        })
        orderTotal += itemTotal
      }

      const order = await Order.create({
        customerId: customer._id,
        deliveryDate: new Date(deliveryDate),
        status: "pending",
        totalAmount: orderTotal,
        notes: notes || "Auto-generated from bulk order",
      })

      for (const item of itemsToCreate) {
        await OrderItem.create({ orderId: order._id, ...item })
      }

      orderIds.push(order._id.toString())
      totalAmount += orderTotal
      totalOrders++
    }

    const bulkOrder = await BulkOrder.create({
      deliveryDate: new Date(deliveryDate),
      orderIds,
      totalOrders,
      totalAmount,
      status: "processing",
      notes: notes || "",
    })

    // Mark as completed
    await BulkOrder.findByIdAndUpdate(bulkOrder._id, { status: "completed" })

    return NextResponse.json({ ...bulkOrder.toObject(), status: "completed" }, { status: 201 })
  } catch (error) {
    console.error("POST /api/bulk-orders error:", error)
    return NextResponse.json({ error: "Failed to create bulk order" }, { status: 500 })
  }
}
