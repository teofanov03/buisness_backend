import { Request, Response } from "express";
import Message from "../models/Message"; 
import * as sib from '@getbrevo/brevo'; // 👈 NEW BREVO IMPORT
import dotenv from "dotenv";

// Load environment variables (important for local testing and setup)
dotenv.config();

// --- BREVO INITIALIZATION ---
// Create a new API client instance
const apiInstance = new sib.TransactionalEmailsApi();

// Set the API Key (using the new BREVO_API_KEY environment variable)
apiInstance.setApiKey(
    sib.TransactionalEmailsApiApiKeys.apiKey, 
    process.env.BREVO_API_KEY || ''
);
// ----------------------------


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


// POST: kreiranje nove poruke
export const createMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, company, message } = req.body; 

    // Define environment variables with safety check
    const recipientEmail = process.env.EMAIL_USER;
    const senderEmail = process.env.SENDER_EMAIL;

    if (!recipientEmail || !senderEmail) {
        // This will now print a clear error to the Render logs if needed
        throw new Error("Missing email configuration (EMAIL_USER or SENDER_EMAIL).");
    }

    // 1. Configure the email message for Brevo
    const sendSmtpEmail = new sib.SendSmtpEmail();

    // TO (Recipient)
    sendSmtpEmail.to = [{ email: recipientEmail }];
    
    // FROM (Verified Sender)
    sendSmtpEmail.sender = { email: senderEmail, name: "Web Site Contact" }; // Use a professional name
    
    // REPLY-TO (The user who filled out the form)
    sendSmtpEmail.replyTo = { email: email };
    
    sendSmtpEmail.subject = `Novi upit sa sajta od: ${name}`;
    sendSmtpEmail.htmlContent = `
        <h3>Novi upit sa sajta</h3>
        <p><b>Ime:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Kompanija:</b> ${company || 'N/A'}</p>
        <p><b>Poruka:</b><br>${message}</p>
    `;

    // 2. Send the email via Brevo API
    await apiInstance.sendTransacEmail(sendSmtpEmail);

    // 3. Save the message to the database
    const newMsg = new Message({ name, email, message, status: 'unread' });
    await newMsg.save();

    // 4. Return success response
    return res.status(201).json({
      success: true,
      message: "Poruka uspešno poslata i sačuvana!",
      data: newMsg,
    });
  } catch (error: any) {
    console.error("Brevo Email API Error:", error.response?.text || error.message || error); 
    
    return res.status(500).json({ 
        success: false, 
        message: "Message saved, but email notification failed. Check server logs." 
    });
  }
};


// DELETE: brisanje poruke
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    // ... (Keep your existing deleteMessage function) ...
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};

// PUT: označi poruku kao pročitanu
export const markAsRead = async (req: Request, res: Response) => {
  try {
    // ... (Keep your existing markAsRead function) ...
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};