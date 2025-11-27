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
   // DANGER: Do not run this code in a production environment with sensitive keys!
 };

// --- POST: kreiranje nove poruke ---
 // contactController.ts
// ... imports and initial sgMail.setApiKey(process.env.SENDGRID_API_KEY || ''); ...

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, company, message } = req.body; 

    // 🚨 ADD FINAL SAFETY CHECK HERE 🚨
    const recipientEmail = process.env.EMAIL_USER;
    const senderEmail = process.env.SENDER_EMAIL;

    if (!recipientEmail || !senderEmail) {
        throw new Error(`Critical Environment Variable Missing: Recipient: ${recipientEmail}, Sender: ${senderEmail}`);
    }

    // 1. Save the message to the database
    const newMsg = new Message({ name, email, message, status: 'unread' });
    await newMsg.save();

    // 2. Send email using SendGrid API
    const msg = {
      to: recipientEmail, // Use the variable checked above
      from: senderEmail, // Use the variable checked above
      replyTo: email, 
      subject: `Novi upit sa sajta od: ${name}`,
      html: `...`,
    };

    await sgMail.send(msg); 

    // 3. Return success response
    return res.status(201).json({ success: true, message: "Poruka uspešno poslata i sačuvana!" });
  } catch (error: any) {
    // ... error logging ...
    return res.status(500).json({ success: false, message: "A critical error occurred." });
  }
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