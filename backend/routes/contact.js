import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

//--------------------------------------------------------------------------

dotenv.config();
const router = express.Router();

//--------------------------------------------------------------------------

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Alle Felder sind erforderlich." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_ADMIN,
        pass: process.env.MAIL_PASS,
      },
    });

  const mailOptions = {
      from: `"${name}" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_ADMIN,
      replyTo: email,
      subject: `Kontaktanfrage von ${name}`,
      text: `Web-App (Koch-buch)\nBenutzer Name: ${name}\nBenutzer E-Mail: ${email}\n\nNachricht:\n${message}`,
    };

  await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Nachricht erfolgreich gesendet." });
  } catch (error) {
    console.error("Fehler beim Senden:", error);
    res.status(500).json({ message: "Fehler beim Senden der Nachricht." });
  }
});

//--------------------------------------------------------------------------

export default router;