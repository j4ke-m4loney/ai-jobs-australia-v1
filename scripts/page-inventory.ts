/**
 * Generates a CSV inventory of every public page on aijobsaustralia.com.au.
 *
 * Reads the live sitemap, classifies each URL by page type, and enriches
 * job-detail URLs with their title/company/status/category/location from
 * Supabase. Output lands at scripts/aja-page-inventory.csv, ready to open
 * in Google Sheets.
 *
 * Usage: npx tsx scripts/page-inventory.ts
 */

import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";
import { resolve } from "path";

dotenv.config({ path: ".env.local" });

const SITEMAP_URL = "https://www.aijobsaustralia.com.au/sitemap.xml";
const OUTPUT_PATH = resolve(process.cwd(), "scripts/aja-page-inventory.csv");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type PageType =
  | "Homepage"
  | "Job Detail"
  | "Job Listings"
  | "Category"
  | "Category + Location"
  | "Location"
  | "Search Landing"
  | "Tool"
  | "Tools Index"
  | "Blog Post"
  | "Blog Index"
  | "Company"
  | "Companies Index"
  | "Categories Index"
  | "Hire (Post Job)"
  | "Contact"
  | "Terms"
  | "Privacy"
  | "Other";

interface InventoryRow {
  url: string;
  path: string;
  pageType: PageType;
  jobTitle: string;
  jobStatus: string;
  jobCompany: string;
  jobCategory: string;
  jobLocation: string;
  jobCreated: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function categorise(path: string): { type: PageType; jobId: string | null; companyId: string | null } {
  if (path === "/") return { type: "Homepage", jobId: null, companyId: null };
  if (path === "/jobs") return { type: "Job Listings", jobId: null, companyId: null };
  if (path === "/tools") return { type: "Tools Index", jobId: null, companyId: null };
  if (path === "/blog") return { type: "Blog Index", jobId: null, companyId: null };
  if (path === "/companies") return { type: "Companies Index", jobId: null, companyId: null };
  if (path === "/categories") return { type: "Categories Index", jobId: null, companyId: null };
  if (path === "/hire") return { type: "Hire (Post Job)", jobId: null, companyId: null };
  if (path === "/contact") return { type: "Contact", jobId: null, companyId: null };
  if (path === "/terms") return { type: "Terms", jobId: null, companyId: null };
  if (path === "/privacy-policy") return { type: "Privacy", jobId: null, companyId: null };

  const parts = path.split("/").filter(Boolean);

  // /jobs/<uuid>
  if (parts[0] === "jobs" && parts.length === 2 && UUID_RE.test(parts[1])) {
    return { type: "Job Detail", jobId: parts[1], companyId: null };
  }
  // /jobs/category/<slug>/<city>
  if (parts[0] === "jobs" && parts[1] === "category" && parts.length === 4) {
    return { type: "Category + Location", jobId: null, companyId: null };
  }
  // /jobs/category/<slug>
  if (parts[0] === "jobs" && parts[1] === "category" && parts.length === 3) {
    return { type: "Category", jobId: null, companyId: null };
  }
  // /jobs/location/<city>
  if (parts[0] === "jobs" && parts[1] === "location" && parts.length === 3) {
    return { type: "Location", jobId: null, companyId: null };
  }
  // /jobs/search/<slug>
  if (parts[0] === "jobs" && parts[1] === "search" && parts.length === 3) {
    return { type: "Search Landing", jobId: null, companyId: null };
  }
  // /tools/<slug>
  if (parts[0] === "tools" && parts.length === 2) {
    return { type: "Tool", jobId: null, companyId: null };
  }
  // /blog/<slug>
  if (parts[0] === "blog" && parts.length === 2) {
    return { type: "Blog Post", jobId: null, companyId: null };
  }
  // /company/<uuid>
  if (parts[0] === "company" && parts.length === 2) {
    return { type: "Company", jobId: null, companyId: parts[1] };
  }

  return { type: "Other", jobId: null, companyId: null };
}

async function fetchSitemap(): Promise<string[]> {
  console.log(`Fetching ${SITEMAP_URL} ...`);
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) {
    throw new Error(`Sitemap fetch failed: ${res.status} ${res.statusText}`);
  }
  const xml = await res.text();
  const matches = xml.match(/<loc>([^<]+)<\/loc>/g) ?? [];
  const urls = matches.map((m) => m.replace(/<\/?loc>/g, "").trim());
  console.log(`  → ${urls.length} URLs in sitemap`);
  return urls;
}

async function fetchJobsBatch(ids: string[]) {
  // Supabase .in() comfortably handles a few hundred IDs per call; chunk to be safe.
  const CHUNK = 200;
  const result = new Map<
    string,
    {
      title: string;
      status: string;
      category: string | null;
      location: string | null;
      created_at: string;
      company_name: string | null;
    }
  >();

  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);
    const { data, error } = await supabase
      .from("jobs")
      .select("id, title, status, category, location, created_at, companies ( name )")
      .in("id", chunk);
    if (error) {
      console.error(`  × jobs batch ${i} error: ${error.message}`);
      continue;
    }
    for (const row of data ?? []) {
      const companies = row.companies as { name: string | null } | { name: string | null }[] | null;
      const companyName = Array.isArray(companies)
        ? companies[0]?.name ?? null
        : companies?.name ?? null;
      result.set(row.id, {
        title: row.title,
        status: row.status,
        category: row.category,
        location: row.location,
        created_at: row.created_at,
        company_name: companyName,
      });
    }
  }
  return result;
}

async function fetchCompaniesBatch(ids: string[]) {
  const CHUNK = 200;
  const result = new Map<string, { name: string }>();
  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);
    const { data, error } = await supabase
      .from("companies")
      .select("id, name")
      .in("id", chunk);
    if (error) {
      console.error(`  × companies batch ${i} error: ${error.message}`);
      continue;
    }
    for (const row of data ?? []) {
      result.set(row.id, { name: row.name });
    }
  }
  return result;
}

function escapeCsv(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// Sort order for the CSV — group by page type in roughly the order a human
// would scan them.
const PAGE_TYPE_ORDER: PageType[] = [
  "Homepage",
  "Job Listings",
  "Job Detail",
  "Category",
  "Location",
  "Category + Location",
  "Search Landing",
  "Tools Index",
  "Tool",
  "Blog Index",
  "Blog Post",
  "Companies Index",
  "Company",
  "Categories Index",
  "Hire (Post Job)",
  "Contact",
  "Terms",
  "Privacy",
  "Other",
];

async function main() {
  const urls = await fetchSitemap();

  // First pass: categorise all URLs, collect job + company IDs
  const classified = urls.map((url) => {
    const path = new URL(url).pathname;
    const { type, jobId, companyId } = categorise(path);
    return { url, path, type, jobId, companyId };
  });

  const jobIds = classified.map((r) => r.jobId).filter((x): x is string => !!x);
  const companyIds = classified.map((r) => r.companyId).filter((x): x is string => !!x);

  console.log(`Enriching ${jobIds.length} job URLs from Supabase...`);
  const jobs = await fetchJobsBatch(jobIds);
  console.log(`  → ${jobs.size} jobs matched`);

  console.log(`Enriching ${companyIds.length} company URLs from Supabase...`);
  const companies = await fetchCompaniesBatch(companyIds);
  console.log(`  → ${companies.size} companies matched`);

  // Second pass: build final rows
  const rows: InventoryRow[] = classified.map(({ url, path, type, jobId, companyId }) => {
    const base: InventoryRow = {
      url,
      path,
      pageType: type,
      jobTitle: "",
      jobStatus: "",
      jobCompany: "",
      jobCategory: "",
      jobLocation: "",
      jobCreated: "",
    };

    if (jobId && jobs.has(jobId)) {
      const j = jobs.get(jobId)!;
      base.jobTitle = j.title;
      base.jobStatus = j.status;
      base.jobCompany = j.company_name ?? "";
      base.jobCategory = j.category ?? "";
      base.jobLocation = j.location ?? "";
      base.jobCreated = j.created_at.split("T")[0];
    } else if (companyId && companies.has(companyId)) {
      base.jobCompany = companies.get(companyId)!.name;
    }

    return base;
  });

  // Sort: by page type order, then by job created date desc (active first), then by path
  rows.sort((a, b) => {
    const oa = PAGE_TYPE_ORDER.indexOf(a.pageType);
    const ob = PAGE_TYPE_ORDER.indexOf(b.pageType);
    if (oa !== ob) return oa - ob;
    // Within Job Detail, expired jobs sort after approved
    if (a.pageType === "Job Detail") {
      if (a.jobStatus !== b.jobStatus) {
        if (a.jobStatus === "approved") return -1;
        if (b.jobStatus === "approved") return 1;
      }
      if (a.jobCreated !== b.jobCreated) return b.jobCreated.localeCompare(a.jobCreated);
    }
    return a.path.localeCompare(b.path);
  });

  // Write CSV
  const headers = [
    "URL",
    "Path",
    "Page Type",
    "Job Title",
    "Job Status",
    "Company",
    "Category",
    "Location",
    "Created",
  ];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        escapeCsv(r.url),
        escapeCsv(r.path),
        escapeCsv(r.pageType),
        escapeCsv(r.jobTitle),
        escapeCsv(r.jobStatus),
        escapeCsv(r.jobCompany),
        escapeCsv(r.jobCategory),
        escapeCsv(r.jobLocation),
        escapeCsv(r.jobCreated),
      ].join(","),
    );
  }
  writeFileSync(OUTPUT_PATH, lines.join("\n"), "utf-8");

  // Summary
  const counts = new Map<PageType, number>();
  for (const r of rows) counts.set(r.pageType, (counts.get(r.pageType) ?? 0) + 1);

  console.log(`\nInventory written to: ${OUTPUT_PATH}`);
  console.log(`Total URLs: ${rows.length}\n`);
  console.log("Breakdown by page type:");
  for (const type of PAGE_TYPE_ORDER) {
    const n = counts.get(type) ?? 0;
    if (n > 0) console.log(`  ${type.padEnd(24)} ${n}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
