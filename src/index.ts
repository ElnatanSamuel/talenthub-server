import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.js";
import jobRoutes from "./routes/jobs.js";
import applicationRoutes from "./routes/applications.js";
import userRoutes from "./routes/users.js";
import uploadRoutes from "./routes/upload.js";

const app = express();
const PORT = Number(process.env.PORT || 4000);

// Trust proxy for correct protocol/host behind Render/NGINX
app.set("trust proxy", 1);

// CORS with explicit headers/methods to allow Authorization from web
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Preflight
app.options("*", cors({ origin: true, credentials: true }))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health
app.get(["/", "/health"], (_req, res) => {
  res.json({ ok: true, name: "TalentHub Mock API", version: "0.1.0" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/jobs", jobRoutes);
app.use("/applications", applicationRoutes);
app.use("/users", userRoutes);
app.use("/upload", uploadRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ ok: false, error: `Route not found: ${req.method} ${req.path}` });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("API Error:", err);
  res.status(500).json({ ok: false, error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`TalentHub API listening on http://localhost:${PORT}`);
});
