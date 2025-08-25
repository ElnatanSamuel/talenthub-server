import { Router } from "express";
import { prisma } from "../prisma.js";
import type { ApiResponse, User } from "../types.js";

const router = Router();

// GET /users - list users
router.get<{}, ApiResponse<User[]>>("/", async (_req, res) => {
  const list = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  const data: User[] = list.map((u: any) => ({ id: u.id, name: u.name, email: u.email, role: u.role as User["role"], companyId: u.companyId || undefined }));
  res.json({ ok: true, data });
});

// GET /users/:id - get user
router.get<{ id: string }, ApiResponse<User>>("/:id", async (req, res) => {
  const u = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!u) return res.status(404).json({ ok: false, error: "User not found" });
  const user: User = { id: u.id, name: u.name, email: u.email, role: u.role as User["role"], companyId: u.companyId || undefined };
  res.json({ ok: true, data: user });
});

// PUT /users/:id - update
router.put<{ id: string }, ApiResponse<User>>("/:id", async (req, res) => {
  const { name, email, role } = req.body ?? {};
  try {
    const u = await prisma.user.update({ where: { id: req.params.id }, data: { name, email, role } });
    const user: User = { id: u.id, name: u.name, email: u.email, role: u.role as User["role"], companyId: u.companyId || undefined };
    res.json({ ok: true, data: user });
  } catch (e) {
    return res.status(404).json({ ok: false, error: "User not found" });
  }
});

export default router;
