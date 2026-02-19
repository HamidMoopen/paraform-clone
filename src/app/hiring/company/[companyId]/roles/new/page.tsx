"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePersona } from "@/providers/persona-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createRoleSchema } from "@/lib/validators";
import { LOCATION_TYPE, EMPLOYMENT_TYPE, EXPERIENCE_LEVEL } from "@/lib/constants";

const DESCRIPTION_MAX = 5000;

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

export default function NewRolePage() {
  const params = useParams();
  const router = useRouter();
  const { persona } = usePersona();
  const companyId = params.companyId as string;
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    locationType: "onsite",
    salaryMin: "" as string | number,
    salaryMax: "" as string | number,
    employmentType: "full-time",
    experienceLevel: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const submitWithStatus = async (status: "draft" | "published") => {
    if (persona?.type !== "hiring-manager") return;
    setErrors({});

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      locationType: form.locationType as "onsite" | "remote" | "hybrid",
      salaryMin:
        form.salaryMin === ""
          ? undefined
          : typeof form.salaryMin === "number"
            ? form.salaryMin
            : parseInt(String(form.salaryMin), 10),
      salaryMax:
        form.salaryMax === ""
          ? undefined
          : typeof form.salaryMax === "number"
            ? form.salaryMax
            : parseInt(String(form.salaryMax), 10),
      salaryCurrency: "USD" as const,
      employmentType: form.employmentType as
        | "full-time"
        | "part-time"
        | "contract"
        | "internship",
      experienceLevel: form.experienceLevel || undefined,
      companyId,
      hiringManagerId: persona.id,
      status,
    };

    const parsed = createRoleSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (path && !fieldErrors[path])
          fieldErrors[path] = err.message ?? "Invalid";
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Failed to create role");
        return;
      }
      toast.success("Role created!");
      router.replace(`/hiring/company/${companyId}/roles`);
    } finally {
      setSaving(false);
    }
  };

  if (persona?.type !== "hiring-manager") return null;

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/hiring/company/${companyId}/roles`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to roles
        </Link>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Create New Role</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add a job role. You can save as draft or publish immediately.
          </p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitWithStatus("draft");
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Job title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  handleChange("description", e.target.value.slice(0, DESCRIPTION_MAX))
                }
                placeholder="Describe the role and requirements..."
                rows={6}
                className={`resize-none ${errors.description ? "border-destructive" : ""}`}
              />
              <p className="text-xs text-muted-foreground">
                {form.description.length} / {DESCRIPTION_MAX}
              </p>
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="e.g. San Francisco, CA or Remote"
                className={errors.location ? "border-destructive" : ""}
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Location type</Label>
              <Select
                value={form.locationType}
                onValueChange={(v) => handleChange("locationType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LOCATION_TYPE).map(([k, v]) => (
                    <SelectItem key={k} value={v}>
                      {capitalize(v)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Salary min (USD)</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  min={0}
                  value={form.salaryMin}
                  onChange={(e) =>
                    handleChange(
                      "salaryMin",
                      e.target.value === "" ? "" : e.target.value
                    )
                  }
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">Salary max (USD)</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  min={0}
                  value={form.salaryMax}
                  onChange={(e) =>
                    handleChange(
                      "salaryMax",
                      e.target.value === "" ? "" : e.target.value
                    )
                  }
                  placeholder="Optional"
                  className={errors.salaryMax ? "border-destructive" : ""}
                />
                {errors.salaryMax && (
                  <p className="text-sm text-destructive">{errors.salaryMax}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Employment type</Label>
              <Select
                value={form.employmentType}
                onValueChange={(v) => handleChange("employmentType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EMPLOYMENT_TYPE).map(([k, v]) => (
                    <SelectItem key={k} value={v}>
                      {capitalize(v)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Experience level (optional)</Label>
              <Select
                value={form.experienceLevel || "none"}
                onValueChange={(v) =>
                  handleChange("experienceLevel", v === "none" ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not specified</SelectItem>
                  {Object.entries(EXPERIENCE_LEVEL).map(([k, v]) => (
                    <SelectItem key={k} value={v}>
                      {capitalize(v)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="outline"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save as Draft"}
              </Button>
              <Button
                type="button"
                disabled={saving}
                onClick={() => submitWithStatus("published")}
              >
                {saving ? "Publishing…" : "Publish Role"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push(`/hiring/company/${companyId}/roles`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
