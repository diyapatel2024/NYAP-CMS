import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Customer from "@/models/Customer"
import { customerSchema } from "@/lib/validations"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const customer = await Customer.findById(id).lean()
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    return NextResponse.json(customer)
  } catch (error) {
    console.error("GET /api/customers/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const body = await req.json()
    const parsed = customerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const customer = await Customer.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true })
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    return NextResponse.json(customer)
  } catch (error) {
    console.error("PUT /api/customers/[id] error:", error)
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const customer = await Customer.findByIdAndDelete(id)
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    return NextResponse.json({ message: "Customer deleted" })
  } catch (error) {
    console.error("DELETE /api/customers/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}
