import { Router } from "express";
import { prisma } from "../prisma.js";
import type { ApiResponse, Job } from "../types.js";
import { nanoid } from "nanoid";

const router = Router();

// GET /jobs - list all jobs
router.get<{}, ApiResponse<Job[]>>("/", async (_req, res) => {
  const list = await prisma.job.findMany({ include: { company: true }, orderBy: { createdAt: "desc" } });
  const data: Job[] = list.map((j: any) => ({
    id: j.id,
    title: j.title,
    companyId: j.companyId,
    companyName: j.company?.name || "",
    type: (j.type as any).replace("_", "-") as Job["type"],
    location: j.location,
    salary: j.salary ?? undefined,
    description: j.description ?? undefined,
  }));
  res.json({ ok: true, data });
});

// GET /jobs/:id - get single job
router.get<{ id: string }, ApiResponse<Job>>("/:id", async (req, res) => {
  const j = await prisma.job.findUnique({ where: { id: req.params.id }, include: { company: true } });
  if (!j) return res.status(404).json({ ok: false, error: "Job not found" });
  const job: Job = {
    id: j.id,
    title: j.title,
    companyId: j.companyId,
    companyName: j.company?.name || "",
    type: (j.type as any).replace("_", "-") as Job["type"],
    location: j.location,
    salary: j.salary ?? undefined,
    description: j.description ?? undefined,
  };
  res.json({ ok: true, data: job });
});

// POST /jobs - create new job (assume recruiter)
router.post<{}, ApiResponse<Job>>("/", async (req, res) => {
  const { title, companyId, companyName, type, location, salary, description } = req.body ?? {};
  if (!title || !type || !location) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }

  // Resolve effective company
  let effectiveCompanyId: string;
  if (companyId) {
    effectiveCompanyId = companyId as string;
    if (companyName) {
      await prisma.company.upsert({
        where: { id: effectiveCompanyId },
        update: { name: companyName },
        create: { id: effectiveCompanyId, name: companyName },
      });
    }
  } else if (companyName) {
    effectiveCompanyId = nanoid();
    await prisma.company.create({ data: { id: effectiveCompanyId, name: companyName } });
  } else {
    effectiveCompanyId = "private";
    await prisma.company.upsert({
      where: { id: effectiveCompanyId },
      update: { name: "Private Client" },
      create: { id: effectiveCompanyId, name: "Private Client" },
    });
  }

  const j = await prisma.job.create({
    data: {
      title,
      companyId: effectiveCompanyId,
      type: (type as string).replace("-", "_") as any,
      location,
      salary,
      description,
    },
    include: { company: true },
  });
  const job: Job = {
    id: j.id,
    title: j.title,
    companyId: j.companyId,
    companyName: j.company?.name || "",
    type: (j.type as any).replace("_", "-") as Job["type"],
    location: j.location,
    salary: j.salary ?? undefined,
    description: j.description ?? undefined,
  };
  res.status(201).json({ ok: true, data: job });
});

export default router;
