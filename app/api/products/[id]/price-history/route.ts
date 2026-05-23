import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import ProductPriceHistory from "@/models/ProductPriceHistory"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const history = await ProductPriceHistory.find({ productId: id }).sort({ version: -1 }).lean()
    return NextResponse.json(history)
  } catch (error) {
    console.error("GET /api/products/[id]/price-history error:", error)
    return NextResponse.json({ error: "Failed to fetch price history" }, { status: 500 })
  }
}
