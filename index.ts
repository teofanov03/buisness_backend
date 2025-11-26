// index.ts

import express from "express";
import contactRoutes from "./routes/contactRoutes";
import authRoutes from "./routes/authRoutes";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User";
import bcrypt from "bcryptjs";
import cors from "cors"; // We still use this for the main response

dotenv.config();

const app = express();

// --- START: Comprehensive CORS Configuration ---

const allowedOrigins = [
    "http://localhost:3000", 
    // Add your deployed frontend URL here when it's live
    "https://tvoj-live-frontend.vercel.app" 
];

// 1. CORS Middleware for main requests (GET, POST, etc.)
app.use(cors({
  origin: (origin, callback) => {
    // Allows requests with no origin (like Postman or cURL)
    if (!origin) return callback(null, true); 
    if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    }
    return callback(null, true);
},
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  credentials: true,
}));



// --- END: Comprehensive CORS Configuration ---

// JSON middleware
app.use(express.json());

// ... (rest of the file remains the same)

// MongoDB konekcija i kreiranje default admina
mongoose.connect(process.env.MONGO_URI || "")
// ... (rest of the file)