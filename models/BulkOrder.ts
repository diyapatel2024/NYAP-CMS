import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IBulkOrderDoc extends Document {
  customerName: string
  mobileNumber: string
  productId: Types.ObjectId
  quantity: number
  specialPrice: number
  deliveryDate: Date
  notes: string
  status: "Pending" | "Confirmed" | "Delivered" | "Cancelled"
  createdAt: Date
  updatedAt: Date
}

const BulkOrderSchema = new Schema<IBulkOrderDoc>(
  {
    customerName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    specialPrice: { type: Number, required: true, default: 0 },
    deliveryDate: { type: Date, required: true },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
)

BulkOrderSchema.index({ deliveryDate: 1 })
BulkOrderSchema.index({ status: 1 })

export default mongoose.models.BulkOrder ||
  mongoose.model<IBulkOrderDoc>("BulkOrder", BulkOrderSchema)
