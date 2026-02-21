import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Customer from "@/models/Customer"
import { customerSchema } from "@/lib/validations"

export async function GET() {
  try {
    await dbConnect()
    const customers = await Customer.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json(customers)
  } catch (error) {
    console.error("GET /api/customers error:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const body = await req.json()
    const parsed = customerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const customer = await Customer.create(parsed.data)
    return NextResponse.json(customer, { status: 201 })
  } catch (error: unknown) {
    console.error("POST /api/customers error:", error)
    if (error && typeof error === "object" && "code" in error && (error as { code: number }).code === 11000) {
      return NextResponse.json({ error: "Customer with this name already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
