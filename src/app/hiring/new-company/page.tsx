"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePersona } from "@/providers/persona-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createCompanySchema } from "@/lib/validators";

export default function NewCompanyPage() {
  useEffect(() => { document.title = "Create Company | Jobaform"; }, []);
  const router = useRouter();
  const { persona, setActiveCompany } = usePersona();
  const [form, setForm] = useState({
    name: "",
    description: "",
    industry: "",
    location: "",
    website: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (persona?.type !== "hiring-manager") return;
    setErrors({});

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      industry: form.industry.trim() || undefined,
      location: form.location.trim() || undefined,
      website: form.website.trim() || undefined,
    };

    const parsed = createCompanySchema.safeParse(payload);
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
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          hiringManagerId: persona.id,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Failed to create company");
        return;
      }
      toast.success("Company created!");
      setActiveCompany(data.id, parsed.data.name);
      router.replace(`/hiring/company/${data.id}/roles`);
    } finally {
      setSaving(false);
    }
  };

  if (persona?.type !== "hiring-manager") return null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/hiring"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to companies
        </Link>
      </div>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Create New Company</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add a company to manage job roles and applications.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Acme Inc."
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="What does your company do?"
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={form.industry}
                onChange={(e) => handleChange("industry", e.target.value)}
                placeholder="e.g. Technology, Healthcare"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="e.g. San Francisco, CA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={form.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://example.com"
                className={errors.website ? "border-destructive" : ""}
              />
              {errors.website && (
                <p className="text-sm text-destructive">{errors.website}</p>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Creating…" : "Create company"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/hiring")}
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
