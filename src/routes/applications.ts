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

// GET /applications/:id - detailed view for recruiters
router.get<{}, ApiResponse<any>>("/:id", async (req, res) => {
  const { id } = req.params as { id: string };
  try {
    const a = await prisma.application.findUnique({
      where: { id },
      include: {
        job: { include: { company: true } },
        user: true,
      },
    });
    if (!a) return res.status(404).json({ ok: false, error: "Application not found" });

    const data = {
      id: a.id,
      status: a.status,
      submittedAt: a.submittedAt.toISOString(),
      note: a.note ?? undefined,
      applicantName: a.applicantName ?? undefined,
      applicantEmail: a.applicantEmail ?? undefined,
      linkedin: a.linkedin ?? undefined,
      portfolio: a.portfolio ?? undefined,
      coverLetter: a.coverLetter ?? undefined,
      resumeUrl: a.resumeUrl ?? undefined,
      job: {
        id: a.jobId,
        title: (a as any).job?.title || "",
        companyId: (a as any).job?.companyId || "",
        companyName: ((a as any).job?.company?.name as string) || "Private client",
      },
      candidate: {
        id: a.userId,
        name: (a as any).user?.name || "",
        email: (a as any).user?.email || "",
      },
    };
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Failed to fetch application" });
  }
});

// PATCH /applications/:id/status - update application status
router.patch<{}, ApiResponse<{ id: string; status: string }>>(
  "/:id/status",
  async (req, res) => {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status?: string };
    if (!status) return res.status(400).json({ ok: false, error: "status is required" });
    try {
      const updated = await prisma.application.update({
        where: { id },
        data: { status: status as any },
      });
      res.json({ ok: true, data: { id: updated.id, status: updated.status } });
    } catch (err) {
      res.status(500).json({ ok: false, error: "Failed to update status" });
    }
  }
);

export default router;
