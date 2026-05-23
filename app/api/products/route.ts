import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Product from "@/models/Product"
import ProductPriceHistory from "@/models/ProductPriceHistory"
import { productSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()
    const vendorId = req.nextUrl.searchParams.get("vendorId")
    const filter: Record<string, unknown> = {}
    if (vendorId) filter.vendorId = vendorId
    const products = await Product.find(filter).populate("vendorId", "name").sort({ createdAt: -1 }).lean()
    return NextResponse.json(products)
  } catch (error) {
    console.error("GET /api/products error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const body = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const product = await Product.create(parsed.data)

    // Create initial price history entry (v1)
    await ProductPriceHistory.create({
      productId: product._id,
      version: 1,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      effectiveDate: new Date(),
      changedBy: "system",
    })

    const populated = await Product.findById(product._id).populate("vendorId", "name").lean()
    return NextResponse.json(populated, { status: 201 })
  } catch (error: unknown) {
    console.error("POST /api/products error:", error)
    if (error && typeof error === "object" && "code" in error && (error as { code: number }).code === 11000) {
      return NextResponse.json({ error: "Product with this name already exists for this vendor" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
