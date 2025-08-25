import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Companies
  const acme = await prisma.company.upsert({
    where: { id: "cmp_acme" },
    update: { name: "Acme Corp" },
    create: { id: "cmp_acme", name: "Acme Corp" },
  });
  const globex = await prisma.company.upsert({
    where: { id: "cmp_globex" },
    update: { name: "Globex Inc" },
    create: { id: "cmp_globex", name: "Globex Inc" },
  });

  // Users
  const pwdCandidate = await bcrypt.hash("candidate123", 10);
  const pwdRecruiter = await bcrypt.hash("recruiter123", 10);

  const candidate = await prisma.user.upsert({
    where: { email: "candidate@example.com" },
    update: { name: "Jane Candidate", role: "candidate", passwordHash: pwdCandidate },
    create: { name: "Jane Candidate", email: "candidate@example.com", role: "candidate", passwordHash: pwdCandidate },
  });

  const recruiter = await prisma.user.upsert({
    where: { email: "recruiter@example.com" },
    update: { name: "Rick Recruiter", role: "recruiter", companyId: acme.id, passwordHash: pwdRecruiter },
    create: { name: "Rick Recruiter", email: "recruiter@example.com", role: "recruiter", companyId: acme.id, passwordHash: pwdRecruiter },
  });

  // Jobs
  await prisma.job.upsert({
    where: { id: "job_fe_dev" },
    update: { title: "Frontend Developer", location: "Remote", type: "full_time", description: "Build beautiful UIs with React.", salary: "$90k-$120k" },
    create: { id: "job_fe_dev", title: "Frontend Developer", location: "Remote", type: "full_time", description: "Build beautiful UIs with React.", salary: "$90k-$120k", companyId: acme.id },
  });

  await prisma.job.upsert({
    where: { id: "job_be_node" },
    update: { title: "Backend Node Engineer", location: "Berlin, DE", type: "full_time", description: "APIs, databases, and performance.", salary: "€70k-€95k" },
    create: { id: "job_be_node", title: "Backend Node Engineer", location: "Berlin, DE", type: "full_time", description: "APIs, databases, and performance.", salary: "€70k-€95k", companyId: globex.id },
  });

  // Application example
  await prisma.application.upsert({
    where: { id: "app_demo_1" },
    update: { note: "Excited to contribute!" },
    create: { id: "app_demo_1", jobId: "job_fe_dev", userId: candidate.id, status: "applied", note: "Excited to contribute!" },
  });

  console.log("Seed complete.", { candidate: candidate.email, recruiter: recruiter.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
