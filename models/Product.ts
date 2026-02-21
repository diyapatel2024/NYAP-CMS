import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IProductDoc extends Document {
  name: string
  description: string
  vendorId: Types.ObjectId
  unit: string
  currentPurchasePrice: number
  status: "active" | "inactive"
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProductDoc>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    unit: { type: String, required: true, default: "kg" },
    currentPurchasePrice: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)

ProductSchema.index({ vendorId: 1 })
ProductSchema.index({ status: 1 })
ProductSchema.index({ isDeleted: 1 })

export default mongoose.models.Product || mongoose.model<IProductDoc>("Product", ProductSchema)
