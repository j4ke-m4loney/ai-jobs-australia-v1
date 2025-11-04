"use client";

import { useState } from "react";
import { ArrowLeft, Mail, Phone, MapPin, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [formTimestamp] = useState(Date.now());
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
    honeypot: "", // Hidden field to catch bots
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Client-side validation functions
  const validateName = (name: string, fieldName: string): string | null => {
    if (!name.trim()) {
      return `${fieldName} is required`;
    }
    if (name.length > 50) {
      return `${fieldName} must be less than 50 characters`;
    }
    if (!/^[a-zA-Z\s\-']+$/.test(name)) {
      return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return "Email is required";
    }
    if (email.length > 100) {
      return "Email must be less than 100 characters";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const validateSubject = (subject: string): string | null => {
    if (!subject.trim()) {
      return "Subject is required";
    }
    if (subject.length < 3) {
      return "Subject must be at least 3 characters";
    }
    if (subject.length > 200) {
      return "Subject must be less than 200 characters";
    }
    return null;
  };

  const validateMessage = (message: string): string | null => {
    if (!message.trim()) {
      return "Message is required";
    }
    if (message.length < 10) {
      return "Message must be at least 10 characters";
    }
    if (message.length > 2000) {
      return "Message must be less than 2000 characters";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const firstNameError = validateName(formData.firstName, "First name");
    if (firstNameError) {
      toast.error("Validation error", { description: firstNameError });
      return;
    }

    const lastNameError = validateName(formData.lastName, "Last name");
    if (lastNameError) {
      toast.error("Validation error", { description: lastNameError });
      return;
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      toast.error("Validation error", { description: emailError });
      return;
    }

    const subjectError = validateSubject(formData.subject);
    if (subjectError) {
      toast.error("Validation error", { description: subjectError });
      return;
    }

    const messageError = validateMessage(formData.message);
    if (messageError) {
      toast.error("Validation error", { description: messageError });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          formTimestamp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Message sent!", {
          description: "We'll get back to you as soon as possible.",
        });
        // Save email and show success message
        setSubmittedEmail(formData.email);
        setIsSuccess(true);
        // Reset form data
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "",
          message: "",
          honeypot: "",
        });
      } else if (response.status === 429) {
        // Rate limit error
        toast.error("Too many submissions", {
          description: data.message || "Please wait before submitting again.",
          duration: 5000,
        });
      } else if (response.status === 400) {
        // Validation or spam error
        toast.error(data.error || "Validation failed", {
          description: data.message || "Please check your input and try again.",
          duration: 5000,
        });
      } else {
        // Server error
        toast.error("Failed to send message", {
          description: data.message || "Please try again later or email us directly.",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Connection error", {
        description: "Please check your internet connection and try again.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendAnother = () => {
    setIsSuccess(false);
    setSubmittedEmail("");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Contact Us
            </h1>
            <p className="text-muted-foreground text-lg">
              We&apos;d love to hear from you. Get in touch with our team.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <Card>
                {!isSuccess ? (
                  <>
                    <CardHeader>
                      <CardTitle>Send us a message</CardTitle>
                      <CardDescription>
                        Fill out the form below and we&apos;ll get back to you as
                        soon as possible.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="How can we help?"
                        value={formData.subject}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your inquiry..."
                        rows={5}
                        value={formData.message}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    {/* Honeypot field - hidden from users, catches bots */}
                    <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
                      <Input
                        type="text"
                        id="honeypot"
                        name="honeypot"
                        value={formData.honeypot}
                        onChange={handleInputChange}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="py-12">
                    <div className="text-center space-y-6">
                      <div className="flex justify-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-2xl font-semibold text-foreground">
                          Message sent successfully!
                        </h3>
                        <p className="text-muted-foreground">
                          Thank you for reaching out to us. We&apos;ve received your message and will get back to you at{" "}
                          <span className="font-medium text-foreground">{submittedEmail}</span>{" "}
                          within 24 hours.
                        </p>
                      </div>

                      <Button onClick={handleSendAnother} variant="outline" className="mt-4">
                        Send another message
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-6">Get in touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Email</h3>
                      <p className="text-muted-foreground">
                        hello@aijobsaustralia.com.au
                      </p>
                      {/* <p className="text-muted-foreground">
                        support@aijobsaustralia.com.au
                      </p> */}
                    </div>
                  </div>

                  {/*
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Phone</h3>
                      <p className="text-muted-foreground">+61 2 1234 5678</p>
                      <p className="text-muted-foreground">+61 400 123 456</p>
                    </div>
                  </div>
*/}

                  {/*
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Office</h3>
                      <p className="text-muted-foreground">
                        Level 10, 123 Collins Street
                        <br />
                        Melbourne, VIC 3000
                        <br />
                        Australia
                      </p>
                    </div>
                  </div>
*/}

                  {/*
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        Business Hours
                      </h3>
                      <p className="text-muted-foreground">
                        Monday - Friday: 9:00 AM - 6:00 PM AEST
                        <br />
                        Saturday: 10:00 AM - 2:00 PM AEST
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
*/}
                </div>
              </div>

              {/*
              <Card>
                <CardHeader>
                  <CardTitle>Quick Support</CardTitle>
                  <CardDescription>
                    Need immediate assistance? Check out our FAQ or reach out
                    directly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    support@aijobsaustralia.com.au
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    +61 2 1234 5678
                  </Button>
                </CardContent>
              </Card>
*/}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
