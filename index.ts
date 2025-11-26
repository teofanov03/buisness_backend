import express from "express";
import contactRoutes from "./routes/contactRoutes";
import authRoutes from "./routes/authRoutes";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User";
import bcrypt from "bcryptjs";
import cors from "cors";

dotenv.config();

const app = express();

// **CORS middleware za serverless**
const allowedOrigins = [
    "http://localhost:3000", 
    // IMPORTANT: Replace this with the live URL of your frontend when you deploy it
    "https://tvoj-live-frontend.vercel.app" 
];

app.use(cors({
  origin: allowedOrigins, // Use the array for simple checking
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  credentials: true,
}));

// JSON middleware
app.use(express.json());

// MongoDB konekcija i kreiranje default admina
mongoose.connect(process.env.MONGO_URI || "")
  .then(async () => {
    console.log("MongoDB povezan");

    const admin = await User.findOne({ username: "admin" });
    if (!admin) {
      const hashed = await bcrypt.hash("admin123", 10);
      await User.create({
        username: "admin",
        password: hashed,
        role: "admin"
      });
      console.log("Default admin kreiran: admin / admin123");
    }
  })
  .catch(err => console.error("MongoDB greška:", err));

// Rute
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);

// Test ruta
app.get("/", (req, res) => {
  res.send("Backend radi!");
});

// **Ne koristiti app.listen() na Vercel serverless**
export default app;
