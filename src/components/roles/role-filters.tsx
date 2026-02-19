"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEBOUNCE_MS = 300;

interface RoleFiltersProps {
  companies: { id: string; name: string }[];
}

export function RoleFilters({ companies }: RoleFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("company") ?? "";
  const locationParam = searchParams.get("location") ?? "";
  const salaryMinParam = searchParams.get("salaryMin") ?? "";
  const salaryMaxParam = searchParams.get("salaryMax") ?? "";

  const [locationInput, setLocationInput] = useState(locationParam);
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  useEffect(() => {
    setLocationInput(locationParam);
  }, [locationParam]);

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      if (locationInput.trim()) params.set("location", locationInput.trim());
      else params.delete("location");
      params.set("page", "1");
      router.push(`/candidate/roles?${params.toString()}`, { scroll: false });
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [locationInput, router]);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.set("page", "1");
      router.push(`/candidate/roles?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const hasFilters =
    companyId ||
    locationParam ||
    salaryMinParam ||
    salaryMaxParam;

  const clearFilters = () => {
    setLocationInput("");
    router.push("/candidate/roles", { scroll: false });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2 w-48">
          <Label htmlFor="filter-company">Company</Label>
          <Select
            value={companyId || "all"}
            onValueChange={(v) => updateParam("company", v === "all" ? "" : v)}
          >
            <SelectTrigger id="filter-company">
              <SelectValue placeholder="All companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All companies</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 w-48">
          <Label htmlFor="filter-location">Location</Label>
          <Input
            id="filter-location"
            placeholder="City or remote"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
          />
        </div>
        <div className="space-y-2 w-32">
          <Label htmlFor="filter-salary-min">Min salary</Label>
          <Input
            id="filter-salary-min"
            type="number"
            placeholder="e.g. 100000"
            value={salaryMinParam}
            onChange={(e) => updateParam("salaryMin", e.target.value)}
          />
        </div>
        <div className="space-y-2 w-32">
          <Label htmlFor="filter-salary-max">Max salary</Label>
          <Input
            id="filter-salary-max"
            type="number"
            placeholder="e.g. 200000"
            value={salaryMaxParam}
            onChange={(e) => updateParam("salaryMax", e.target.value)}
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
