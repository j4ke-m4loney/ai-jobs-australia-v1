import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";

interface Job {
  id: string;
  title: string;
  location: string;
  location_type: string;
  salary_min: number | null;
  salary_max: number | null;
  created_at: string;
  companies: {
    name: string;
    logo_url: string | null;
  } | null;
}

interface JobsByCategory {
  [category: string]: Job[];
}

interface NewsletterEmailProps {
  recipientName?: string;
  jobsByCategory: JobsByCategory;
  totalJobsCount: number;
  unsubscribeToken: string;
}

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobsaustralia.com.au";

export const NewsletterEmail = ({
  recipientName = "there",
  jobsByCategory = {},
  totalJobsCount = 0,
  unsubscribeToken = "",
}: NewsletterEmailProps) => {
  const previewText = `${totalJobsCount}+ new AI jobs in Australia this week`;

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    if (min && max)
      return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    if (max) return `Up to $${(max / 1000).toFixed(0)}k`;
    return null;
  };

  const formatLocation = (location: string, locationType: string) => {
    if (locationType === "remote") return "Remote";
    if (locationType === "hybrid") return `${location} (Hybrid)`;
    return location;
  };

  const categoryTitles: { [key: string]: string } = {
    ai: "AI Jobs",
    ml: "Machine Learning Jobs",
    "data-science": "Data Science Jobs",
    engineering: "Engineering Jobs",
    research: "Research Jobs",
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Link href={baseUrl}>
              <Img
                src={`${baseUrl}/aja-email-192.png`}
                alt="AI Jobs Australia"
                width="200"
                style={logo}
              />
            </Link>
          </Section>

          {/* Title */}
          <Heading style={h1}>Latest AI Jobs in Australia 🚀</Heading>

          {/* Greeting */}
          <Text style={text}>Hi there,</Text>

          <Text style={text}>
            Here are the latest AI job opportunities posted this week in
            Australia.
          </Text>

          <Hr style={hr} />

          {/* Jobs by Category */}
          {Object.entries(jobsByCategory).map(([category, jobs]) => (
            <Section key={category} style={categorySection}>
              <Heading as="h2" style={h2}>
                {categoryTitles[category] || category}
              </Heading>

              {jobs.map((job) => (
                <Section key={job.id} style={jobCard}>
                  <table style={jobTable}>
                    <tr>
                      <td style={jobHeader}>
                        {job.companies?.logo_url && (
                          <Img
                            src={job.companies.logo_url}
                            alt={job.companies.name}
                            width="30"
                            height="30"
                            style={companyLogo}
                          />
                        )}
                        <Text style={companyName}>
                          {job.companies?.name || "Company"}
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Link
                          href={`${baseUrl}/jobs/${job.id}`}
                          style={jobTitle}
                        >
                          {job.title}
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td style={jobMeta}>
                        <span style={metaBadge}>
                          {formatLocation(job.location, job.location_type)}
                        </span>
                        {formatSalary(job.salary_min, job.salary_max) && (
                          <span style={salaryBadge}>
                            {formatSalary(job.salary_min, job.salary_max)}
                          </span>
                        )}
                      </td>
                    </tr>
                  </table>
                </Section>
              ))}

              <Section style={viewAllSection}>
                <Link
                  href={`${baseUrl}/jobs?category=${category}`}
                  style={viewAllLink}
                >
                  View all {categoryTitles[category] || category} →
                </Link>
              </Section>
            </Section>
          ))}

          <Hr style={hr} />

          {/* View All Jobs Button */}
          <Section style={buttonSection}>
            <Link href={`${baseUrl}/jobs`} style={button}>
              View All Jobs
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              AI Jobs Australia - Australia&apos;s #1 Platform for AI Jobs
            </Text>
            <Text style={footerText}>
              <Link
                href={`${baseUrl}/unsubscribe?token=${unsubscribeToken}`}
                style={unsubscribeLink}
              >
                Unsubscribe
              </Link>
              {" • "}
              <Link href={`${baseUrl}`} style={footerLink}>
                aijobsaustralia.com.au
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default NewsletterEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const logoSection = {
  padding: "30px 20px 20px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "32px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
  padding: "0 20px",
};

const h2 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "30px 0 20px 0",
  padding: "0 20px",
};

const text = {
  color: "#484848",
  fontSize: "16px",
  lineHeight: "24px",
  padding: "0 20px",
  margin: "16px 0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "40px 20px",
};

const categorySection = {
  margin: "0 0 40px 0",
};

const jobCard = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  padding: "16px",
  margin: "0 20px 12px 20px",
  border: "1px solid #e6ebf1",
};

const jobTable = {
  width: "100%",
};

const jobHeader = {
  display: "flex",
  alignItems: "center",
  marginBottom: "8px",
};

const companyLogo = {
  borderRadius: "50%",
  marginRight: "8px",
  verticalAlign: "middle",
};

const companyName = {
  fontSize: "14px",
  color: "#666",
  margin: "0",
  display: "inline",
  paddingLeft: "8px",
};

const postedTime = {
  fontSize: "14px",
  color: "#999",
  margin: "0",
  float: "right" as const,
};

const jobTitle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1a1a1a",
  textDecoration: "none",
  display: "block",
  margin: "8px 0",
};

const jobMeta = {
  marginTop: "8px",
};

const metaBadge = {
  display: "inline-block",
  padding: "4px 10px",
  backgroundColor: "#e3f2fd",
  borderRadius: "4px",
  fontSize: "13px",
  color: "#1976d2",
  marginRight: "8px",
};

const salaryBadge = {
  display: "inline-block",
  padding: "4px 10px",
  backgroundColor: "#e8f5e9",
  borderRadius: "4px",
  fontSize: "13px",
  color: "#2e7d32",
  fontWeight: "600",
};

const viewAllSection = {
  padding: "10px 20px",
};

const viewAllLink = {
  color: "#1976d2",
  fontSize: "14px",
  textDecoration: "none",
  fontWeight: "500",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#1976d2",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const footer = {
  textAlign: "center" as const,
  margin: "32px 0 0 0",
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "8px 0",
};

const footerLink = {
  color: "#1976d2",
  textDecoration: "none",
};

const unsubscribeLink = {
  color: "#8898aa",
  textDecoration: "underline",
};
