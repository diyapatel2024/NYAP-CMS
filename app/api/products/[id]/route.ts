import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Product from "@/models/Product"
import ProductPriceHistory from "@/models/ProductPriceHistory"
import { productSchema } from "@/lib/validations"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const product = await Product.findById(id).populate("vendorId", "name").lean()
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })
    return NextResponse.json(product)
  } catch (error) {
    console.error("GET /api/products/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const body = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const existing = await Product.findById(id)
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    // Check if prices changed — create new version
    const priceChanged =
      existing.purchasePrice !== parsed.data.purchasePrice ||
      existing.sellingPrice !== parsed.data.sellingPrice

    if (priceChanged) {
      const lastHistory = await ProductPriceHistory.findOne({ productId: id }).sort({ version: -1 })
      const nextVersion = lastHistory ? lastHistory.version + 1 : 1
      await ProductPriceHistory.create({
        productId: id,
        version: nextVersion,
        purchasePrice: parsed.data.purchasePrice,
        sellingPrice: parsed.data.sellingPrice,
        effectiveDate: new Date(),
        changedBy: "admin",
      })
    }

    const product = await Product.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true }).populate("vendorId", "name")
    return NextResponse.json(product)
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const product = await Product.findByIdAndDelete(id)
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })
    // Also clean up price history
    await ProductPriceHistory.deleteMany({ productId: id })
    return NextResponse.json({ message: "Product deleted" })
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
