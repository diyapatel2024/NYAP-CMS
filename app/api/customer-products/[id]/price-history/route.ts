import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import CustomerProductPriceHistory from "@/models/CustomerProductPriceHistory"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const history = await CustomerProductPriceHistory.find({ customerProductId: id })
      .sort({ version: -1 })
      .lean()
    return NextResponse.json(history)
  } catch (error) {
    console.error("GET /api/customer-products/[id]/price-history error:", error)
    return NextResponse.json({ error: "Failed to fetch price history" }, { status: 500 })
  }
}
