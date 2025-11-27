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

// 🚨 ADD THE TRUST PROXY SETTING HERE 🚨
// This tells Express to trust the proxy headers (like X-Forwarded-For) 
// used by hosting platforms like Render.
app.set('trust proxy', 1); 

// Lista dozvoljenih origin-a
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL || ""  // npr: https://tvoj-frontend.vercel.app
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
    // ... rest of MongoDB setup ...
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