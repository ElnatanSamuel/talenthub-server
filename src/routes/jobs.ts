import { Router } from "express";
import { prisma } from "../prisma.js";
import type { ApiResponse, Job } from "../types.js";
import { nanoid } from "nanoid";

const router = Router();

// GET /jobs - list all jobs (with filters)
router.get<{}, ApiResponse<Job[]>>("/", async (req, res) => {
  const { q, location, type, companyId } = (req.query || {}) as Record<string, string | undefined>;

  // Build Prisma where clause
  const AND: any[] = [];
  if (q && q.trim()) {
    AND.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
        { company: { is: { name: { contains: q, mode: "insensitive" } } } },
      ],
    });
  }
  if (location && location.trim()) {
    AND.push({ location: { contains: location, mode: "insensitive" } });
  }
  if (companyId && companyId.trim()) {
    AND.push({ companyId });
  }
  if (type && type.trim()) {
    const types = type
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      // kebab-case -> enum with underscore
      .map((t) => (t.includes("-") ? t.replace("-", "_") : t)) as any[];
    if (types.length) {
      AND.push({ type: { in: types } });
    }
  }

  const where = AND.length ? { AND } : undefined;

  const list = await prisma.job.findMany({
    where,
    include: { company: true, _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });
  const data: Job[] = list.map((j: any) => ({
    id: j.id,
    title: j.title,
    companyId: j.companyId,
    companyName: j.company?.name || "",
    type: (j.type as any).replace("_", "-") as Job["type"],
    location: j.location,
    salary: j.salary ?? undefined,
    description: j.description ?? undefined,
    vacancies: j.vacancies ?? undefined,
    applicationsCount: j._count?.applications ?? 0,
  }));
  res.json({ ok: true, data });
});

// GET /jobs/:id - get single job
router.get<{ id: string }, ApiResponse<Job>>("/:id", async (req, res) => {
  const j = await prisma.job.findUnique({
    where: { id: req.params.id },
    include: { company: true, _count: { select: { applications: true } } },
  });
  if (!j) return res.status(404).json({ ok: false, error: "Job not found" });
  const job: Job = {
    id: j.id,
    title: j.title,
    companyId: j.companyId,
    companyName: (j as any).company?.name || "",
    type: (j.type as any).replace("_", "-") as Job["type"],
    location: j.location,
    salary: j.salary ?? undefined,
    description: j.description ?? undefined,
    vacancies: (j as any).vacancies ?? undefined,
    applicationsCount: (j as any)._count?.applications ?? 0,
  };
  res.json({ ok: true, data: job });
});

// POST /jobs - create new job (assume recruiter)
router.post<{}, ApiResponse<Job>>("/", async (req, res) => {
  const { title, companyId, companyName, type, location, salary, description, vacancies } = req.body ?? {};
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
    data: ({
      title,
      companyId: effectiveCompanyId,
      type: (type as string).replace("-", "_") as any,
      location,
      salary,
      description,
      vacancies: typeof vacancies === "number" ? vacancies : (Number.isFinite(Number(vacancies)) ? Number(vacancies) : undefined),
    }) as any,
    include: { company: true, _count: { select: { applications: true } } },
  });
  const job: Job = {
    id: j.id,
    title: j.title,
    companyId: j.companyId,
    companyName: (j as any).company?.name || "",
    type: (j.type as any).replace("_", "-") as Job["type"],
    location: j.location,
    salary: j.salary ?? undefined,
    description: j.description ?? undefined,
    vacancies: (j as any).vacancies ?? undefined,
    applicationsCount: (j as any)._count?.applications ?? 0,
  };
  res.status(201).json({ ok: true, data: job });
});

export default router;
