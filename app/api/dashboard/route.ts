import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Order from "@/models/Order"
import OrderItem from "@/models/OrderItem"
import Customer from "@/models/Customer"
import Vendor from "@/models/Vendor"
import Product from "@/models/Product"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const dateParam = req.nextUrl.searchParams.get("date")
    const targetDate = dateParam ? new Date(dateParam) : new Date()
    // Set to tomorrow by default
    const tomorrow = new Date(targetDate)
    if (!dateParam) {
      tomorrow.setDate(tomorrow.getDate() + 1)
    }
    tomorrow.setHours(0, 0, 0, 0)
    const dayAfter = new Date(tomorrow)
    dayAfter.setDate(dayAfter.getDate() + 1)

    // Stat cards
    const [totalCustomers, totalVendors, totalProducts, totalOrders] = await Promise.all([
      Customer.countDocuments({ status: "active" }),
      Vendor.countDocuments({ status: "active" }),
      Product.countDocuments({ status: "active" }),
      Order.countDocuments(),
    ])

    // Today's orders
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date(today)
    todayEnd.setDate(todayEnd.getDate() + 1)
    const todaysOrders = await Order.countDocuments({
      deliveryDate: { $gte: today, $lt: todayEnd },
    })

    // Tomorrow's orders summary (grouped by product)
    const tomorrowOrders = await Order.find({
      deliveryDate: { $gte: tomorrow, $lt: dayAfter },
    }).lean()

    const tomorrowOrderIds = tomorrowOrders.map((o) => o._id)
    const tomorrowItems = await OrderItem.find({
      orderId: { $in: tomorrowOrderIds },
    }).populate("productId", "name unit vendorId").lean()

    // Group by product
    const productSummary: Record<string, { productName: string; unit: string; totalQty: number; totalValue: number; vendorId: string }> = {}
    for (const item of tomorrowItems) {
      const pid = item.productId._id.toString()
      if (!productSummary[pid]) {
        productSummary[pid] = {
          productName: (item.productId as unknown as { name: string }).name,
          unit: (item.productId as unknown as { unit: string }).unit,
          totalQty: 0,
          totalValue: 0,
          vendorId: (item.productId as unknown as { vendorId: string }).vendorId?.toString() || "",
        }
      }
      productSummary[pid].totalQty += item.quantity
      productSummary[pid].totalValue += item.itemTotal
    }

    // Pending orders revenue
    const pendingOrders = await Order.find({ status: "pending" }).lean()
    const pendingRevenue = pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0)

    // Recent orders
    const recentOrders = await Order.find()
      .populate("customerId", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()

    return NextResponse.json({
      stats: {
        totalCustomers,
        totalVendors,
        totalProducts,
        totalOrders,
        todaysOrders,
        pendingRevenue,
      },
      tomorrowSummary: {
        date: tomorrow.toISOString(),
        totalOrders: tomorrowOrders.length,
        products: Object.values(productSummary),
      },
      recentOrders,
    })
  } catch (error) {
    console.error("GET /api/dashboard error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
