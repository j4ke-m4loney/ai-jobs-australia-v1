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
import { categorySlugToName } from "@/lib/categories/generator";

interface Job {
  id: string;
  title: string;
  location: string;
  location_type: string;
  salary_min: number | null;
  salary_max: number | null;
  show_salary: boolean;
  created_at: string;
  companies: {
    name: string;
    logo_url: string | null;
  } | null;
}

interface JobsByCategory {
  [category: string]: Job[];
}

interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  destination_url: string;
  tagline?: string | null;
  hero_image_url?: string | null;
  headline?: string | null;
  description?: string | null;
  cta_text: string;
  cta_color: string;
}

interface FeaturedJob {
  id: string;
  title: string;
  location: string;
  location_type: string;
  salary_min: number | null;
  salary_max: number | null;
  show_salary: boolean;
  highlights: string[] | null;
  companies: {
    name: string;
    logo_url: string | null;
  } | null;
}

interface NewsletterEmailProps {
  jobsByCategory: JobsByCategory;
  totalJobsCount: number;
  introText?: string;
  outroText?: string;
  sponsor?: Sponsor | null;
  featuredJob?: FeaturedJob | null;
  showFeaturedHighlights?: boolean;
}

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobsaustralia.com.au";

// Sponsor Header Component - "Supported by..." with logo
const SponsorHeader = ({ sponsor }: { sponsor: Sponsor }) => (
  <Section style={sponsorHeaderSection}>
    <Text style={supportedByText}>Supported by...</Text>
    <Link href={sponsor.destination_url}>
      <Img
        src={sponsor.logo_url}
        alt={sponsor.name}
        width="180"
        style={sponsorHeaderLogo}
      />
    </Link>
  </Section>
);

// Sponsor Main Card Component - Featured sponsor showcase
const SponsorMainCard = ({ sponsor }: { sponsor: Sponsor }) => (
  <Section style={sponsorCardSection}>
    <Text style={sponsorLabel}>Today&apos;s newsletter is supported by {sponsor.name}</Text>
    {sponsor.hero_image_url && (
      <Link href={sponsor.destination_url}>
        <Img
          src={sponsor.hero_image_url}
          alt={sponsor.name}
          style={sponsorHeroImage}
        />
      </Link>
    )}
    {sponsor.headline && (
      <Heading style={sponsorHeadline}>{sponsor.headline}</Heading>
    )}
    {sponsor.description && (
      <Text style={sponsorDescription}>{sponsor.description}</Text>
    )}
    <Link
      href={sponsor.destination_url}
      style={{
        ...sponsorCtaButton,
        backgroundColor: sponsor.cta_color,
      }}
    >
      {sponsor.cta_text}
    </Link>
  </Section>
);

// Sponsor Footer Component - Secondary mention
const SponsorFooter = ({ sponsor }: { sponsor: Sponsor }) => (
  <Section style={sponsorFooterSection}>
    <Text style={footerSponsorText}>
      AI Jobs Australia is supported by {sponsor.name}
    </Text>
    {sponsor.description && (
      <Text style={sponsorDescription}>{sponsor.description}</Text>
    )}
    <Link
      href={sponsor.destination_url}
      style={{
        ...sponsorCtaButton,
        backgroundColor: sponsor.cta_color,
      }}
    >
      {sponsor.cta_text}
    </Link>
  </Section>
);

// Featured Job Card Component - Highlighted job placement
const FeaturedJobCard = ({
  job,
  baseUrl,
  formatSalary,
  formatLocation,
  showHighlights = true,
}: {
  job: FeaturedJob;
  baseUrl: string;
  formatSalary: (min: number | null, max: number | null) => string | null;
  formatLocation: (location: string, locationType: string) => string;
  showHighlights?: boolean;
}) => (
  <Section style={featuredJobSection}>
    <Text style={featuredJobLabel}>Featured Opportunity</Text>
    <Section style={featuredJobCard}>
      <table style={featuredJobTable}>
        <tr>
          <td style={featuredJobHeader}>
            {job.companies?.logo_url && (
              <Img
                src={job.companies.logo_url}
                alt={job.companies.name}
                width="40"
                height="40"
                style={featuredCompanyLogo}
              />
            )}
            <Text style={featuredCompanyName}>
              {job.companies?.name || "Company"}
            </Text>
          </td>
        </tr>
        <tr>
          <td>
            <Link
              href={`${baseUrl}/jobs/${job.id}`}
              style={featuredJobTitle}
            >
              {job.title}
            </Link>
          </td>
        </tr>
        <tr>
          <td style={featuredJobMeta}>
            <span style={featuredMetaBadge}>
              {formatLocation(job.location, job.location_type)}
            </span>
            {job.show_salary !== false &&
              formatSalary(job.salary_min, job.salary_max) && (
                <span style={featuredSalaryBadge}>
                  {formatSalary(job.salary_min, job.salary_max)}
                </span>
              )}
          </td>
        </tr>
        {showHighlights && job.highlights && job.highlights.filter(h => h).length > 0 && (
          <tr>
            <td style={featuredHighlightsCell}>
              <ul style={featuredHighlightsList}>
                {job.highlights.filter(h => h).slice(0, 3).map((highlight, index) => (
                  <li key={index} style={featuredHighlightItem}>
                    {highlight}
                  </li>
                ))}
              </ul>
            </td>
          </tr>
        )}
        <tr>
          <td style={featuredJobButtonCell}>
            <Link href={`${baseUrl}/jobs/${job.id}`} style={featuredJobButton}>
              View Job
            </Link>
          </td>
        </tr>
      </table>
    </Section>
  </Section>
);

export const NewsletterEmail = ({
  jobsByCategory = {},
  totalJobsCount = 0,
  introText = "",
  outroText = "",
  sponsor = null,
  featuredJob = null,
  showFeaturedHighlights = true,
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

  const formatPostedTime = (createdAt: string) => {
    const now = new Date();
    const posted = new Date(createdAt);
    const diffInMs = now.getTime() - posted.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "New";
    if (diffInDays === 1) return "1d";
    if (diffInDays <= 7) return `${diffInDays}d`;
    return `${Math.floor(diffInDays / 7)}w`;
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
          {/* Logo with Text */}
          <Section style={logoSection}>
            <Link href={baseUrl} style={logoLink}>
              <table style={logoTable}>
                <tr>
                  <td style={logoIconCell}>
                    <Img
                      src={`${baseUrl}/aja-email-192.png`}
                      alt="AI Jobs Australia"
                      width="44"
                      height="44"
                      style={logoIcon}
                    />
                  </td>
                  <td style={logoTextCell}>
                    <span style={logoText}>AI Jobs Australia</span>
                  </td>
                </tr>
              </table>
            </Link>
          </Section>

          {/* SPONSOR HEADER - "Supported by..." */}
          {sponsor && <SponsorHeader sponsor={sponsor} />}

          {/* Title */}
          <Heading style={h1}>Latest AI Jobs 🚀</Heading>

          {/* Greeting */}
          <Text style={text}>Hi there,</Text>

          {/* Custom Intro Text */}
          {introText && (
            <Section style={{ padding: "0 20px", margin: "16px 0" }}>
              <div
                style={{
                  color: "#484848",
                  fontSize: "16px",
                  lineHeight: "24px",
                }}
                dangerouslySetInnerHTML={{ __html: introText }}
              />
            </Section>
          )}

          {/* FEATURED JOB - Highlighted job placement */}
          {featuredJob && (
            <>
              <Hr style={hr} />
              <FeaturedJobCard
                job={featuredJob}
                baseUrl={baseUrl}
                formatSalary={formatSalary}
                formatLocation={formatLocation}
                showHighlights={showFeaturedHighlights}
              />
            </>
          )}

          <Hr style={hr} />

          {/* SPONSOR MAIN CARD - Featured placement */}
          {sponsor && (
            <>
              <SponsorMainCard sponsor={sponsor} />
            </>
          )}

          {/* Decorative Divider */}
          <Section style={dotDividerSection}>
            <Text style={dotDivider}>•  •  •</Text>
          </Section>

          {/* Recent Jobs Heading */}
          <Heading as="h2" style={recentJobsHeading}>Recent AI Jobs</Heading>

          {/* Jobs by Category */}
          {Object.entries(jobsByCategory).map(([category, jobs]) => (
            <Section key={category} style={categorySection}>
              <Heading as="h2" style={h2}>
                {categoryTitles[category] || `${categorySlugToName(category)} Jobs`}
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
                      <td style={postedTimeCell}>
                        <span style={postedTimeBadge}>
                          {formatPostedTime(job.created_at)}
                        </span>
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
                        {job.show_salary !== false &&
                          formatSalary(job.salary_min, job.salary_max) && (
                            <span style={salaryBadge}>
                              {formatSalary(job.salary_min, job.salary_max)}
                            </span>
                          )}
                      </td>
                    </tr>
                  </table>
                </Section>
              ))}
            </Section>
          ))}

          <Hr style={hr} />

          {/* View All Jobs Button */}
          <Section style={buttonSection}>
            <Link href={`${baseUrl}/jobs`} style={button}>
              View All Jobs
            </Link>
          </Section>

          {/* Decorative Divider */}
          <Section style={dotDividerSection}>
            <Text style={dotDivider}>•  •  •</Text>
          </Section>

          {/* SPONSOR FOOTER - Secondary mention */}
          {sponsor && (
            <>
              <Hr style={hr} />
              <SponsorFooter sponsor={sponsor} />
            </>
          )}

          {/* Custom Outro Text */}
          {outroText && (
            <Section style={{ padding: "0 20px", margin: "16px 0" }}>
              <div
                style={{
                  color: "#484848",
                  fontSize: "16px",
                  lineHeight: "24px",
                  textAlign: "center",
                }}
                dangerouslySetInnerHTML={{ __html: outroText }}
              />
            </Section>
          )}

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              AI Jobs Australia - Australia&apos;s #1 Platform for AI Jobs
            </Text>
            <Text style={footerText}>
              <Link
                href="{{{RESEND_UNSUBSCRIBE_URL}}}"
                style={unsubscribeLink}
              >
                Unsubscribe
              </Link>
              {" • "}
              <Link href={`${baseUrl}/advertise`} style={footerLink}>
                Advertise
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
  backgroundColor: "#ffffff",
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

const logoLink = {
  textDecoration: "none",
};

const logoTable = {
  margin: "0 auto",
};

const logoIconCell = {
  verticalAlign: "middle",
  paddingRight: "6px",
};

const logoIcon = {
  display: "block",
};

const logoTextCell = {
  verticalAlign: "middle",
};

const logoText = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1976d2",
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

const recentJobsHeading = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
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
  padding: "12px 20px",
  margin: "0 0 16px 0",
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

const postedTimeCell = {
  textAlign: "right" as const,
  verticalAlign: "middle" as const,
};

const postedTimeBadge = {
  display: "inline-block",
  padding: "4px 8px",
  backgroundColor: "#f1f5f9",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: "500",
  color: "#64748b",
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

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const dotDividerSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const dotDivider = {
  color: "#cbd5e1",
  fontSize: "18px",
  letterSpacing: "8px",
  margin: "0",
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

// Sponsor Header Styles
const sponsorHeaderSection = {
  textAlign: "center" as const,
  margin: "24px 0",
  padding: "0 20px",
};

const supportedByText = {
  fontSize: "11px",
  fontWeight: "500",
  color: "#8898aa",
  letterSpacing: "0.5px",
  marginBottom: "12px",
  textTransform: "uppercase" as const,
};

const sponsorHeaderLogo = {
  margin: "0 auto",
  display: "block",
};

// Sponsor Main Card Styles
const sponsorCardSection = {
  margin: "32px 0",
};

const sponsorLabel = {
  fontSize: "10px",
  fontWeight: "600",
  color: "#8898aa",
  letterSpacing: "1px",
  marginBottom: "16px",
  padding: "0 20px",
  textAlign: "center" as const,
};

const sponsorHeroImage = {
  width: "100%",
  maxWidth: "600px",
  borderRadius: "8px",
  margin: "0 auto 20px",
  display: "block",
};

const sponsorHeadline = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#1a1a1a",
  margin: "16px 20px",
  lineHeight: "1.4",
};

const sponsorDescription = {
  fontSize: "15px",
  color: "#484848",
  margin: "16px 20px",
  lineHeight: "1.75",
  whiteSpace: "pre-wrap" as const,
};

const sponsorCtaButton = {
  backgroundColor: "#009306",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 28px",
  margin: "16px 20px",
};

// Sponsor Footer Styles
const sponsorFooterSection = {
  margin: "32px 0",
  padding: "0 20px",
  textAlign: "center" as const,
};

const footerSponsorText = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#666",
  margin: "12px 0",
};

// Featured Job Styles
const featuredJobSection = {
  margin: "32px 0",
  padding: "0 20px",
};

const featuredJobLabel = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#1976d2",
  letterSpacing: "0.5px",
  marginBottom: "16px",
  textTransform: "uppercase" as const,
};

const featuredJobCard = {
  backgroundColor: "#f8fafc",
  borderLeft: "4px solid #1976d2",
  borderRadius: "8px",
  padding: "20px",
};

const featuredJobTable = {
  width: "100%",
};

const featuredJobHeader = {
  display: "flex",
  alignItems: "center",
  marginBottom: "12px",
};

const featuredCompanyLogo = {
  borderRadius: "8px",
  marginRight: "12px",
  verticalAlign: "middle",
};

const featuredCompanyName = {
  fontSize: "15px",
  fontWeight: "500",
  color: "#666",
  margin: "0",
  display: "inline",
  paddingLeft: "12px",
};

const featuredJobTitle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#1a1a1a",
  textDecoration: "none",
  display: "block",
  margin: "12px 0",
  lineHeight: "1.3",
};

const featuredJobMeta = {
  marginTop: "12px",
};

const featuredMetaBadge = {
  display: "inline-block",
  padding: "6px 12px",
  backgroundColor: "#e3f2fd",
  borderRadius: "4px",
  fontSize: "13px",
  color: "#1976d2",
  marginRight: "8px",
};

const featuredSalaryBadge = {
  display: "inline-block",
  padding: "6px 12px",
  backgroundColor: "#e8f5e9",
  borderRadius: "4px",
  fontSize: "13px",
  color: "#2e7d32",
  fontWeight: "600",
};

const featuredJobButtonCell = {
  paddingTop: "16px",
};

const featuredJobButton = {
  backgroundColor: "#1976d2",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "10px 24px",
};

const featuredHighlightsCell = {
  paddingTop: "16px",
};

const featuredHighlightsList = {
  margin: "0",
  paddingLeft: "20px",
  listStyleType: "disc" as const,
};

const featuredHighlightItem = {
  fontSize: "14px",
  color: "#484848",
  lineHeight: "1.6",
  marginBottom: "4px",
};
