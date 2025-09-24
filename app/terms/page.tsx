"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-foreground">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Acceptance of Terms
              </h2>
              <p className="mb-4">
                By accessing and using AIJobsAustralia.com.au, you accept and
                agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use
                this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Platform Services</h2>
              <p className="mb-4">
                AIJobsAustralia.com.au provides a platform connecting job
                seekers with employers in the artificial intelligence and
                technology sector within Australia.
              </p>
              <h3 className="text-xl font-medium mb-3">For Job Seekers</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Create profiles and upload resumes</li>
                <li>Search and apply for job opportunities</li>
                <li>Receive job recommendations and alerts</li>
                <li>Communicate with potential employers</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">For Employers</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Post job listings and requirements</li>
                <li>Search candidate profiles</li>
                <li>Manage applications and communications</li>
                <li>Access recruitment analytics and tools</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                User Responsibilities
              </h2>
              <h3 className="text-xl font-medium mb-3">Account Security</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  Maintain the confidentiality of your account credentials
                </li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>
                  Ensure all information provided is accurate and up-to-date
                </li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Content Standards</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Provide truthful and accurate information</li>
                <li>Respect intellectual property rights</li>
                <li>Maintain professional conduct in all interactions</li>
                <li>Comply with applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Prohibited Activities
              </h2>
              <p className="mb-4">Users are prohibited from:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Posting false, misleading, or fraudulent information</li>
                <li>Engaging in discriminatory practices</li>
                <li>Attempting to circumvent platform security measures</li>
                <li>
                  Using the platform for spam or unsolicited communications
                </li>
                <li>Infringing on intellectual property rights</li>
                <li>Engaging in any illegal activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Payment Terms</h2>
              <p className="mb-4">For employer services requiring payment:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>All fees are payable in advance unless otherwise stated</li>
                <li>Prices are subject to change with notice</li>
                <li>Refunds are provided according to our refund policy</li>
                <li>Payment disputes must be raised within 30 days</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Limitation of Liability
              </h2>
              <p className="mb-4">
                AIJobsAustralia.com.au provides the platform &quot;as is&quot; and makes
                no warranties about the accuracy, reliability, or availability
                of the service. We are not liable for any direct, indirect, or
                consequential damages arising from your use of the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Termination</h2>
              <p className="mb-4">
                We may terminate or suspend access to our service immediately,
                without prior notice, for conduct that we believe violates these
                Terms of Service or is harmful to other users of the service,
                us, or third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
              <p className="mb-4">
                These terms shall be governed by and construed in accordance
                with the laws of Australia, and you submit to the jurisdiction
                of the courts of Australia.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
