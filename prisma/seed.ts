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

  const audacity = await prisma.company.upsert({
    where: { id: "cmp_audacity" },
    update: { name: "AudaCity Capital" },
    create: { id: "cmp_audacity", name: "AudaCity Capital" },
  });
  const technova = await prisma.company.upsert({
    where: { id: "cmp_technova" },
    update: { name: "TechNova Labs" },
    create: { id: "cmp_technova", name: "TechNova Labs" },
  });
  const healthplus = await prisma.company.upsert({
    where: { id: "cmp_healthplus" },
    update: { name: "HealthPlus" },
    create: { id: "cmp_healthplus", name: "HealthPlus" },
  });
  const educore = await prisma.company.upsert({
    where: { id: "cmp_educore" },
    update: { name: "EduCore" },
    create: { id: "cmp_educore", name: "EduCore" },
  });
  const finpeak = await prisma.company.upsert({
    where: { id: "cmp_finpeak" },
    update: { name: "FinPeak" },
    create: { id: "cmp_finpeak", name: "FinPeak" },
  });
  const greenenergy = await prisma.company.upsert({
    where: { id: "cmp_greenenergy" },
    update: { name: "GreenEnergy" },
    create: { id: "cmp_greenenergy", name: "GreenEnergy" },
  });
  const retailhub = await prisma.company.upsert({
    where: { id: "cmp_retailhub" },
    update: { name: "RetailHub" },
    create: { id: "cmp_retailhub", name: "RetailHub" },
  });
  const cybershield = await prisma.company.upsert({
    where: { id: "cmp_cybershield" },
    update: { name: "CyberShield" },
    create: { id: "cmp_cybershield", name: "CyberShield" },
  });
  const travelio = await prisma.company.upsert({
    where: { id: "cmp_travelio" },
    update: { name: "Travelio" },
    create: { id: "cmp_travelio", name: "Travelio" },
  });
  const mediaworks = await prisma.company.upsert({
    where: { id: "cmp_mediaworks" },
    update: { name: "MediaWorks" },
    create: { id: "cmp_mediaworks", name: "MediaWorks" },
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

  // Provided MERN Full Stack role (AudaCity Capital)
  await prisma.job.upsert({
    where: { id: "job_mern_fullstack" },
    update: {
      title: "MERN Full Stack Web Developer",
      location: "London, UK",
      type: "full_time",
      salary: "£55k-£75k",
      description:
        "Design, build and maintain MERN applications. Write well-designed, testable and efficient code. Gather and evaluate user feedback. Troubleshoot and optimize performance. Work in a dynamic team, document code, and support continuous improvement.",
    },
    create: {
      id: "job_mern_fullstack",
      title: "MERN Full Stack Web Developer",
      location: "London, UK",
      type: "full_time",
      salary: "£55k-£75k",
      description:
        "Design, build and maintain MERN applications. Write well-designed, testable and efficient code. Gather and evaluate user feedback. Troubleshoot and optimize performance. Work in a dynamic team, document code, and support continuous improvement.",
      companyId: audacity.id,
    },
  });

  // More diverse roles for filter testing
  await prisma.job.upsert({
    where: { id: "job_react_fe" },
    update: { title: "React Frontend Developer", location: "Remote", type: "full_time", description: "Build responsive UIs with React/Next.js and Tailwind.", salary: "$95k-$130k" },
    create: { id: "job_react_fe", title: "React Frontend Developer", location: "Remote", type: "full_time", description: "Build responsive UIs with React/Next.js and Tailwind.", salary: "$95k-$130k", companyId: technova.id },
  });

  await prisma.job.upsert({
    where: { id: "job_devops_contract" },
    update: { title: "DevOps Engineer", location: "Dublin, IE", type: "contract", description: "AWS, Docker, CI/CD, IaC (Terraform)", salary: "€450-€600/day" },
    create: { id: "job_devops_contract", title: "DevOps Engineer", location: "Dublin, IE", type: "contract", description: "AWS, Docker, CI/CD, IaC (Terraform)", salary: "€450-€600/day", companyId: globex.id },
  });

  await prisma.job.upsert({
    where: { id: "job_data_analyst" },
    update: { title: "Data Analyst", location: "New York, USA", type: "full_time", description: "SQL, BI dashboards, and stakeholder insights.", salary: "$80k-$110k" },
    create: { id: "job_data_analyst", title: "Data Analyst", location: "New York, USA", type: "full_time", description: "SQL, BI dashboards, and stakeholder insights.", salary: "$80k-$110k", companyId: finpeak.id },
  });

  await prisma.job.upsert({
    where: { id: "job_qa_parttime" },
    update: { title: "QA Engineer", location: "Toronto, CA", type: "part_time", description: "Manual + automated testing, Cypress/Playwright.", salary: "C$30-C$45/hour" },
    create: { id: "job_qa_parttime", title: "QA Engineer", location: "Toronto, CA", type: "part_time", description: "Manual + automated testing, Cypress/Playwright.", salary: "C$30-C$45/hour", companyId: technova.id },
  });

  await prisma.job.upsert({
    where: { id: "job_pm" },
    update: { title: "Product Manager", location: "San Francisco, USA", type: "full_time", description: "Own roadmap, discovery, delivery.", salary: "$140k-$180k" },
    create: { id: "job_pm", title: "Product Manager", location: "San Francisco, USA", type: "full_time", description: "Own roadmap, discovery, delivery.", salary: "$140k-$180k", companyId: acme.id },
  });

  await prisma.job.upsert({
    where: { id: "job_ux_contract" },
    update: { title: "UX Designer", location: "Remote", type: "contract", description: "User research, wireframes, Figma prototypes.", salary: "$400-$600/day" },
    create: { id: "job_ux_contract", title: "UX Designer", location: "Remote", type: "contract", description: "User research, wireframes, Figma prototypes.", salary: "$400-$600/day", companyId: mediaworks.id },
  });

  await prisma.job.upsert({
    where: { id: "job_mobile_intern" },
    update: { title: "Mobile Engineer Intern", location: "Bangalore, IN", type: "internship", description: "React Native/Flutter internship.", salary: "₹25k-₹35k/month" },
    create: { id: "job_mobile_intern", title: "Mobile Engineer Intern", location: "Bangalore, IN", type: "internship", description: "React Native/Flutter internship.", salary: "₹25k-₹35k/month", companyId: educore.id },
  });

  await prisma.job.upsert({
    where: { id: "job_ml_engineer" },
    update: { title: "ML Engineer", location: "Zurich, CH", type: "full_time", description: "Build, deploy and monitor ML models.", salary: "CHF 110k-140k" },
    create: { id: "job_ml_engineer", title: "ML Engineer", location: "Zurich, CH", type: "full_time", description: "Build, deploy and monitor ML models.", salary: "CHF 110k-140k", companyId: healthplus.id },
  });

  await prisma.job.upsert({
    where: { id: "job_marketing" },
    update: { title: "Digital Marketing Specialist", location: "Remote", type: "full_time", description: "SEO/SEM, content, campaigns, analytics.", salary: "$60k-$85k" },
    create: { id: "job_marketing", title: "Digital Marketing Specialist", location: "Remote", type: "full_time", description: "SEO/SEM, content, campaigns, analytics.", salary: "$60k-$85k", companyId: retailhub.id },
  });

  await prisma.job.upsert({
    where: { id: "job_support_pt" },
    update: { title: "Customer Support Agent", location: "Madrid, ES", type: "part_time", description: "Email/chat support, CRM tools.", salary: "€14-€18/hour" },
    create: { id: "job_support_pt", title: "Customer Support Agent", location: "Madrid, ES", type: "part_time", description: "Email/chat support, CRM tools.", salary: "€14-€18/hour", companyId: travelio.id },
  });

  await prisma.job.upsert({
    where: { id: "job_security" },
    update: { title: "Security Engineer", location: "Tel Aviv, IL", type: "full_time", description: "AppSec, threat modeling, pentesting.", salary: "$130k-$170k" },
    create: { id: "job_security", title: "Security Engineer", location: "Tel Aviv, IL", type: "full_time", description: "AppSec, threat modeling, pentesting.", salary: "$130k-$170k", companyId: cybershield.id },
  });

  await prisma.job.upsert({
    where: { id: "job_sustainability" },
    update: { title: "Sustainability Analyst", location: "Copenhagen, DK", type: "contract", description: "ESG reporting, lifecycle analysis.", salary: "DKK 500-700/day" },
    create: { id: "job_sustainability", title: "Sustainability Analyst", location: "Copenhagen, DK", type: "contract", description: "ESG reporting, lifecycle analysis.", salary: "DKK 500-700/day", companyId: greenenergy.id },
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
