import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface ICustomerProductDoc extends Document {
  customerId: Types.ObjectId
  productId: Types.ObjectId
  currentSellingPrice: number
  createdAt: Date
  updatedAt: Date
}

const CustomerProductSchema = new Schema<ICustomerProductDoc>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    currentSellingPrice: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
)

CustomerProductSchema.index({ customerId: 1, productId: 1 }, { unique: true })
CustomerProductSchema.index({ customerId: 1 })

export default mongoose.models.CustomerProduct ||
  mongoose.model<ICustomerProductDoc>("CustomerProduct", CustomerProductSchema)
