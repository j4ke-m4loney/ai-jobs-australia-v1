/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "media", // Add explicit dark mode configuration
  theme: {
    extend: {
      colors: {
        // Fixed colors with proper contrast for original design
        border: "hsl(240, 7.9%, 80%)", // Light gray border
        input: "hsl(240, 5.9%, 90%)",
        ring: "hsl(221, 83%, 58%)",
        background: "hsl(0, 0%, 100%)", // Pure white
        foreground: "hsl(240, 10%, 4.9%)", // Dark text
        primary: {
          DEFAULT: "hsl(221, 83%, 58%)", // Vibrant blue
          foreground: "hsl(0, 0%, 98%)", // White text on blue
          light: "hsl(221, 83%, 95%)",
        },
        secondary: {
          DEFAULT: "hsl(240, 4.8%, 95.9%)", // Light gray background
          foreground: "hsl(240, 5.9%, 10%)", // Dark text
        },
        destructive: {
          DEFAULT: "hsl(0, 84%, 60%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        muted: {
          DEFAULT: "hsl(240, 4.8%, 95.9%)", // Light gray
          foreground: "hsl(240, 3.8%, 36.1%)", // Medium gray text
        },
        accent: {
          DEFAULT: "hsl(262, 83%, 58%)", // Vibrant purple
          foreground: "hsl(0, 0%, 98%)",
          light: "hsl(262, 83%, 95%)",
        },
        success: {
          DEFAULT: "hsl(142, 76%, 36%)",
          foreground: "hsl(0, 0%, 98%)",
          light: "hsl(142, 76%, 95%)",
        },
        popover: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(240, 10%, 3.9%)",
        },
        card: {
          DEFAULT: "hsl(0, 0%, 100%)", // White card background
          foreground: "hsl(240, 10%, 3.9%)", // Dark text
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        subtle:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        hover:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
      backgroundImage: {
        "gradient-hero":
          "linear-gradient(135deg, hsl(221, 83%, 58%) 0%, hsl(262, 83%, 58%) 100%)",
        "gradient-subtle":
          "linear-gradient(135deg, hsl(240, 4.8%, 95.9%) 0%, hsl(0, 0%, 100%) 100%)",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
    },
  },
  plugins: [], // Temporarily removed tailwindcss-animate for testing
};
