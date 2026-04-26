import { Button } from "@/components/ui/button";
import { Mail, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid lg:grid-cols-7 gap-8 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/aja-300x300-blue-logo.svg"
                  alt="AI Jobs Australia Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 brightness-0 invert"
                />
                <span className="text-xl font-bold">
                  AIJobsAustralia.com.au
                </span>
              </div>
              <p className="text-background/80 mb-6 max-w-md">
                Australia&apos;s #1 platform for careers in AI, ML and Data
                Science. Connecting local talent with local opportunities.
              </p>
              {/* Newsletter Signup */}
              {/* <div className="max-w-md">
                <h4 className="font-semibold mb-3">Stay Updated</h4>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="johndoe@email.com"
                    className="bg-background/10 border-background/20 text-background placeholder:text-background/60"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-background text-foreground hover:bg-background/90"
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </div> */}
            </div>

            {/* Job Categories */}
            <nav aria-label="AI Job Categories">
              <h4 className="font-semibold mb-4">AI Job Categories</h4>
              <ul className="space-y-2 text-background/80">
                <li>
                  <Link
                    href="/jobs/category/ai-engineer"
                    className="hover:text-background transition-smooth"
                  >
                    AI Engineer Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs/category/machine-learning-engineer"
                    className="hover:text-background transition-smooth"
                  >
                    ML Engineer Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs/category/data-scientist"
                    className="hover:text-background transition-smooth"
                  >
                    Data Scientist Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs/category/data-analyst"
                    className="hover:text-background transition-smooth"
                  >
                    Data Analyst Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs/category/software-engineer"
                    className="hover:text-background transition-smooth"
                  >
                    Software Engineer Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className="hover:text-background transition-smooth font-medium"
                  >
                    Browse all →
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Locations */}
            <nav aria-label="Browse by Location">
              <h4 className="font-semibold mb-4">Browse by Location</h4>
              <ul className="space-y-2 text-background/80">
                <li>
                  <Link
                    href="/jobs/location/sydney"
                    className="hover:text-background transition-smooth"
                  >
                    AI Jobs in Sydney
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs/location/melbourne"
                    className="hover:text-background transition-smooth"
                  >
                    AI Jobs in Melbourne
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs/location/brisbane"
                    className="hover:text-background transition-smooth"
                  >
                    AI Jobs in Brisbane
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs/location/perth"
                    className="hover:text-background transition-smooth"
                  >
                    AI Jobs in Perth
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs/location/canberra"
                    className="hover:text-background transition-smooth"
                  >
                    AI Jobs in Canberra
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs/location/remote"
                    className="hover:text-background transition-smooth"
                  >
                    Remote AI Jobs
                  </Link>
                </li>
              </ul>
            </nav>

            {/* States */}
            <nav aria-label="Browse by State">
              <h4 className="font-semibold mb-4">Browse by State</h4>
              <ul className="space-y-2 text-background/80">
                <li>
                  <Link
                    href="/jobs/location/new-south-wales"
                    className="hover:text-background transition-smooth"
                  >
                    AI Jobs in NSW
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs/location/victoria"
                    className="hover:text-background transition-smooth"
                  >
                    AI Jobs in Victoria
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs/location/queensland"
                    className="hover:text-background transition-smooth"
                  >
                    AI Jobs in Queensland
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs/location/western-australia"
                    className="hover:text-background transition-smooth"
                  >
                    AI Jobs in WA
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs/location/south-australia"
                    className="hover:text-background transition-smooth"
                  >
                    AI Jobs in SA
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs/location/australian-capital-territory"
                    className="hover:text-background transition-smooth"
                  >
                    AI Jobs in ACT
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs/location/tasmania"
                    className="hover:text-background transition-smooth"
                  >
                    AI Jobs in Tasmania
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs/location/northern-territory"
                    className="hover:text-background transition-smooth"
                  >
                    AI Jobs in NT
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Quick Links */}
            <nav aria-label="Platform">
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-background/80">
                <li>
                  <Link
                    href="/jobs"
                    className="hover:text-background transition-smooth"
                  >
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/companies"
                    className="hover:text-background transition-smooth"
                  >
                    Companies
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-background transition-smooth"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools"
                    className="hover:text-background transition-smooth"
                  >
                    Free Tools
                  </Link>
                </li>
                <li>
                  <Link
                    href="/hire"
                    className="hover:text-background transition-smooth"
                  >
                    Post Job
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    rel="nofollow"
                    className="hover:text-background transition-smooth"
                  >
                    Job Seeker Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/employer-login"
                    rel="nofollow"
                    className="hover:text-background transition-smooth"
                  >
                    Employer Sign In
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Filter Jobs — combined hub page entry points (experience, type, salary) */}
            <nav aria-label="Filter Jobs">
              <h4 className="font-semibold mb-4">Filter Jobs</h4>
              <div className="space-y-4">
                <div>
                  <h5 className="text-background/50 text-xs uppercase tracking-wider mb-2">By Experience</h5>
                  <ul className="space-y-2 text-background/80">
                    <li>
                      <Link
                        href="/jobs/seniority/senior"
                        className="hover:text-background transition-smooth"
                      >
                        Senior AI Jobs
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-background/50 text-xs uppercase tracking-wider mb-2">By Type</h5>
                  <ul className="space-y-2 text-background/80">
                    <li>
                      <Link
                        href="/jobs/type/contract"
                        className="hover:text-background transition-smooth"
                      >
                        Contract AI Jobs
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/jobs/type/internship"
                        className="hover:text-background transition-smooth"
                      >
                        AI Internships
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-background/50 text-xs uppercase tracking-wider mb-2">By Salary</h5>
                  <ul className="space-y-2 text-background/80">
                    <li>
                      <Link
                        href="/jobs/salary/100k-plus"
                        className="hover:text-background transition-smooth"
                      >
                        AI Jobs $100k+
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/jobs/salary/120k-plus"
                        className="hover:text-background transition-smooth"
                      >
                        AI Jobs $120k+
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/jobs/salary/150k-plus"
                        className="hover:text-background transition-smooth"
                      >
                        AI Jobs $150k+
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/jobs/salary/200k-plus"
                        className="hover:text-background transition-smooth"
                      >
                        AI Jobs $200k+
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-background/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-background/60 text-sm">
                <span>© 2026 AIJobsAustralia.com.au</span>
                <span className="hidden md:inline" aria-hidden="true">·</span>
                <Link href="/privacy-policy" className="hover:text-background transition-smooth">
                  Privacy
                </Link>
                <span className="hidden md:inline" aria-hidden="true">·</span>
                <Link href="/terms" className="hover:text-background transition-smooth">
                  Terms
                </Link>
                <span className="hidden md:inline" aria-hidden="true">·</span>
                <Link href="/contact" className="hover:text-background transition-smooth">
                  Contact
                </Link>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                <Link
                  href="https://x.com/aijobsaustralia"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on X (Twitter)"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-background/60 hover:text-background hover:bg-background/10"
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                </Link>
                <Link
                  href="https://www.linkedin.com/company/ai-jobs-australia/?viewAsMember=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on LinkedIn"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-background/60 hover:text-background hover:bg-background/10"
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/contact" aria-label="Contact us">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-background/60 hover:text-background hover:bg-background/10"
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
