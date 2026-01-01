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

interface BroadcastEmailProps {
  previewText: string;
  heading: string;
  content: React.ReactNode;
  showSignature?: boolean;
  signatureName?: string;
  signatureTitle?: string;
  postscript?: string;
}

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobsaustralia.com.au";

export const BroadcastEmail = ({
  previewText,
  heading,
  content,
  showSignature = true,
  signatureName = "Jake",
  signatureTitle = "Founder, AI Jobs Australia",
  postscript,
}: BroadcastEmailProps) => {
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
                width="100"
                style={logo}
              />
            </Link>
          </Section>

          {/* Heading */}
          <Heading style={h1}>{heading}</Heading>

          {/* Content */}
          <Section style={contentSection}>{content}</Section>

          {/* Signature */}
          {showSignature && (
            <Section style={signatureSection}>
              <Text style={signatureText}>
                Cheers,
                <br />
                <strong>{signatureName}</strong>
                <br />
                {signatureTitle}
              </Text>
            </Section>
          )}

          {/* Postscript */}
          {postscript && (
            <Section style={postscriptSection}>
              <Text style={postscriptText}>{postscript}</Text>
            </Section>
          )}

          <Hr style={hr} />

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

export default BroadcastEmail;

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

const contentSection = {
  padding: "0 20px",
};

const signatureSection = {
  padding: "0 20px",
  marginTop: "32px",
};

const signatureText = {
  color: "#484848",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
};

const postscriptSection = {
  padding: "0 20px",
  marginTop: "24px",
};

const postscriptText = {
  color: "#484848",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
  fontStyle: "italic" as const,
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "40px 20px",
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
