import mongoose, { Schema, type Document } from "mongoose"

export interface IVendorDoc extends Document {
  name: string
  location: string
  mobileNumber: string
  email: string
  status: "active" | "inactive"
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

const VendorSchema = new Schema<IVendorDoc>(
  {
    name: { type: String, required: true },
    location: { type: String, default: "" },
    mobileNumber: { type: String, required: true },
    email: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)

VendorSchema.index({ status: 1 })
VendorSchema.index({ isDeleted: 1 })

export default mongoose.models.Vendor || mongoose.model<IVendorDoc>("Vendor", VendorSchema)
