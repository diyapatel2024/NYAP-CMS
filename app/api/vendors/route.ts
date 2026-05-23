import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Vendor from "@/models/Vendor"
import { vendorSchema } from "@/lib/validations"

export async function GET() {
  try {
    await dbConnect()
    const vendors = await Vendor.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json(vendors)
  } catch (error) {
    console.error("GET /api/vendors error:", error)
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const body = await req.json()
    const parsed = vendorSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const vendor = await Vendor.create(parsed.data)
    return NextResponse.json(vendor, { status: 201 })
  } catch (error: unknown) {
    console.error("POST /api/vendors error:", error)
    if (error && typeof error === "object" && "code" in error && (error as { code: number }).code === 11000) {
      return NextResponse.json({ error: "Vendor with this name already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 })
  }
}
