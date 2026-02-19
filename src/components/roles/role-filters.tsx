"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  const [companySearch, setCompanySearch] = useState("");
  const [companyOpen, setCompanyOpen] = useState(false);
  const companyRef = useRef<HTMLDivElement>(null);
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const selectedCompany = companies.find((c) => c.id === companyId);

  useEffect(() => {
    setLocationInput(locationParam);
  }, [locationParam]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) {
        setCompanyOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      if (locationInput.trim()) params.set("location", locationInput.trim());
      else params.delete("location");
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `/candidate/roles?${qs}` : "/candidate/roles", { scroll: false });
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [locationInput, router]);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `/candidate/roles?${qs}` : "/candidate/roles", { scroll: false });
    },
    [router, searchParams]
  );

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  const hasFilters =
    companyId ||
    locationParam ||
    salaryMinParam ||
    salaryMaxParam;

  const clearFilters = () => {
    setLocationInput("");
    setCompanySearch("");
    router.replace("/candidate/roles", { scroll: false });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2 w-48 relative" ref={companyRef}>
          <Label htmlFor="filter-company">Company</Label>
          <Input
            id="filter-company"
            placeholder="Search companies..."
            value={companyOpen ? companySearch : (selectedCompany?.name ?? companySearch)}
            onChange={(e) => {
              setCompanySearch(e.target.value);
              if (!companyOpen) setCompanyOpen(true);
              if (companyId) updateParam("company", "");
            }}
            onFocus={() => {
              setCompanyOpen(true);
              setCompanySearch("");
            }}
            autoComplete="off"
          />
          {companyOpen && (
            <div className="absolute z-50 top-full mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md max-h-48 overflow-y-auto">
              <button
                type="button"
                className={cn(
                  "w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors",
                  !companyId && "text-foreground font-medium"
                )}
                onClick={() => {
                  updateParam("company", "");
                  setCompanySearch("");
                  setCompanyOpen(false);
                }}
              >
                All companies
              </button>
              {filteredCompanies.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors",
                    companyId === c.id && "text-foreground font-medium"
                  )}
                  onClick={() => {
                    updateParam("company", c.id);
                    setCompanySearch("");
                    setCompanyOpen(false);
                  }}
                >
                  {c.name}
                </button>
              ))}
              {filteredCompanies.length === 0 && (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  No companies found
                </p>
              )}
            </div>
          )}
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
