import { Router } from "express";
import { createMessage, getMessages, deleteMessage, markAsRead } from "../controllers/contactController";
import { authMiddleware } from "../middleware/authMiddleware";
import { contactLimiter } from "../middleware/rateLimiter";

const router = Router();

// Public
router.post("/",contactLimiter, createMessage);

// Protected
router.get("/messages", authMiddleware, getMessages);
router.delete("/messages/:id", authMiddleware, deleteMessage);
router.put("/messages/:id/read", authMiddleware, markAsRead);

export default router;
