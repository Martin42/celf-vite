import express from "express";
import multer from "multer";
import {
  MailerSend,
  EmailParams,
  Sender,
  Recipient,
  Attachment
} from "mailersend";
import path from "path";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";

// Polyfill for __dirname
const __fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__fileName);

// Configure rate limiter
const sendEmailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Configure dotenv
dotenv.config();

// Configure express
const app = express();
app.use(express.static(path.join(__dirname, "../httpdocs")));

// Handle CORS issues
const allowedOrigins = [
  "https://www.celfcentrodeformacao.com",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(
          new Error(`CORS policy: No access control for origin ${origin}`)
        );
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

const port = import.meta.env.PORT || 3001;
const upload = multer({ storage: multer.memoryStorage() });

const mailerSend = new MailerSend({
  apiKey: import.meta.env.MAILERSEND_API_KEY
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper function to format HTML
function formatHtml(data) {
  let html = `
    <h2>Form Submission Details</h2>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
      <thead>
        <tr>
          <th style="background-color: #f2f2f2; text-align: left;">Field</th>
          <th style="background-color: #f2f2f2; text-align: left;">Value</th>
        </tr>
      </thead>
      <tbody>
  `;
  for (const [key, value] of Object.entries(data)) {
    html += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${key}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${value || "N/A"}</td>
      </tr>
    `;
  }
  html += `
      </tbody>
    </table>
  `;
  return html;
}

app.post(
  "/send-email",
  sendEmailRateLimiter,
  upload.array("files"),
  async (req, res) => {
    console.log(req.body);

    try {
      const sentFrom = new Sender(
        import.meta.env.MAILERSEND_EMAIL,
        req.body.Nome || "CELF User"
      );

      const recipients = [
        new Recipient(import.meta.env.MAILERSEND_RECIPIENT, "Admin")
      ];

      const attachments = req.files.map(
        (file) =>
          new Attachment(
            file.buffer.toString("base64"),
            file.originalname,
            "attachment"
          )
      );

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        .setAttachments(attachments)
        .setSubject("Requirimento de utilizador / Pré-Inscrição em curso")
        .setHtml(formatHtml(req.body))
        .setText("Veja os detalhes no corpo do email.");

      await mailerSend.email.send(emailParams);

      res.status(200).send("Email Enviado com Sucesso");
    } catch (error) {
      console.log("error sending email", error);
      res
        .status(500)
        .send("Erro a enviar o formulário, por favor tente outra vez");
    }
  }
);

// Catch-all for React frontend routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../httpdocs", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});
