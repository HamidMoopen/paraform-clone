"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { usePersona } from "@/providers/persona-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateCandidateProfileSchema } from "@/lib/validators";

const BIO_MAX = 1000;

export default function CandidateProfilePage() {
  useEffect(() => { document.title = "Edit Profile | Jobaform"; }, []);
  const { persona } = usePersona();
  const [form, setForm] = useState({
    name: "",
    email: "",
    linkedinUrl: "",
    headline: "",
    yearsExperience: "" as string | number,
    skills: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const candidateId = persona?.type === "candidate" ? persona.id : undefined;

  const fetchProfile = useCallback(() => {
    if (!candidateId) return;
    setLoading(true);
    fetch(`/api/candidates/${candidateId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setForm({
          name: data.name ?? "",
          email: data.email ?? "",
          linkedinUrl: data.linkedinUrl ?? "",
          headline: data.headline ?? "",
          yearsExperience: data.yearsExperience ?? "",
          skills: data.skills ?? "",
          bio: data.bio ?? "",
        });
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [candidateId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId) return;
    setErrors({});

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      linkedinUrl: form.linkedinUrl.trim() || undefined,
      headline: form.headline.trim() || undefined,
      yearsExperience:
        form.yearsExperience === ""
          ? undefined
          : Number(form.yearsExperience),
      skills: form.skills.trim() || undefined,
      bio: form.bio.trim().slice(0, BIO_MAX) || undefined,
    };

    const parsed = updateCandidateProfileSchema.safeParse(payload);
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
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save");
        return;
      }
      toast.success("Profile saved");
    } finally {
      setSaving(false);
    }
  };

  if (!candidateId) return null;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="space-y-4">
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground mt-1">
          This info is shown to hiring managers when you apply.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={form.linkedinUrl}
                onChange={(e) => handleChange("linkedinUrl", e.target.value)}
                className={errors.linkedinUrl ? "border-destructive" : ""}
              />
              {errors.linkedinUrl && (
                <p className="text-sm text-destructive">
                  {errors.linkedinUrl}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                placeholder="e.g. Senior SWE · 5 years exp"
                value={form.headline}
                onChange={(e) => handleChange("headline", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Years of experience</Label>
              <Input
                id="yearsExperience"
                type="number"
                min={0}
                max={50}
                value={form.yearsExperience}
                onChange={(e) =>
                  handleChange(
                    "yearsExperience",
                    e.target.value === "" ? "" : e.target.value
                  )
                }
                className={errors.yearsExperience ? "border-destructive" : ""}
              />
              {errors.yearsExperience && (
                <p className="text-sm text-destructive">
                  {errors.yearsExperience}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                placeholder="React, TypeScript, Node.js"
                value={form.skills}
                onChange={(e) => handleChange("skills", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Short bio</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) =>
                  handleChange("bio", e.target.value.slice(0, BIO_MAX))
                }
                rows={4}
                className="resize-none"
                placeholder="A brief summary of your background..."
              />
              <p className="text-xs text-muted-foreground">
                {form.bio.length} / {BIO_MAX}
              </p>
              {errors.bio && (
                <p className="text-sm text-destructive">{errors.bio}</p>
              )}
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
