import { Request, Response } from "express";
// import nodemailer from "nodemailer"; // 👈 REMOVED (Not needed for SendGrid)
import dotenv from "dotenv"; // 👈 KEPT, but consider moving to index.ts
import sgMail from '@sendgrid/mail';
import Message from "../models/Message"; // 👈 ASSUMED IMPORT (Needed for Message model)

dotenv.config(); // 👈 Must run before setApiKey reads process.env
sgMail.setApiKey(process.env.SENDGRID_API_KEY || ''); // 👈 Set API Key

// --- GET: dohvatanje svih poruka ---
export const getMessages = async (req: Request, res: Response) => {
   try {
   const messages = await Message.find().sort({ createdAt: -1 }); // najnovije prve
   return res.status(200).json(messages);
   } catch (error) {
     console.error("Greška pri dohvatanju poruka:", error);
     return res.status(500).json({ message: "Došlo je do greške" });
  }
};

// --- POST: kreiranje nove poruke ---
 export const createMessage = async (req: Request, res: Response) => {
    // 🛑 DUMP ENTIRE ENVIRONMENT FOR DEBUGGING 🛑
    // This will send all environment variables set on Render to your browser.
    // DANGER: Do not run this code in a production environment with sensitive keys!
    
    const env_info = {
        EMAIL_USER_VALUE: process.env.EMAIL_USER,
        SENDER_EMAIL_VALUE: process.env.SENDER_EMAIL,
        ALL_KEYS: Object.keys(process.env).sort(), // List all keys available
    };

    // Return the environment variables to the client
    return res.status(200).json({
        success: true,
        message: "ENVIRONMENT DEBUG INFO RETURNED. CHECK CONSOLE.",
        data: env_info,
    });
};

// --- DELETE: brisanje poruke ---
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const msg = await Message.findByIdAndDelete(id);

    if (!msg) {
      return res.status(404).json({
        success: false,
        message: "Poruka nije pronađena",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Poruka obrisana",
    });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};

// --- PUT: označi poruku kao pročitanu ---
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const msg = await Message.findByIdAndUpdate(
      id,
      { status: 'read' },
      { new: true }
    );

    if (!msg) {
      return res.status(404).json({
        success: false,
        message: "Poruka nije pronađena",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Poruka označena kao pročitana",
      data: msg,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};