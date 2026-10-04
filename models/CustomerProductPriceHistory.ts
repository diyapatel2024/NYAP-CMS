import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface ICustomerProductPriceHistoryDoc extends Document {
  customerProductId: Types.ObjectId
  customerId: Types.ObjectId
  productId: Types.ObjectId
  versionNumber: number
  versionName: string
  customPrice: number
  effectiveDate: Date
  isCurrent: boolean
  changedBy: string
  createdAt: Date
}

const CustomerProductPriceHistorySchema = new Schema<ICustomerProductPriceHistoryDoc>(
  {
    customerProductId: { type: Schema.Types.ObjectId, ref: "CustomerProduct", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    versionNumber: { type: Number, required: true },
    versionName: { type: String, required: true },
    customPrice: { type: Number, required: true },
    effectiveDate: { type: Date, required: true, default: Date.now },
    isCurrent: { type: Boolean, default: true },
    changedBy: { type: String, default: "system" },
  },
  { timestamps: true }
)

CustomerProductPriceHistorySchema.index({ customerProductId: 1, isCurrent: 1 })
CustomerProductPriceHistorySchema.index({ customerProductId: 1, versionNumber: -1 })

export default mongoose.models.CustomerProductPriceHistory ||
  mongoose.model<ICustomerProductPriceHistoryDoc>(
    "CustomerProductPriceHistory",
    CustomerProductPriceHistorySchema
  )
