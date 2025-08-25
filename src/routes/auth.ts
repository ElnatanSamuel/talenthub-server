import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";
import type { ApiResponse, User } from "../types.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

function signToken(user: User) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}

// POST /auth/login
router.post<{}, ApiResponse<{ token: string; user: User }>>("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ ok: false, error: "email and password are required" });
    const dbUser = await prisma.user.findUnique({ where: { email } });
    if (!dbUser || !dbUser.passwordHash) return res.status(401).json({ ok: false, error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, dbUser.passwordHash);
    if (!ok) return res.status(401).json({ ok: false, error: "Invalid credentials" });
    const user: User = { id: dbUser.id, name: dbUser.name, email: dbUser.email, role: dbUser.role as User["role"], companyId: dbUser.companyId || undefined };
    const token = signToken(user);
    res.json({ ok: true, data: { token, user } });
  } catch (err) {
    console.error("/auth/login error", err);
    res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
});

// POST /auth/register
router.post<{}, ApiResponse<{ token: string; user: User }>>("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body ?? {};
    if (!name || !email || !password) return res.status(400).json({ ok: false, error: "name, email, password are required" });
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ ok: false, error: "Email already in use" });
    const passwordHash = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({ data: { name, email, role: (role || "candidate"), passwordHash } });
    const user: User = { id: created.id, name: created.name, email: created.email, role: created.role as User["role"], companyId: created.companyId || undefined };
    const token = signToken(user);
    res.status(201).json({ ok: true, data: { token, user } });
  } catch (err) {
    console.error("/auth/register error", err);
    res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
});

// POST /auth/logout
router.post<{}, ApiResponse<null>>("/logout", (_req, res) => {
  res.json({ ok: true, data: null });
});

export default router;
