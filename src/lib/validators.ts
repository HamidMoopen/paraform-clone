import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required").max(100),
  description: z.string().max(500).optional(),
  industry: z.string().max(50).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const createRoleSchema = z
  .object({
    title: z.string().min(1, "Job title is required").max(100),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(5000),
    location: z.string().min(1, "Location is required").max(100),
    locationType: z.enum(["onsite", "remote", "hybrid"]),
    salaryMin: z.number().int().min(0).optional(),
    salaryMax: z.number().int().min(0).optional(),
    salaryCurrency: z.string().default("USD"),
    employmentType: z.enum([
      "full-time",
      "part-time",
      "contract",
      "internship",
    ]),
    experienceLevel: z.enum(["entry", "mid", "senior", "lead"]).optional(),
    companyId: z.string().min(1),
    hiringManagerId: z.string().min(1),
  })
  .refine(
    (data) => {
      if (data.salaryMin != null && data.salaryMax != null) {
        return data.salaryMax >= data.salaryMin;
      }
      return true;
    },
    {
      message: "Maximum salary must be greater than minimum salary",
      path: ["salaryMax"],
    }
  );

export const createApplicationSchema = z.object({
  roleId: z.string().min(1),
  candidateId: z.string().min(1),
  coverNote: z.string().max(1000).optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["new", "reviewing", "interview", "accepted", "rejected"]),
});

export const updateRoleStatusSchema = z.object({
  status: z.enum(["draft", "published", "closed"]),
});

export const createMessageSchema = z
  .object({
    applicationId: z.string().min(1),
    content: z.string().min(1, "Message cannot be empty").max(2000),
    hiringManagerId: z.string().optional(),
    candidateId: z.string().optional(),
  })
  .refine(
    (data) => {
      return (!!data.hiringManagerId) !== (!!data.candidateId);
    },
    {
      message: "Exactly one sender (HM or candidate) must be specified",
    }
  );

export const updateCandidateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Must be a valid email"),
  linkedinUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  headline: z.string().max(100).optional(),
  yearsExperience: z.number().int().min(0).max(50).optional(),
  skills: z.string().max(500).optional(),
  bio: z.string().max(1000).optional(),
});
