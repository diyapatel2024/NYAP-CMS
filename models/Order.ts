import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IOrderDoc extends Document {
  customerId: Types.ObjectId
  deliveryDate: Date
  status: "Pending" | "Confirmed" | "Delivered" | "Cancelled"
  totalAmount: number
  notes: string
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrderDoc>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    deliveryDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Delivered", "Cancelled"],
      default: "Pending",
    },
    totalAmount: { type: Number, required: true, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
)

OrderSchema.index({ deliveryDate: 1 })
OrderSchema.index({ customerId: 1 })
OrderSchema.index({ status: 1 })

export default mongoose.models.Order || mongoose.model<IOrderDoc>("Order", OrderSchema)
