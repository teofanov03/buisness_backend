import express from "express";
import contactRoutes from "./routes/contactRoutes";
import authRoutes from "./routes/authRoutes";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware za JSON
app.use(express.json());

// **CORS Middleware za serverless i preflight**
app.use((req, res, next) => {
  // Dozvoli lokalni frontend i live frontend
  res.header(
    "Access-Control-Allow-Origin",
    "http://localhost:3000, https://tvoj-live-frontend.vercel.app"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  
  // Odmah odgovori na OPTIONS request (preflight)
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// MongoDB konekcija i kreiranje default admina
mongoose
  .connect(process.env.MONGO_URI || "")
  .then(async () => {
    console.log("MongoDB povezan");

    const admin = await User.findOne({ username: "admin" });
    if (!admin) {
      const hashed = await bcrypt.hash("admin123", 10);
      await User.create({
        username: "admin",
        password: hashed,
        role: "admin",
      });
      console.log("Default admin kreiran: admin / admin123");
    }
  })
  .catch((err) => console.error("MongoDB greška:", err));

// Rute
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);

// Test ruta
app.get("/", (req, res) => {
  res.send("Backend radi!");
});

// Pokretanje servera (lokalno)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server pokrenut na portu ${PORT}`);
  });
}

export default app; // za Vercel serverless
