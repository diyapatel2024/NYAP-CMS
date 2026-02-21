import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("MONGODB_URI not set")
  process.exit(1)
}

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log("Connected to MongoDB")

  const db = mongoose.connection.db
  const usersCol = db.collection("users")

  const existing = await usersCol.findOne({ email: "admin@nyap.com" })
  if (existing) {
    console.log("Admin user already exists, skipping seed.")
  } else {
    const hashedPassword = await bcrypt.hash("admin123", 12)
    await usersCol.insertOne({
      name: "Admin",
      email: "admin@nyap.com",
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    console.log("Admin user created: admin@nyap.com / admin123")
  }

  await mongoose.disconnect()
  console.log("Seed complete")
}

seed().catch((err) => {
  console.error("Seed error:", err)
  process.exit(1)
})
