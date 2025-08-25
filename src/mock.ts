import { nanoid } from "nanoid";
import type { Application, Job, User } from "./types.js";

// Users
export const users: User[] = [
  { id: "u1", name: "Alice Candidate", email: "alice@example.com", role: "candidate" },
  { id: "u2", name: "Bob Recruiter", email: "bob@company.com", role: "recruiter" },
];

// Jobs
export const jobs: Job[] = [
  {
    id: "j1",
    title: "Frontend Engineer",
    companyId: "c1",
    companyName: "Acme Corp",
    type: "full-time",
    location: "Remote",
    salary: "$100k - $130k",
    description: "Build and ship delightful web experiences with React/Next.js.",
  },
  {
    id: "j2",
    title: "Backend Engineer",
    companyId: "c2",
    companyName: "Globex",
    type: "full-time",
    location: "New York, NY (Hybrid)",
    salary: "$120k - $150k",
    description: "Design and maintain scalable APIs with Node.js/Express.",
  },
];

// Applications
export const applications: Application[] = [
  {
    id: "a1",
    jobId: "j1",
    userId: "u1",
    status: "applied",
    submittedAt: new Date().toISOString(),
  },
];

export function createUser(partial: Pick<User, "name" | "email" | "role">): User {
  const user: User = { id: nanoid(8), ...partial };
  users.push(user);
  return user;
}

export function createJob(partial: Omit<Job, "id">): Job {
  const job: Job = { id: nanoid(8), ...partial };
  jobs.push(job);
  return job;
}

export function createApplication(partial: Omit<Application, "id" | "submittedAt" | "status"> & { status?: Application["status"] }): Application {
  const app: Application = {
    id: nanoid(8),
    submittedAt: new Date().toISOString(),
    status: partial.status ?? "applied",
    jobId: partial.jobId,
    userId: partial.userId,
    note: partial.note,
  };
  applications.push(app);
  return app;
}
