import mongoose, { Schema, type Document } from "mongoose"

export interface ICustomerDoc extends Document {
  name: string
  username: string
  mobileNumber: string
  alternateMobileNumber: string
  email: string
  location: string
  status: "active" | "inactive"
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

const CustomerSchema = new Schema<ICustomerDoc>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    mobileNumber: { type: String, required: true },
    alternateMobileNumber: { type: String, default: "" },
    email: { type: String, default: "" },
    location: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)

CustomerSchema.index({ username: 1 }, { unique: true })
CustomerSchema.index({ mobileNumber: 1 })
CustomerSchema.index({ status: 1 })
CustomerSchema.index({ isDeleted: 1 })

export default mongoose.models.Customer || mongoose.model<ICustomerDoc>("Customer", CustomerSchema)
