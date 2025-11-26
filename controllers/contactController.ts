import { Request, Response } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Message from "../models/Message";

dotenv.config();

// GET: dohvatanje svih poruka
export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }); // najnovije prve
    return res.status(200).json(messages);
  } catch (error) {
    console.error("Greška pri dohvatanju poruka:", error);
    return res.status(500).json({ message: "Došlo je do greške" });
  }
};

// POST: kreiranje nove poruke
export const createMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;

    // Sačuvaj poruku u bazi sa status 'unread'
    const newMsg = new Message({ name, email, message, status: 'unread' });
    await newMsg.save();

    // Pošalji email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Business Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Novi upit sa sajta",
      html: `
        <h3>Novi upit sa sajta</h3>
        <p><b>Ime:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Poruka:</b><br>${message}</p>
      `,
    });

    return res.status(201).json({
      success: true,
      message: "Poruka uspešno poslata i sačuvana!",
      data: newMsg,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error });
  }
};

// DELETE: brisanje poruke
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

// PUT: označi poruku kao pročitanu
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
