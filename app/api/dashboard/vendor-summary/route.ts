import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Order from "@/models/Order"
import OrderItem from "@/models/OrderItem"
import Product from "@/models/Product"
import Vendor from "@/models/Vendor"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const dateParam = req.nextUrl.searchParams.get("date")
    const targetDate = dateParam ? new Date(dateParam) : new Date()
    const tomorrow = new Date(targetDate)
    if (!dateParam) {
      tomorrow.setDate(tomorrow.getDate() + 1)
    }
    tomorrow.setHours(0, 0, 0, 0)
    const dayAfter = new Date(tomorrow)
    dayAfter.setDate(dayAfter.getDate() + 1)

    // Get tomorrow's orders
    const orders = await Order.find({
      deliveryDate: { $gte: tomorrow, $lt: dayAfter },
    }).lean()

    const orderIds = orders.map((o) => o._id)
    const items = await OrderItem.find({
      orderId: { $in: orderIds },
    }).populate("productId", "name unit vendorId purchasePrice").lean()

    // Get all vendors
    const vendors = await Vendor.find().lean()
    const vendorMap = new Map(vendors.map((v) => [v._id.toString(), v.name]))

    // Get all products for vendor mapping
    const products = await Product.find().lean()
    const productVendorMap = new Map(products.map((p) => [p._id.toString(), p.vendorId?.toString()]))

    // Group by vendor then by product
    const vendorSummary: Record<string, {
      vendorName: string
      products: Record<string, {
        productName: string
        unit: string
        totalQty: number
        purchasePrice: number
        totalCost: number
      }>
      totalCost: number
    }> = {}

    for (const item of items) {
      const product = item.productId as unknown as {
        _id: { toString(): string }
        name: string
        unit: string
        vendorId: { toString(): string }
        purchasePrice: number
      }
      const vendorId = product.vendorId?.toString() || productVendorMap.get(product._id.toString()) || "unknown"
      const vendorName = vendorMap.get(vendorId) || "Unknown Vendor"

      if (!vendorSummary[vendorId]) {
        vendorSummary[vendorId] = { vendorName, products: {}, totalCost: 0 }
      }

      const pid = product._id.toString()
      if (!vendorSummary[vendorId].products[pid]) {
        vendorSummary[vendorId].products[pid] = {
          productName: product.name,
          unit: product.unit,
          totalQty: 0,
          purchasePrice: product.purchasePrice,
          totalCost: 0,
        }
      }

      vendorSummary[vendorId].products[pid].totalQty += item.quantity
      const cost = item.quantity * product.purchasePrice
      vendorSummary[vendorId].products[pid].totalCost += cost
      vendorSummary[vendorId].totalCost += cost
    }

    const result = Object.entries(vendorSummary).map(([vendorId, data]) => ({
      vendorId,
      vendorName: data.vendorName,
      totalCost: data.totalCost,
      products: Object.values(data.products),
    }))

    return NextResponse.json({
      date: tomorrow.toISOString(),
      vendors: result,
      totalPurchaseCost: result.reduce((sum, v) => sum + v.totalCost, 0),
    })
  } catch (error) {
    console.error("GET /api/dashboard/vendor-summary error:", error)
    return NextResponse.json({ error: "Failed to fetch vendor summary" }, { status: 500 })
  }
}
