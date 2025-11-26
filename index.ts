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

// Middleware za JSON
app.use(express.json());

// CORS middleware
const allowedOrigins = [
  "http://localhost:3000", 
  "https://tvoj-live-frontend.vercel.app" // zameni sa tvojim frontend URL-om
];

app.use(cors({
  origin: (origin, callback) => {
    // Dozvoli requests bez origin (npr. Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS policy: Origin not allowed"));
    }
  },
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  credentials: true
}));

// Preflight OPTIONS (nije obavezno, ali sigurno)
app.options("*", cors());

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
        role: "admin",
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

// Pokretanje servera lokalno
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server pokrenut na portu ${PORT}`);
  });
}

// Export za Vercel serverless
export default app;
