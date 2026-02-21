import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Order from "@/models/Order"
import OrderItem from "@/models/OrderItem"
import CustomerProduct from "@/models/CustomerProduct"
import Product from "@/models/Product"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()
    const status = req.nextUrl.searchParams.get("status")
    const customerId = req.nextUrl.searchParams.get("customerId")
    const deliveryDate = req.nextUrl.searchParams.get("deliveryDate")

    const filter: Record<string, unknown> = {}
    if (status) filter.status = status
    if (customerId) filter.customerId = customerId
    if (deliveryDate) {
      const date = new Date(deliveryDate)
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)
      filter.deliveryDate = { $gte: date, $lt: nextDay }
    }

    const orders = await Order.find(filter)
      .populate("customerId", "name businessName route")
      .sort({ createdAt: -1 })
      .lean()

    // Attach items to each order
    const orderIds = orders.map((o) => o._id)
    const items = await OrderItem.find({ orderId: { $in: orderIds } })
      .populate("productId", "name unit")
      .lean()

    const itemsByOrder: Record<string, typeof items> = {}
    for (const item of items) {
      const key = item.orderId.toString()
      if (!itemsByOrder[key]) itemsByOrder[key] = []
      itemsByOrder[key].push(item)
    }

    const ordersWithItems = orders.map((o) => ({
      ...o,
      items: itemsByOrder[o._id.toString()] || [],
    }))

    return NextResponse.json(ordersWithItems)
  } catch (error) {
    console.error("GET /api/orders error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const body = await req.json()
    const { customerId, deliveryDate, notes, items } = body

    if (!customerId || !deliveryDate || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "customerId, deliveryDate, and at least one item are required" }, { status: 400 })
    }

    // Calculate total
    let totalAmount = 0
    const processedItems = []

    for (const item of items) {
      const { productId, quantity, priceOverride } = item

      // Get the customer-specific price or fallback to product selling price
      let finalPrice = priceOverride
      if (!finalPrice) {
        const cp = await CustomerProduct.findOne({ customerId, productId })
        if (cp) {
          finalPrice = cp.customPrice
        } else {
          const product = await Product.findById(productId)
          finalPrice = product?.sellingPrice || 0
        }
      }

      const itemTotal = finalPrice * quantity
      totalAmount += itemTotal

      processedItems.push({
        productId,
        quantity,
        finalPriceUsed: finalPrice,
        itemTotal,
      })
    }

    // Create order
    const order = await Order.create({
      customerId,
      deliveryDate: new Date(deliveryDate),
      status: "pending",
      totalAmount,
      notes: notes || "",
    })

    // Create order items
    for (const item of processedItems) {
      await OrderItem.create({
        orderId: order._id,
        ...item,
      })
    }

    const populated = await Order.findById(order._id)
      .populate("customerId", "name businessName route")
      .lean()

    return NextResponse.json(populated, { status: 201 })
  } catch (error) {
    console.error("POST /api/orders error:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
