import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IProductPriceHistoryDoc extends Document {
  productId: Types.ObjectId
  versionNumber: number
  versionName: string
  purchasePrice: number
  sellingPrice: number
  effectiveDate: Date
  isCurrent: boolean
  changedBy: string
  createdAt: Date
}

const ProductPriceHistorySchema = new Schema<IProductPriceHistoryDoc>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    versionNumber: { type: Number, required: true },
    versionName: { type: String, required: true },
    purchasePrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    effectiveDate: { type: Date, required: true, default: Date.now },
    isCurrent: { type: Boolean, default: true },
    changedBy: { type: String, default: "system" },
  },
  { timestamps: true }
)

ProductPriceHistorySchema.index({ productId: 1, isCurrent: 1 })
ProductPriceHistorySchema.index({ productId: 1, versionNumber: -1 })

export default mongoose.models.ProductPriceHistory ||
  mongoose.model<IProductPriceHistoryDoc>("ProductPriceHistory", ProductPriceHistorySchema)
