"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePersona } from "@/providers/persona-provider";
import type { HiringManagerPersona } from "@/providers/persona-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateHiringManagerDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const { setPersona } = usePersona();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "hiring-manager",
          name: name.trim(),
          email: email.trim(),
          title: title.trim() || undefined,
          companyName: companyName.trim(),
          companyDescription: companyDescription.trim() || undefined,
          companyIndustry: companyIndustry.trim() || undefined,
          companyLocation: companyLocation.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create profile");
        return;
      }
      const persona: HiringManagerPersona = {
        type: "hiring-manager",
        id: data.id,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl,
        title: data.title,
        companyId: data.company.id,
        companyName: data.company.name,
      };
      setPersona(persona);
      toast.success("Profile created!");
      onOpenChange(false);
      router.push(`/hiring/company/${data.company.id}/roles`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Hiring Manager Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hm-name">Name *</Label>
            <Input
              id="hm-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hm-email">Email *</Label>
            <Input
              id="hm-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hm-title">Title</Label>
            <Input
              id="hm-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Recruiter, Head of Engineering"
            />
          </div>
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Company Details</p>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="hm-company">Company Name *</Label>
                <Input
                  id="hm-company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hm-company-desc">Description</Label>
                <Textarea
                  id="hm-company-desc"
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value.slice(0, 500))}
                  placeholder="Brief description of the company"
                  rows={2}
                  className="resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="hm-company-industry">Industry</Label>
                  <Input
                    id="hm-company-industry"
                    value={companyIndustry}
                    onChange={(e) => setCompanyIndustry(e.target.value)}
                    placeholder="e.g. SaaS"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hm-company-location">Location</Label>
                  <Input
                    id="hm-company-location"
                    value={companyLocation}
                    onChange={(e) => setCompanyLocation(e.target.value)}
                    placeholder="e.g. SF, CA"
                  />
                </div>
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
