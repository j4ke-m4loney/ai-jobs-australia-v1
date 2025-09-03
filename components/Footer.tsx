import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Twitter, Linkedin, Github } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid lg:grid-cols-4 gap-8 mb-12">
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
                Building the #1 platform for artificial intelligence careers in
                Australia. Dedicated to connecting local talent with local
                opportunities.
              </p>

              {/* Newsletter Signup */}
              <div className="max-w-md">
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
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-background/80">
                <li>
                  <a
                    href="#job-seekers"
                    className="hover:text-background transition-smooth"
                  >
                    Job Seekers
                  </a>
                </li>
                <li>
                  <a
                    href="#employers"
                    className="hover:text-background transition-smooth"
                  >
                    Employers
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="hover:text-background transition-smooth"
                  >
                    About
                  </a>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-background transition-smooth"
                  >
                    Contact
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
                © 2024 AIJobsAustralia.com.au. All rights reserved.
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-background/60 hover:text-background hover:bg-background/10"
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-background/60 hover:text-background hover:bg-background/10"
                >
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-background/60 hover:text-background hover:bg-background/10"
                >
                  <Github className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-background/60 hover:text-background hover:bg-background/10"
                >
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
