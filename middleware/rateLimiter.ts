import rateLimit from "express-rate-limit";

export const contactLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minut
  max: 5, // maksimalno 5 zahteva po IP u 1 minut
  message: {
    message: "Too many messages sent from this IP, please try again later.",
  },
  standardHeaders: true, // vraća rate limit info u headers
  legacyHeaders: false,  // isključuje X-RateLimit-* headers
});