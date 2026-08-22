import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAF9F6",
        surface: "#FFFFFF",
        charcoal: {
          50: "#F6F7F9",
          100: "#ECEEF2",
          200: "#D5D8E0",
          300: "#ADB2C0",
          400: "#7E869B",
          500: "#576077",
          600: "#3F4659",
          700: "#2B303E",
          800: "#1C1F28",
          900: "#121316",
          950: "#090A0C",
        },
        monad: {
          purple: "#7C3AED",
          indigo: "#6366F1",
          deep: "#4F46E5",
          light: "#EEF2FF",
          cyan: "#06B6D4",
        },
        brand: {
          primary: "#121316",
          accent: "#6366F1",
          secondary: "#38BDF8",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
        "glass-hover": "0 14px 40px 0 rgba(31, 38, 135, 0.12)",
        "glass-elevated": "0 20px 50px -12px rgba(18, 19, 22, 0.15)",
        ticket: "0 25px 60px -15px rgba(99, 102, 241, 0.18)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-up": "scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-subtle": "pulseSubtle 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleUp: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
