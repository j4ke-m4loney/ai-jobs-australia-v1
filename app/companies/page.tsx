"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CompanyCard } from "@/components/companies/CompanyCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Building2, MapPin } from "lucide-react";

interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  website: string | null;
}

interface Job {
  id: string;
  company_id: string | null;
  location: string;
  status: string;
}

// Extract city name from location string
function extractCity(location: string): string {
  const cities = [
    "Sydney",
    "Melbourne",
    "Brisbane",
    "Perth",
    "Adelaide",
    "Canberra",
  ];
  const foundCity = cities.find((city) =>
    location.toLowerCase().includes(city.toLowerCase())
  );
  return foundCity || "Other";
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all companies
        const { data: companiesData, error: companiesError } = await supabase
          .from("companies")
          .select("*")
          .order("name");

        if (companiesError) throw companiesError;
        setCompanies(companiesData || []);

        // Fetch all jobs for location filtering
        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select("id, company_id, location, status");

        if (jobsError) throw jobsError;
        setJobs(jobsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Get unique cities from jobs
  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    jobs.forEach((job) => {
      const city = extractCity(job.location);
      if (city !== "Other") {
        cities.add(city);
      }
    });
    return Array.from(cities).sort();
  }, [jobs]);

  // Filter companies by location
  const filteredCompanies = useMemo(() => {
    if (selectedLocation === "all") {
      return companies;
    }

    // Get company IDs that have jobs in the selected location
    const companyIdsInLocation = new Set(
      jobs
        .filter((job) => {
          const city = extractCity(job.location);
          return city === selectedLocation;
        })
        .map((job) => job.company_id)
        .filter((id): id is string => id !== null)
    );

    // Filter companies to those with jobs in selected location
    return companies.filter((company) => companyIdsInLocation.has(company.id));
  }, [companies, jobs, selectedLocation]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Building2 className="w-4 h-4" />
              AU Companies Hiring AI Talent
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Companies Hiring AI Talent in Australia
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover leading companies working on AI and Machine Learning or
            adapting to the AI landscape across Australia. From large
            corporations to innovative startups.
          </p>
        </section>

        {/* Filter and Count Section */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Location Filter */}
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Company Count */}
            <p className="text-sm text-muted-foreground">
              {loading ? (
                "Loading companies..."
              ) : (
                <>
                  Showing {filteredCompanies.length}{" "}
                  {filteredCompanies.length === 1 ? "company" : "companies"}
                  {selectedLocation !== "all" && ` in ${selectedLocation}`}
                </>
              )}
            </p>
          </div>
        </section>

        {/* Companies Grid */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-muted rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No companies found</h3>
              <p className="text-muted-foreground mb-6">
                {selectedLocation === "all"
                  ? "No companies are currently in the database."
                  : `No companies found with jobs in ${selectedLocation}.`}
              </p>
              {selectedLocation !== "all" && (
                <button
                  onClick={() => setSelectedLocation("all")}
                  className="text-primary hover:underline"
                >
                  View all companies
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  name={company.name}
                  logo_url={company.logo_url}
                  website={company.website}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
