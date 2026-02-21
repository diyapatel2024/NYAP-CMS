import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Order from "@/models/Order"
import OrderItem from "@/models/OrderItem"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const order = await Order.findById(id)
      .populate("customerId", "name businessName route phone")
      .lean()
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    const items = await OrderItem.find({ orderId: id })
      .populate("productId", "name unit")
      .lean()

    return NextResponse.json({ ...order, items })
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const body = await req.json()
    const { status, notes } = body

    const update: Record<string, unknown> = {}
    if (status) update.status = status
    if (notes !== undefined) update.notes = notes

    const order = await Order.findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .populate("customerId", "name businessName route")
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    return NextResponse.json(order)
  } catch (error) {
    console.error("PUT /api/orders/[id] error:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const order = await Order.findByIdAndDelete(id)
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    await OrderItem.deleteMany({ orderId: id })
    return NextResponse.json({ message: "Order deleted" })
  } catch (error) {
    console.error("DELETE /api/orders/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
  }
}
