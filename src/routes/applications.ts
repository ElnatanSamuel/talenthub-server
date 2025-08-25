import { Router } from "express";
import { prisma } from "../prisma.js";
import type { ApiResponse, Application, RecruiterApplication } from "../types.js";

const router = Router();

// GET /applications?userId=:userId - list candidate applications
router.get<{}, ApiResponse<Application[]>>("/", async (req, res) => {
  const { userId } = req.query as { userId?: string };
  const where = userId ? { userId } : {};
  const list = await prisma.application.findMany({ where, orderBy: { submittedAt: "desc" } });
  const data: Application[] = list.map((a: any) => ({
    id: a.id,
    jobId: a.jobId,
    userId: a.userId,
    status: a.status as Application["status"],
    submittedAt: a.submittedAt.toISOString(),
    note: a.note ?? undefined,
    applicantName: a.applicantName ?? undefined,
    applicantEmail: a.applicantEmail ?? undefined,
    linkedin: a.linkedin ?? undefined,
    portfolio: a.portfolio ?? undefined,
    coverLetter: a.coverLetter ?? undefined,
    resumeUrl: a.resumeUrl ?? undefined,
  }));
  res.json({ ok: true, data });
});

// GET /applications/recruiter?companyId=cmp_123 - list applications for jobs under a company (for recruiters)
router.get<{}, ApiResponse<RecruiterApplication[]>>("/recruiter", async (req, res) => {
  const { companyId } = req.query as { companyId?: string };
  // If companyId is not provided, return applications across all companies (dev-friendly fallback)
  const where = companyId ? { job: { companyId } } : undefined;
  const list = await prisma.application.findMany({
    where,
    include: { user: true, job: true },
    orderBy: { submittedAt: "desc" },
  });
  const data: RecruiterApplication[] = list.map((a: any) => ({
    id: a.id,
    jobId: a.jobId,
    jobTitle: a.job?.title || "",
    userId: a.userId,
    candidateName: a.user?.name || "",
    candidateEmail: a.user?.email || "",
    status: a.status,
    submittedAt: a.submittedAt.toISOString(),
  }));
  res.json({ ok: true, data });
});

// POST /applications - apply to job
router.post<{}, ApiResponse<Application>>("/", async (req, res) => {
  const { jobId, userId, note, applicantName, applicantEmail, linkedin, portfolio, coverLetter, resumeUrl } = req.body ?? {};
  if (!jobId || !userId) return res.status(400).json({ ok: false, error: "jobId and userId are required" });
  const a = await prisma.application.create({
    data: { jobId, userId, note, applicantName, applicantEmail, linkedin, portfolio, coverLetter, resumeUrl },
  });
  const app: Application = {
    id: a.id,
    jobId: a.jobId,
    userId: a.userId,
    status: a.status as Application["status"],
    submittedAt: a.submittedAt.toISOString(),
    note: a.note ?? undefined,
    applicantName: a.applicantName ?? undefined,
    applicantEmail: a.applicantEmail ?? undefined,
    linkedin: a.linkedin ?? undefined,
    portfolio: a.portfolio ?? undefined,
    coverLetter: a.coverLetter ?? undefined,
    resumeUrl: a.resumeUrl ?? undefined,
  };
  res.status(201).json({ ok: true, data: app });
});

export default router;
