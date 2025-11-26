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
const PORT = process.env.PORT || 5000;

// Lista dozvoljenih origin-a
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL || ""  // npr: https://tvoj-frontend.vercel.app
];

// CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// Middleware za JSON
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
app.get("/", (req, res) => res.send("Backend radi!"));

// Pokretanje servera
app.listen(PORT, () => console.log(`Server pokrenut na portu ${PORT}`));

export default app;
