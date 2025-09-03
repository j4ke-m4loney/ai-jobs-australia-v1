"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-foreground">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
              <p className="mb-4">
                At AIJobsAustralia.com.au, we are committed to protecting your
                privacy and ensuring the security of your personal information.
                This Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you use our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Information We Collect
              </h2>
              <h3 className="text-xl font-medium mb-3">Personal Information</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Name, email address, and contact information</li>
                <li>
                  Professional information including resume, work experience,
                  and skills
                </li>
                <li>Account credentials and authentication information</li>
                <li>Profile information and preferences</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Usage Information</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Platform usage data and analytics</li>
                <li>Job search and application history</li>
                <li>Communication records and feedback</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>To provide and improve our job matching services</li>
                <li>
                  To facilitate communication between job seekers and employers
                </li>
                <li>To send relevant job notifications and platform updates</li>
                <li>To analyze platform usage and improve user experience</li>
                <li>
                  To comply with legal obligations and protect user safety
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Information Sharing
              </h2>
              <p className="mb-4">
                We do not sell your personal information. We may share your
                information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>With potential employers when you apply for jobs</li>
                <li>
                  With service providers who assist in platform operations
                </li>
                <li>When required by law or to protect our legal rights</li>
                <li>In connection with business transfers or mergers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures
                to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Access and review your personal information</li>
                <li>Request corrections to inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Data portability and export rights</li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
