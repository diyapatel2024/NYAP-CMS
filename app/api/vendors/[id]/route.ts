import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Vendor from "@/models/Vendor"
import { vendorSchema } from "@/lib/validations"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const vendor = await Vendor.findById(id).lean()
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
    return NextResponse.json(vendor)
  } catch (error) {
    console.error("GET /api/vendors/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch vendor" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const body = await req.json()
    const parsed = vendorSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const vendor = await Vendor.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true })
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
    return NextResponse.json(vendor)
  } catch (error) {
    console.error("PUT /api/vendors/[id] error:", error)
    return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const vendor = await Vendor.findByIdAndDelete(id)
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
    return NextResponse.json({ message: "Vendor deleted" })
  } catch (error) {
    console.error("DELETE /api/vendors/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete vendor" }, { status: 500 })
  }
}
