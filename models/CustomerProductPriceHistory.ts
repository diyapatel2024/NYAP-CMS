import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface ICustomerProductPriceHistoryDoc extends Document {
  customerProductId: Types.ObjectId
  versionNumber: number
  versionName: string
  price: number
  basedOnVendorVersion: string
  effectiveDate: Date
  isCurrent: boolean
  createdAt: Date
}

const CustomerProductPriceHistorySchema = new Schema<ICustomerProductPriceHistoryDoc>(
  {
    customerProductId: { type: Schema.Types.ObjectId, ref: "CustomerProduct", required: true },
    versionNumber: { type: Number, required: true },
    versionName: { type: String, required: true },
    price: { type: Number, required: true },
    basedOnVendorVersion: { type: String, default: "" },
    effectiveDate: { type: Date, required: true, default: Date.now },
    isCurrent: { type: Boolean, default: true },
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
