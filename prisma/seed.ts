import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany();
  await prisma.application.deleteMany();
  await prisma.role.deleteMany();
  await prisma.hiringManagerCompany.deleteMany();
  await prisma.hiringManager.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.company.deleteMany();

  const acmeAI = await prisma.company.create({
    data: {
      name: "Acme AI",
      description:
        "Building the next generation of AI-powered developer tools. Series A backed by Kleiner Perkins.",
      industry: "AI / Machine Learning",
      location: "San Francisco, CA",
      website: "https://acmeai.example.com",
      logoUrl: null,
    },
  });

  const cloudSync = await prisma.company.create({
    data: {
      name: "CloudSync",
      description:
        "Enterprise cloud infrastructure platform helping teams deploy and scale applications effortlessly.",
      industry: "Cloud Infrastructure",
      location: "New York, NY",
      website: "https://cloudsync.example.com",
      logoUrl: null,
    },
  });

  const healthStack = await prisma.company.create({
    data: {
      name: "HealthStack",
      description:
        "Digital health platform connecting patients with providers through modern telehealth experiences.",
      industry: "Healthcare Technology",
      location: "Austin, TX",
      website: "https://healthstack.example.com",
      logoUrl: null,
    },
  });

  const sarah = await prisma.hiringManager.create({
    data: {
      name: "Sarah Chen",
      email: "sarah@acmeai.example.com",
      title: "VP of Engineering",
      avatarUrl: null,
      isPersona: true,
    },
  });

  const marcus = await prisma.hiringManager.create({
    data: {
      name: "Marcus Rivera",
      email: "marcus@cloudsync.example.com",
      title: "Head of Product",
      avatarUrl: null,
      isPersona: true,
    },
  });

  const priya = await prisma.hiringManager.create({
    data: {
      name: "Priya Patel",
      email: "priya@healthstack.example.com",
      title: "Engineering Manager",
      avatarUrl: null,
      isPersona: true,
    },
  });

  await prisma.hiringManagerCompany.createMany({
    data: [
      { hiringManagerId: sarah.id, companyId: acmeAI.id },
      { hiringManagerId: marcus.id, companyId: cloudSync.id },
      { hiringManagerId: priya.id, companyId: healthStack.id },
      { hiringManagerId: sarah.id, companyId: cloudSync.id },
    ],
  });

  const alex = await prisma.candidate.create({
    data: {
      name: "Alex Johnson",
      email: "alex.johnson@email.com",
      linkedinUrl: "https://linkedin.com/in/alexjohnson",
      avatarUrl: null,
      headline: "Full-Stack Engineer · 3 Years Experience",
      yearsExperience: 3,
      skills: "React, TypeScript, Node.js, PostgreSQL, AWS",
      bio: "Passionate about building products that make developers more productive. Previously at two YC startups.",
      isPersona: true,
    },
  });

  const jordan = await prisma.candidate.create({
    data: {
      name: "Jordan Lee",
      email: "jordan.lee@email.com",
      linkedinUrl: "https://linkedin.com/in/jordanlee",
      avatarUrl: null,
      headline: "New Grad · CS @ Stanford",
      yearsExperience: 0,
      skills: "Python, Java, React, Machine Learning, SQL",
      bio: "Recent CS graduate interested in AI/ML engineering roles. Built a recommendation engine for my senior thesis.",
      isPersona: true,
    },
  });

  const sam = await prisma.candidate.create({
    data: {
      name: "Sam Taylor",
      email: "sam.taylor@email.com",
      linkedinUrl: "https://linkedin.com/in/samtaylor",
      avatarUrl: null,
      headline: "Senior Software Engineer · 8 Years Experience",
      yearsExperience: 8,
      skills: "Go, Kubernetes, Terraform, System Design, Python, TypeScript",
      bio: "Infrastructure-focused engineer who loves working at the intersection of developer tooling and platform engineering.",
      isPersona: true,
    },
  });

  const roles = await Promise.all([
    prisma.role.create({
      data: {
        title: "Senior Frontend Engineer",
        description: `We're looking for a Senior Frontend Engineer to lead the development of our AI-powered code editor interface.\n\n**What you'll do:**\n- Build and maintain our React-based editor UI\n- Collaborate with ML engineers to integrate AI features seamlessly\n- Own the design system and component library\n- Mentor junior engineers on frontend best practices\n\n**What we're looking for:**\n- 4+ years of experience with React and TypeScript\n- Experience building complex, interactive web applications\n- Strong opinions on UX, loosely held\n- Bonus: experience with Monaco Editor or CodeMirror`,
        location: "San Francisco, CA",
        locationType: "hybrid",
        salaryMin: 160000,
        salaryMax: 220000,
        employmentType: "full-time",
        experienceLevel: "senior",
        status: "published",
        companyId: acmeAI.id,
        hiringManagerId: sarah.id,
      },
    }),
    prisma.role.create({
      data: {
        title: "ML Engineer - LLM Infrastructure",
        description: `Join our ML infrastructure team to build the backbone of our AI products.\n\n**What you'll do:**\n- Design and optimize LLM inference pipelines\n- Build evaluation frameworks for model quality\n- Work on fine-tuning pipelines for domain-specific models\n- Collaborate with product to translate research into features\n\n**What we're looking for:**\n- 3+ years in ML engineering or ML ops\n- Experience with PyTorch, transformers, and LLM serving\n- Strong systems programming skills\n- Published research is a plus but not required`,
        location: "San Francisco, CA",
        locationType: "onsite",
        salaryMin: 180000,
        salaryMax: 250000,
        employmentType: "full-time",
        experienceLevel: "mid",
        status: "published",
        companyId: acmeAI.id,
        hiringManagerId: sarah.id,
      },
    }),
    prisma.role.create({
      data: {
        title: "Product Design Intern",
        description: `Summer internship on our product design team.\n\n**What you'll do:**\n- Work on real features that ship to thousands of developers\n- Conduct user research and usability testing\n- Create high-fidelity prototypes in Figma\n- Present your work to the entire company\n\n**What we're looking for:**\n- Currently pursuing a degree in design, HCI, or related field\n- Strong Figma skills and a portfolio showing interactive/product work\n- Curiosity about developer tools and AI`,
        location: "San Francisco, CA",
        locationType: "onsite",
        salaryMin: 60000,
        salaryMax: 80000,
        employmentType: "internship",
        experienceLevel: "entry",
        status: "published",
        companyId: acmeAI.id,
        hiringManagerId: sarah.id,
      },
    }),
    prisma.role.create({
      data: {
        title: "Head of Developer Relations",
        description:
          "We are looking for someone to lead our DevRel efforts. This role is still being scoped.",
        location: "Remote",
        locationType: "remote",
        salaryMin: 170000,
        salaryMax: 230000,
        employmentType: "full-time",
        experienceLevel: "lead",
        status: "draft",
        companyId: acmeAI.id,
        hiringManagerId: sarah.id,
      },
    }),
    prisma.role.create({
      data: {
        title: "Backend Engineer - Core Platform",
        description: `Build the core platform that thousands of engineering teams depend on daily.\n\n**What you'll do:**\n- Design and implement APIs for our deployment pipeline\n- Optimize database performance at scale\n- Build monitoring and alerting infrastructure\n- Participate in on-call rotation\n\n**What we're looking for:**\n- 3+ years backend engineering experience\n- Proficiency in Go or similar systems language\n- Experience with distributed systems\n- Familiarity with Kubernetes and cloud-native architecture`,
        location: "New York, NY",
        locationType: "hybrid",
        salaryMin: 150000,
        salaryMax: 200000,
        employmentType: "full-time",
        experienceLevel: "mid",
        status: "published",
        companyId: cloudSync.id,
        hiringManagerId: marcus.id,
      },
    }),
    prisma.role.create({
      data: {
        title: "Product Manager - Enterprise",
        description: `Own the enterprise product strategy and roadmap for CloudSync.\n\n**What you'll do:**\n- Talk to enterprise customers weekly to understand their needs\n- Define and prioritize the product roadmap\n- Work closely with engineering to ship features\n- Analyze usage data to inform product decisions\n\n**What we're looking for:**\n- 4+ years of product management experience\n- Experience with B2B SaaS or infrastructure products\n- Strong analytical and communication skills\n- Technical background preferred`,
        location: "New York, NY",
        locationType: "onsite",
        salaryMin: 140000,
        salaryMax: 190000,
        employmentType: "full-time",
        experienceLevel: "senior",
        status: "published",
        companyId: cloudSync.id,
        hiringManagerId: marcus.id,
      },
    }),
    prisma.role.create({
      data: {
        title: "DevOps Engineer (Contract)",
        description: `6-month contract to help us migrate from legacy infrastructure.\n\n**What you'll do:**\n- Migrate existing services to Kubernetes\n- Set up CI/CD pipelines\n- Document infrastructure patterns and runbooks\n\n**What we're looking for:**\n- Strong Kubernetes and Terraform experience\n- Experience with AWS or GCP\n- Ability to work independently`,
        location: "Remote",
        locationType: "remote",
        salaryMin: 120000,
        salaryMax: 160000,
        employmentType: "contract",
        experienceLevel: "mid",
        status: "published",
        companyId: cloudSync.id,
        hiringManagerId: marcus.id,
      },
    }),
    prisma.role.create({
      data: {
        title: "Full-Stack Engineer",
        description: `Join our engineering team building the future of telehealth.\n\n**What you'll do:**\n- Build patient and provider-facing features end-to-end\n- Work with our design team to create intuitive healthcare experiences\n- Integrate with healthcare APIs (FHIR, HL7)\n- Ensure HIPAA compliance in all features\n\n**What we're looking for:**\n- 2+ years full-stack experience (React + Node.js/Python)\n- Interest in healthcare technology\n- Attention to detail and empathy for users\n- Healthcare industry experience is a bonus`,
        location: "Austin, TX",
        locationType: "hybrid",
        salaryMin: 130000,
        salaryMax: 175000,
        employmentType: "full-time",
        experienceLevel: "mid",
        status: "published",
        companyId: healthStack.id,
        hiringManagerId: priya.id,
      },
    }),
    prisma.role.create({
      data: {
        title: "QA Engineer",
        description: `Ensure the quality and reliability of our healthcare platform.\n\n**What you'll do:**\n- Design and implement test strategies for new features\n- Build and maintain automated test suites\n- Work with engineering to identify and resolve quality issues\n- Champion testing best practices across the team\n\n**What we're looking for:**\n- 2+ years QA or SDET experience\n- Experience with Playwright, Cypress, or similar tools\n- Understanding of CI/CD and test automation\n- Healthcare or regulated industry experience is a plus`,
        location: "Austin, TX",
        locationType: "onsite",
        salaryMin: 110000,
        salaryMax: 150000,
        employmentType: "full-time",
        experienceLevel: "mid",
        status: "published",
        companyId: healthStack.id,
        hiringManagerId: priya.id,
      },
    }),
    prisma.role.create({
      data: {
        title: "Founding Engineer",
        description:
          "This role has been filled. We found an amazing founding engineer!",
        location: "Austin, TX",
        locationType: "onsite",
        salaryMin: 150000,
        salaryMax: 200000,
        employmentType: "full-time",
        experienceLevel: "senior",
        status: "closed",
        companyId: healthStack.id,
        hiringManagerId: priya.id,
        deletedAt: new Date(),
      },
    }),
  ]);

  const seniorFrontend = roles[0];
  const mlEngineer = roles[1];
  const backendEngineer = roles[4];
  const fullStackHealth = roles[7];

  const applications = await Promise.all([
    prisma.application.create({
      data: {
        roleId: seniorFrontend.id,
        candidateId: sam.id,
        status: "reviewing",
        coverNote:
          "I have 8 years of frontend experience and have led design system initiatives at my last two companies. Would love to bring that expertise to Acme AI.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.application.create({
      data: {
        roleId: mlEngineer.id,
        candidateId: jordan.id,
        status: "new",
        coverNote:
          "My thesis was on transformer architectures for code generation. I would love to apply this research in a production environment.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.application.create({
      data: {
        roleId: backendEngineer.id,
        candidateId: alex.id,
        status: "interview",
        coverNote:
          "I have been working with Go and Kubernetes for the past year and am excited about CloudSync's mission.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.application.create({
      data: {
        roleId: fullStackHealth.id,
        candidateId: sam.id,
        status: "accepted",
        coverNote:
          "Healthcare tech is where I want to focus my career. My infrastructure background can help HealthStack scale reliably.",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  const acceptedApp = applications[3];
  await prisma.message.createMany({
    data: [
      {
        applicationId: acceptedApp.id,
        hiringManagerId: priya.id,
        content:
          "Hi Sam! We loved your application and background. We'd like to move forward — are you available for a call this week to discuss next steps?",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        applicationId: acceptedApp.id,
        candidateId: sam.id,
        content:
          "Thanks Priya! I'm thrilled to hear that. I'm available Thursday or Friday afternoon. Would either work?",
        createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
      },
      {
        applicationId: acceptedApp.id,
        hiringManagerId: priya.id,
        content:
          "Thursday at 2pm CT works perfectly. I'll send over a calendar invite. Looking forward to it!",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("Seed data created successfully!");
  console.log(`   Companies: 3`);
  console.log(`   Hiring managers: 3`);
  console.log(`   Candidates: 3`);
  console.log(`   Roles: ${roles.length}`);
  console.log(`   Applications: ${applications.length}`);
  console.log(`   Messages: 3`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
