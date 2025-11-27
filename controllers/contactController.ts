import { Request, Response } from "express";
import Message from "../models/Message";

// GET: dohvatanje svih poruka
export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    return res.status(200).json(messages);
  } catch (error) {
    console.error("Greška pri dohvatanju poruka:", error);
    return res.status(500).json({ message: "Došlo je do greške" });
  }
};

// POST: kreiranje nove poruke (bez email slanja)
export const createMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, company, message } = req.body;

    // Validacija
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required.",
      });
    }

    // Kreiranje nove poruke u bazi
    const newMsg = new Message({
      name,
      email,
      company: company || "N/A",
      message,
      status: "unread",
      createdAt: new Date(),
    });

    await newMsg.save();

    // Vraćanje odgovora frontend-u
    return res.status(201).json({
      success: true,
      message: "Message saved successfully!",
      data: newMsg,
    });

  } catch (error) {
    console.error("Error while saving message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save message.",
    });
  }
};

// DELETE: brisanje poruke
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const messageId = req.params.id;

    await Message.findByIdAndDelete(messageId);

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });

  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete message.",
    });
  }
};

// PUT: označavanje poruke kao pročitane
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const messageId = req.params.id;

    const updated = await Message.findByIdAndUpdate(
      messageId,
      { status: "read" },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Message marked as read.",
      data: updated,
    });

  } catch (error) {
    console.error("Error updating message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update message.",
    });
  }
};
