import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IOrderItemDoc extends Document {
  orderId: Types.ObjectId
  productId: Types.ObjectId
  quantity: number
  defaultSellingPrice: number
  customPrice: number | null
  finalPriceUsed: number
  totalPrice: number
  priceVersionUsed: string
}

const OrderItemSchema = new Schema<IOrderItemDoc>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    defaultSellingPrice: { type: Number, required: true },
    customPrice: { type: Number, default: null },
    finalPriceUsed: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    priceVersionUsed: { type: String, default: "" },
  },
  { timestamps: true }
)

OrderItemSchema.index({ orderId: 1 })
OrderItemSchema.index({ productId: 1 })

export default mongoose.models.OrderItem ||
  mongoose.model<IOrderItemDoc>("OrderItem", OrderItemSchema)
