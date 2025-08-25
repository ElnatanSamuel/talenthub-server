export type Role = "candidate" | "recruiter";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId?: string;
}

export interface Job {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  location: string;
  salary?: string;
  description?: string;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string; // candidate id
  status: "applied" | "review" | "interview" | "rejected" | "hired";
  submittedAt: string; // ISO
  note?: string;
  applicantName?: string;
  applicantEmail?: string;
  linkedin?: string;
  portfolio?: string;
  coverLetter?: string;
  resumeUrl?: string;
}

export interface RecruiterApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  userId: string;
  candidateName: string;
  candidateEmail: string;
  status: "applied" | "review" | "interview" | "rejected" | "hired";
  submittedAt: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
