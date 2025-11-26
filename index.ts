import express from "express";
import contactRoutes from "./routes/contactRoutes";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes";
import User from "./models/User";
import bcrypt from "bcryptjs";

dotenv.config();
mongoose.connect(process.env.MONGO_URI || "")
  .then(async () => {
    console.log("MongoDB povezan");

    // Kreiranje admina ako ne postoji
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
 


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);

// Test ruta
app.get("/", (req, res) => {
  res.send("Backend radi!");
});

// Pokretanje servera
app.listen(PORT, () => {
  console.log(`Server je pokrenut na portu ${PORT}`);
});
