import mongoose, { Schema, type Document } from "mongoose"

export interface IUserDoc extends Document {
  name: string
  email: string
  password: string
  role: "admin" | "staff"
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUserDoc>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "staff"], default: "staff" },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model<IUserDoc>("User", UserSchema)
