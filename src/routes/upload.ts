import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import type express from "express";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req: express.Request, _file: Express.Multer.File, cb: (error: any, destination: string) => void) =>
    cb(null, uploadsDir),
  filename: (_req: express.Request, file: Express.Multer.File, cb: (error: any, filename: string) => void) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || "";
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({ storage });

const router = Router();

router.post("/resume", upload.single("file"), (req: express.Request, res: express.Response) => {
  if (!req.file) return res.status(400).json({ ok: false, error: "No file uploaded" });
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ ok: true, data: { url } });
});

export default router;
