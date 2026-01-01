import * as React from "react";
import { Text } from "@react-email/components";
import { BroadcastEmail } from "./broadcast-template";

// Shared text style
const textStyle = {
  color: "#484848",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const listStyle = {
  color: "#484848",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0 8px 20px",
};

export const NewYear2026Email = () => {
  return (
    <BroadcastEmail
      previewText="Happy New Year! Thank you for being part of the AI Jobs Australia community"
      heading="Happy New Year! 🎉"
      content={
        <>
          <Text style={textStyle}>Hi there,</Text>

          <Text style={textStyle}>
            I hope you managed to switch off, recharge, and are stepping into
            2026 feeling excited about what&apos;s ahead.
          </Text>

          <Text style={textStyle}>
            I just wanted to say a genuine <strong>thank you</strong> for being
            part of the AI Jobs Australia community.
          </Text>

          <Text style={textStyle}>
            What started as a simple idea, making it easier to find
            <em>real</em> AI roles in Australia, has grown into something far
            bigger than I imagined, and that&apos;s entirely because of people
            like you.
          </Text>

          <Text style={textStyle}>Over the past year, we&apos;ve seen:</Text>

          <ul style={{ margin: "16px 0", padding: "0 0 0 20px" }}>
            <li style={listStyle}>
              More companies hiring for practical, hands-on AI roles
            </li>
            <li style={listStyle}>
              Growing focus on AI safety, ethics, and responsible deployment
            </li>
            <li style={listStyle}>
              Strong demand across all industries in engineering, data, product,
              and applied AI
            </li>
          </ul>

          <Text style={textStyle}>
            And this year, the focus is simple:
            <br />
            <strong>
              helping you uncover quality roles, including the hidden and future
              opportunities most people never see, with better insights and
              fewer wasted applications.
            </strong>
          </Text>

          <Text style={textStyle}>
            Over the coming months, you&apos;ll see:
          </Text>

          <ul style={{ margin: "16px 0", padding: "0 0 0 20px" }}>
            <li style={listStyle}>
              Even more highly curated AI roles across Australia
            </li>
            <li style={listStyle}>
              Clearer signals on what companies are <em>actually</em> hiring for
            </li>
            <li style={listStyle}>
              Content to help you stay ahead as the market keeps shifting
            </li>
          </ul>

          <Text style={textStyle}>
            <strong>
              I&apos;m actively shaping what AI Jobs Australia becomes this
              year, and I&apos;d genuinely love your input.
            </strong>
          </Text>

          <Text style={textStyle}>
            If there&apos;s <em>one thing</em> that would make this site more
            useful for you, a feature, filter, role type, or even something that
            frustrates you, please hit reply and tell me.
          </Text>

          <Text style={textStyle}>I read and reply to every email I get.</Text>

          <Text style={textStyle}>Thanks again for being here!</Text>

          <Text style={textStyle}>Here&apos;s to a big year ahead 🚀</Text>
        </>
      }
      showSignature={true}
      signatureName="Jake"
      signatureTitle="Founder, AI Jobs Australia"
      postscript="P.S. If someone you know is exploring AI roles this year, feel free to forward this email, the community is always open!"
    />
  );
};

export default NewYear2026Email;
