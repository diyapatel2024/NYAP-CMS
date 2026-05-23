import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import CustomerProduct from "@/models/CustomerProduct"
import CustomerProductPriceHistory from "@/models/CustomerProductPriceHistory"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const products = await CustomerProduct.find({ customerId: id })
      .populate("productId", "name unit")
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json(products)
  } catch (error) {
    console.error("GET /api/customers/[id]/products error:", error)
    return NextResponse.json({ error: "Failed to fetch customer products" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const body = await req.json()
    const { productId, customPrice } = body

    if (!productId || customPrice === undefined) {
      return NextResponse.json({ error: "productId and customPrice are required" }, { status: 400 })
    }

    // Check for existing assignment
    const existing = await CustomerProduct.findOne({ customerId: id, productId })
    if (existing) {
      return NextResponse.json({ error: "Product already assigned to this customer" }, { status: 409 })
    }

    const cp = await CustomerProduct.create({
      customerId: id,
      productId,
      customPrice,
    })

    // Create initial price history
    await CustomerProductPriceHistory.create({
      customerProductId: cp._id,
      customerId: id,
      productId,
      version: 1,
      customPrice,
      effectiveDate: new Date(),
      changedBy: "admin",
    })

    const populated = await CustomerProduct.findById(cp._id).populate("productId", "name unit").lean()
    return NextResponse.json(populated, { status: 201 })
  } catch (error) {
    console.error("POST /api/customers/[id]/products error:", error)
    return NextResponse.json({ error: "Failed to assign product" }, { status: 500 })
  }
}
