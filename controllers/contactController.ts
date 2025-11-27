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
  try {
    const { name, email, company, message } = req.body; 

    // 1. Save the message to the database
    const newMsg = new Message({ name, email, message, status: 'unread' });
    await newMsg.save();

    // 2. Send email using SendGrid API
    const msg = {
  
      to: process.env.ADMIN_EMAIL!, 

      from: process.env.SENDER_EMAIL!, 
      replyTo: email, 
      subject: `Novi upit sa sajta od: ${name}`,
      html: `
        <h3>Novi upit sa sajta</h3>
        <p><b>Ime:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Kompanija:</b> ${company || 'N/A'}</p>
        <p><b>Poruka:</b><br>${message}</p>
      `,
    };

    await sgMail.send(msg); 

    // 3. Return success response to the client (Only one final return)
    return res.status(201).json({
      success: true,
      message: "Poruka uspešno poslata i sačuvana!",
      data: newMsg,
    });
  } catch (error: any) {
    // Log the SendGrid error details
    console.error("SendGrid Email API Error:", error.response?.body || error); 
    
    // Return a 500 error to ensure the button clears on failure
    return res.status(500).json({ 
        success: false, 
        message: "Message saved, but email notification failed. Check server logs." 
    });
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