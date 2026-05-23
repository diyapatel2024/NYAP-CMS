import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import CustomerProduct from "@/models/CustomerProduct"
import CustomerProductPriceHistory from "@/models/CustomerProductPriceHistory"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const body = await req.json()
    const { customPrice } = body

    if (customPrice === undefined) {
      return NextResponse.json({ error: "customPrice is required" }, { status: 400 })
    }

    const existing = await CustomerProduct.findById(id)
    if (!existing) return NextResponse.json({ error: "Customer product not found" }, { status: 404 })

    // Only version if price changed
    if (existing.customPrice !== customPrice) {
      const lastHistory = await CustomerProductPriceHistory.findOne({ customerProductId: id }).sort({ version: -1 })
      const nextVersion = lastHistory ? lastHistory.version + 1 : 1
      await CustomerProductPriceHistory.create({
        customerProductId: id,
        customerId: existing.customerId,
        productId: existing.productId,
        version: nextVersion,
        customPrice,
        effectiveDate: new Date(),
        changedBy: "admin",
      })
    }

    existing.customPrice = customPrice
    await existing.save()

    const populated = await CustomerProduct.findById(id).populate("productId", "name unit").lean()
    return NextResponse.json(populated)
  } catch (error) {
    console.error("PUT /api/customer-products/[id] error:", error)
    return NextResponse.json({ error: "Failed to update customer product" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const cp = await CustomerProduct.findByIdAndDelete(id)
    if (!cp) return NextResponse.json({ error: "Customer product not found" }, { status: 404 })
    await CustomerProductPriceHistory.deleteMany({ customerProductId: id })
    return NextResponse.json({ message: "Customer product removed" })
  } catch (error) {
    console.error("DELETE /api/customer-products/[id] error:", error)
    return NextResponse.json({ error: "Failed to remove customer product" }, { status: 500 })
  }
}
