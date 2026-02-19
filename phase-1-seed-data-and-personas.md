# Phase 1: Seed Data & Persona System

## Goal
Create a rich seed script with realistic demo data and build the persona selection landing page. By the end of this phase, a user can open the app, pick a persona, and be routed into the correct experience — with a populated database behind them.

---

## Step 1: Seed Script

Create `prisma/seed.ts`:

This is one of the most important files in the project. The reviewer will see this data immediately. Make it feel **real** — real company names (fictional but plausible), real-sounding job descriptions, diverse personas.

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data (order matters due to foreign keys)
  await prisma.message.deleteMany()
  await prisma.application.deleteMany()
  await prisma.role.deleteMany()
  await prisma.hiringManagerCompany.deleteMany()
  await prisma.hiringManager.deleteMany()
  await prisma.candidate.deleteMany()
  await prisma.company.deleteMany()

  // ============================================
  // COMPANIES
  // ============================================
  const acmeAI = await prisma.company.create({
    data: {
      name: 'Acme AI',
      description: 'Building the next generation of AI-powered developer tools. Series A backed by Kleiner Perkins.',
      industry: 'AI / Machine Learning',
      location: 'San Francisco, CA',
      website: 'https://acmeai.example.com',
      logoUrl: '/logos/acme-ai.png',
    },
  })

  const cloudSync = await prisma.company.create({
    data: {
      name: 'CloudSync',
      description: 'Enterprise cloud infrastructure platform helping teams deploy and scale applications effortlessly.',
      industry: 'Cloud Infrastructure',
      location: 'New York, NY',
      website: 'https://cloudsync.example.com',
      logoUrl: '/logos/cloudsync.png',
    },
  })

  const healthStack = await prisma.company.create({
    data: {
      name: 'HealthStack',
      description: 'Digital health platform connecting patients with providers through modern telehealth experiences.',
      industry: 'Healthcare Technology',
      location: 'Austin, TX',
      website: 'https://healthstack.example.com',
      logoUrl: '/logos/healthstack.png',
    },
  })

  // ============================================
  // HIRING MANAGERS (Personas)
  // ============================================
  const sarah = await prisma.hiringManager.create({
    data: {
      name: 'Sarah Chen',
      email: 'sarah@acmeai.example.com',
      title: 'VP of Engineering',
      avatarUrl: '/avatars/sarah.png',
      isPersona: true,
    },
  })

  const marcus = await prisma.hiringManager.create({
    data: {
      name: 'Marcus Rivera',
      email: 'marcus@cloudsync.example.com',
      title: 'Head of Product',
      avatarUrl: '/avatars/marcus.png',
      isPersona: true,
    },
  })

  const priya = await prisma.hiringManager.create({
    data: {
      name: 'Priya Patel',
      email: 'priya@healthstack.example.com',
      title: 'Engineering Manager',
      avatarUrl: '/avatars/priya.png',
      isPersona: true,
    },
  })

  // Link HMs to companies
  await prisma.hiringManagerCompany.createMany({
    data: [
      { hiringManagerId: sarah.id, companyId: acmeAI.id },
      { hiringManagerId: marcus.id, companyId: cloudSync.id },
      { hiringManagerId: priya.id, companyId: healthStack.id },
      // Sarah also advises CloudSync (shows multi-company)
      { hiringManagerId: sarah.id, companyId: cloudSync.id },
    ],
  })

  // ============================================
  // CANDIDATES (Personas)
  // ============================================
  const alex = await prisma.candidate.create({
    data: {
      name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      linkedinUrl: 'https://linkedin.com/in/alexjohnson',
      avatarUrl: '/avatars/alex.png',
      headline: 'Full-Stack Engineer · 3 Years Experience',
      yearsExperience: 3,
      skills: 'React, TypeScript, Node.js, PostgreSQL, AWS',
      bio: 'Passionate about building products that make developers more productive. Previously at two YC startups.',
      isPersona: true,
    },
  })

  const jordan = await prisma.candidate.create({
    data: {
      name: 'Jordan Lee',
      email: 'jordan.lee@email.com',
      linkedinUrl: 'https://linkedin.com/in/jordanlee',
      avatarUrl: '/avatars/jordan.png',
      headline: 'New Grad · CS @ Stanford',
      yearsExperience: 0,
      skills: 'Python, Java, React, Machine Learning, SQL',
      bio: 'Recent CS graduate interested in AI/ML engineering roles. Built a recommendation engine for my senior thesis.',
      isPersona: true,
    },
  })

  const sam = await prisma.candidate.create({
    data: {
      name: 'Sam Taylor',
      email: 'sam.taylor@email.com',
      linkedinUrl: 'https://linkedin.com/in/samtaylor',
      avatarUrl: '/avatars/sam.png',
      headline: 'Senior Software Engineer · 8 Years Experience',
      yearsExperience: 8,
      skills: 'Go, Kubernetes, Terraform, System Design, Python, TypeScript',
      bio: 'Infrastructure-focused engineer who loves working at the intersection of developer tooling and platform engineering.',
      isPersona: true,
    },
  })

  // ============================================
  // ROLES
  // ============================================
  const roles = await Promise.all([
    // Acme AI roles
    prisma.role.create({
      data: {
        title: 'Senior Frontend Engineer',
        description: `We're looking for a Senior Frontend Engineer to lead the development of our AI-powered code editor interface.\n\n**What you'll do:**\n- Build and maintain our React-based editor UI\n- Collaborate with ML engineers to integrate AI features seamlessly\n- Own the design system and component library\n- Mentor junior engineers on frontend best practices\n\n**What we're looking for:**\n- 4+ years of experience with React and TypeScript\n- Experience building complex, interactive web applications\n- Strong opinions on UX, loosely held\n- Bonus: experience with Monaco Editor or CodeMirror`,
        location: 'San Francisco, CA',
        locationType: 'hybrid',
        salaryMin: 160000,
        salaryMax: 220000,
        employmentType: 'full-time',
        experienceLevel: 'senior',
        status: 'published',
        companyId: acmeAI.id,
        hiringManagerId: sarah.id,
      },
    }),
    prisma.role.create({
      data: {
        title: 'ML Engineer - LLM Infrastructure',
        description: `Join our ML infrastructure team to build the backbone of our AI products.\n\n**What you'll do:**\n- Design and optimize LLM inference pipelines\n- Build evaluation frameworks for model quality\n- Work on fine-tuning pipelines for domain-specific models\n- Collaborate with product to translate research into features\n\n**What we're looking for:**\n- 3+ years in ML engineering or ML ops\n- Experience with PyTorch, transformers, and LLM serving\n- Strong systems programming skills\n- Published research is a plus but not required`,
        location: 'San Francisco, CA',
        locationType: 'onsite',
        salaryMin: 180000,
        salaryMax: 250000,
        employmentType: 'full-time',
        experienceLevel: 'mid',
        status: 'published',
        companyId: acmeAI.id,
        hiringManagerId: sarah.id,
      },
    }),
    prisma.role.create({
      data: {
        title: 'Product Design Intern',
        description: `Summer internship on our product design team.\n\n**What you'll do:**\n- Work on real features that ship to thousands of developers\n- Conduct user research and usability testing\n- Create high-fidelity prototypes in Figma\n- Present your work to the entire company\n\n**What we're looking for:**\n- Currently pursuing a degree in design, HCI, or related field\n- Strong Figma skills and a portfolio showing interactive/product work\n- Curiosity about developer tools and AI`,
        location: 'San Francisco, CA',
        locationType: 'onsite',
        salaryMin: 60000,
        salaryMax: 80000,
        employmentType: 'internship',
        experienceLevel: 'entry',
        status: 'published',
        companyId: acmeAI.id,
        hiringManagerId: sarah.id,
      },
    }),
    // Draft role (should not appear for candidates)
    prisma.role.create({
      data: {
        title: 'Head of Developer Relations',
        description: 'We are looking for someone to lead our DevRel efforts. This role is still being scoped.',
        location: 'Remote',
        locationType: 'remote',
        salaryMin: 170000,
        salaryMax: 230000,
        employmentType: 'full-time',
        experienceLevel: 'lead',
        status: 'draft',
        companyId: acmeAI.id,
        hiringManagerId: sarah.id,
      },
    }),

    // CloudSync roles
    prisma.role.create({
      data: {
        title: 'Backend Engineer - Core Platform',
        description: `Build the core platform that thousands of engineering teams depend on daily.\n\n**What you'll do:**\n- Design and implement APIs for our deployment pipeline\n- Optimize database performance at scale\n- Build monitoring and alerting infrastructure\n- Participate in on-call rotation\n\n**What we're looking for:**\n- 3+ years backend engineering experience\n- Proficiency in Go or similar systems language\n- Experience with distributed systems\n- Familiarity with Kubernetes and cloud-native architecture`,
        location: 'New York, NY',
        locationType: 'hybrid',
        salaryMin: 150000,
        salaryMax: 200000,
        employmentType: 'full-time',
        experienceLevel: 'mid',
        status: 'published',
        companyId: cloudSync.id,
        hiringManagerId: marcus.id,
      },
    }),
    prisma.role.create({
      data: {
        title: 'Product Manager - Enterprise',
        description: `Own the enterprise product strategy and roadmap for CloudSync.\n\n**What you'll do:**\n- Talk to enterprise customers weekly to understand their needs\n- Define and prioritize the product roadmap\n- Work closely with engineering to ship features\n- Analyze usage data to inform product decisions\n\n**What we're looking for:**\n- 4+ years of product management experience\n- Experience with B2B SaaS or infrastructure products\n- Strong analytical and communication skills\n- Technical background preferred`,
        location: 'New York, NY',
        locationType: 'onsite',
        salaryMin: 140000,
        salaryMax: 190000,
        employmentType: 'full-time',
        experienceLevel: 'senior',
        status: 'published',
        companyId: cloudSync.id,
        hiringManagerId: marcus.id,
      },
    }),
    prisma.role.create({
      data: {
        title: 'DevOps Engineer (Contract)',
        description: `6-month contract to help us migrate from legacy infrastructure.\n\n**What you'll do:**\n- Migrate existing services to Kubernetes\n- Set up CI/CD pipelines\n- Document infrastructure patterns and runbooks\n\n**What we're looking for:**\n- Strong Kubernetes and Terraform experience\n- Experience with AWS or GCP\n- Ability to work independently`,
        location: 'Remote',
        locationType: 'remote',
        salaryMin: 120000,
        salaryMax: 160000,
        employmentType: 'contract',
        experienceLevel: 'mid',
        status: 'published',
        companyId: cloudSync.id,
        hiringManagerId: marcus.id,
      },
    }),

    // HealthStack roles
    prisma.role.create({
      data: {
        title: 'Full-Stack Engineer',
        description: `Join our engineering team building the future of telehealth.\n\n**What you'll do:**\n- Build patient and provider-facing features end-to-end\n- Work with our design team to create intuitive healthcare experiences\n- Integrate with healthcare APIs (FHIR, HL7)\n- Ensure HIPAA compliance in all features\n\n**What we're looking for:**\n- 2+ years full-stack experience (React + Node.js/Python)\n- Interest in healthcare technology\n- Attention to detail and empathy for users\n- Healthcare industry experience is a bonus`,
        location: 'Austin, TX',
        locationType: 'hybrid',
        salaryMin: 130000,
        salaryMax: 175000,
        employmentType: 'full-time',
        experienceLevel: 'mid',
        status: 'published',
        companyId: healthStack.id,
        hiringManagerId: priya.id,
      },
    }),
    prisma.role.create({
      data: {
        title: 'QA Engineer',
        description: `Ensure the quality and reliability of our healthcare platform.\n\n**What you'll do:**\n- Design and implement test strategies for new features\n- Build and maintain automated test suites\n- Work with engineering to identify and resolve quality issues\n- Champion testing best practices across the team\n\n**What we're looking for:**\n- 2+ years QA or SDET experience\n- Experience with Playwright, Cypress, or similar tools\n- Understanding of CI/CD and test automation\n- Healthcare or regulated industry experience is a plus`,
        location: 'Austin, TX',
        locationType: 'onsite',
        salaryMin: 110000,
        salaryMax: 150000,
        employmentType: 'full-time',
        experienceLevel: 'mid',
        status: 'published',
        companyId: healthStack.id,
        hiringManagerId: priya.id,
      },
    }),
    // Closed role
    prisma.role.create({
      data: {
        title: 'Founding Engineer',
        description: 'This role has been filled. We found an amazing founding engineer!',
        location: 'Austin, TX',
        locationType: 'onsite',
        salaryMin: 150000,
        salaryMax: 200000,
        employmentType: 'full-time',
        experienceLevel: 'senior',
        status: 'closed',
        companyId: healthStack.id,
        hiringManagerId: priya.id,
        deletedAt: new Date(), // Soft deleted
      },
    }),
  ])

  // ============================================
  // APPLICATIONS (pre-existing for demo richness)
  // ============================================
  const seniorFrontend = roles[0]  // Senior Frontend Engineer @ Acme AI
  const mlEngineer = roles[1]      // ML Engineer @ Acme AI
  const backendEngineer = roles[4] // Backend Engineer @ CloudSync
  const fullStackHealth = roles[7] // Full-Stack Engineer @ HealthStack

  const applications = await Promise.all([
    // Sam applied to Senior Frontend at Acme AI - in review
    prisma.application.create({
      data: {
        roleId: seniorFrontend.id,
        candidateId: sam.id,
        status: 'reviewing',
        coverNote: 'I have 8 years of frontend experience and have led design system initiatives at my last two companies. Would love to bring that expertise to Acme AI.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    }),
    // Jordan applied to ML Engineer at Acme AI - new
    prisma.application.create({
      data: {
        roleId: mlEngineer.id,
        candidateId: jordan.id,
        status: 'new',
        coverNote: 'My thesis was on transformer architectures for code generation. I would love to apply this research in a production environment.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    }),
    // Alex applied to Backend Engineer at CloudSync - interview stage
    prisma.application.create({
      data: {
        roleId: backendEngineer.id,
        candidateId: alex.id,
        status: 'interview',
        coverNote: 'I have been working with Go and Kubernetes for the past year and am excited about CloudSync\'s mission.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
    }),
    // Sam applied to Full-Stack at HealthStack - accepted
    prisma.application.create({
      data: {
        roleId: fullStackHealth.id,
        candidateId: sam.id,
        status: 'accepted',
        coverNote: 'Healthcare tech is where I want to focus my career. My infrastructure background can help HealthStack scale reliably.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    }),
  ])

  // ============================================
  // MESSAGES (on the accepted application)
  // ============================================
  const acceptedApp = applications[3] // Sam + HealthStack
  await prisma.message.createMany({
    data: [
      {
        applicationId: acceptedApp.id,
        hiringManagerId: priya.id,
        content: 'Hi Sam! We loved your application and background. We\'d like to move forward — are you available for a call this week to discuss next steps?',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        applicationId: acceptedApp.id,
        candidateId: sam.id,
        content: 'Thanks Priya! I\'m thrilled to hear that. I\'m available Thursday or Friday afternoon. Would either work?',
        createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
      },
      {
        applicationId: acceptedApp.id,
        hiringManagerId: priya.id,
        content: 'Thursday at 2pm CT works perfectly. I\'ll send over a calendar invite. Looking forward to it!',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  })

  console.log('✅ Seed data created successfully!')
  console.log(`   📦 ${3} companies`)
  console.log(`   👔 ${3} hiring managers`)
  console.log(`   👤 ${3} candidates`)
  console.log(`   💼 ${roles.length} roles`)
  console.log(`   📝 ${applications.length} applications`)
  console.log(`   💬 ${3} messages`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

Install tsx for running the seed:
```bash
npm install -D tsx
```

Run it:
```bash
npx prisma db seed
```

---

## Step 2: Persona Context Provider

Create `src/providers/persona-provider.tsx`:

This is the "auth" replacement. It stores who the current user is (candidate or HM) in React context and localStorage.

```typescript
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type PersonaType = 'candidate' | 'hiring-manager' | null

interface CandidatePersona {
  type: 'candidate'
  id: string
  name: string
  email: string
  avatarUrl: string | null
  headline: string | null
}

interface HiringManagerPersona {
  type: 'hiring-manager'
  id: string
  name: string
  email: string
  avatarUrl: string | null
  title: string | null
  activeCompanyId: string | null  // Which company they're currently managing
}

type Persona = CandidatePersona | HiringManagerPersona | null

interface PersonaContextType {
  persona: Persona
  setPersona: (persona: Persona) => void
  setActiveCompany: (companyId: string) => void
  clearPersona: () => void
  isLoading: boolean
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined)

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<Persona>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('jobboard-persona')
    if (stored) {
      try {
        setPersonaState(JSON.parse(stored))
      } catch {
        localStorage.removeItem('jobboard-persona')
      }
    }
    setIsLoading(false)
  }, [])

  const setPersona = (p: Persona) => {
    setPersonaState(p)
    if (p) {
      localStorage.setItem('jobboard-persona', JSON.stringify(p))
    } else {
      localStorage.removeItem('jobboard-persona')
    }
  }

  const setActiveCompany = (companyId: string) => {
    if (persona?.type === 'hiring-manager') {
      const updated = { ...persona, activeCompanyId: companyId }
      setPersona(updated)
    }
  }

  const clearPersona = () => {
    setPersonaState(null)
    localStorage.removeItem('jobboard-persona')
  }

  return (
    <PersonaContext.Provider value={{ persona, setPersona, setActiveCompany, clearPersona, isLoading }}>
      {children}
    </PersonaContext.Provider>
  )
}

export function usePersona() {
  const context = useContext(PersonaContext)
  if (!context) {
    throw new Error('usePersona must be used within a PersonaProvider')
  }
  return context
}
```

---

## Step 3: API Route for Personas

Create `src/app/api/personas/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [hiringManagers, candidates] = await Promise.all([
    prisma.hiringManager.findMany({
      where: { isPersona: true },
      include: {
        companies: {
          include: { company: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.candidate.findMany({
      where: { isPersona: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return NextResponse.json({ hiringManagers, candidates })
}
```

---

## Step 4: Landing Page

Create the landing page at `src/app/page.tsx`. This is the first thing the reviewer sees — it needs to be clean, clear, and immediately communicable.

**Design direction:**
- Clean centered layout
- Clear headline: "Job Board" with a subtitle explaining this is a demo
- Two sections: "Enter as a Hiring Manager" and "Enter as a Candidate"
- Each section shows 3 persona cards with name, avatar (use initials as fallback), and a brief descriptor
- Clicking a persona stores it in context and redirects to the appropriate dashboard
- Small footer note: "This is a demo. Pick a persona to explore."

**Key behaviors:**
- On persona click → set persona in context → redirect:
  - Candidate → `/candidate/roles`
  - HM → `/hiring` (company selector, since HM may have multiple companies)
- If persona is already set (returning user), show a "Continue as [Name]" option at the top
- "Switch persona" link in the nav (every page) routes back here

**Component breakdown for this page:**
- `PersonaCard` component: avatar (initials), name, descriptor (title for HM, headline for candidate), company names for HM
- Two grid sections, side by side on desktop

---

## Step 5: Root Layout

Update `src/app/layout.tsx` to wrap the app in the PersonaProvider:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PersonaProvider } from '@/providers/persona-provider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Job Board',
  description: 'A minimal job board for hiring managers and candidates',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PersonaProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </PersonaProvider>
      </body>
    </html>
  )
}
```

---

## Checklist Before Moving On

- [ ] `npx prisma db seed` runs and logs the summary
- [ ] `npx prisma studio` shows populated data across all tables
- [ ] Landing page renders with persona cards
- [ ] Clicking a persona stores it in localStorage and redirects
- [ ] Refreshing the page remembers the last selected persona
- [ ] "Switch persona" / back to landing clears the stored persona
- [ ] The page looks clean and intentional (not default Next.js boilerplate)

---

## What's Next

Phase 2 builds the candidate experience: browsing roles, filtering, role detail pages, applying, and viewing applications.
