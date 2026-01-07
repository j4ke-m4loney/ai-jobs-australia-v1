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
          <div className="grid lg:grid-cols-6 gap-8 mb-12">
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
            <div>
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
                    href="/jobs/category/ml-engineer"
                    className="hover:text-background transition-smooth"
                  >
                    ML Engineer Jobs
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
              </ul>
            </div>

            {/* Locations */}
            <div>
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
            </div>

            {/* Quick Links */}
            <div>
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
                    className="hover:text-background transition-smooth"
                  >
                    Job Seeker Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/employer-login"
                    className="hover:text-background transition-smooth"
                  >
                    Employer Sign In
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-background/80">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="hover:text-background transition-smooth"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-background transition-smooth"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-background transition-smooth"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-background/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-background/60 text-sm mb-4 md:mb-0">
                © 2026 AIJobsAustralia.com.au. All rights reserved.
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                <Link
                  href="https://x.com/aijobsaustralia"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-background/60 hover:text-background hover:bg-background/10"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                </Link>
                <Link
                  href="https://www.linkedin.com/company/ai-jobs-australia/?viewAsMember=true"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-background/60 hover:text-background hover:bg-background/10"
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-background/60 hover:text-background hover:bg-background/10"
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
