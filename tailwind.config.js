import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
          "outline-variant": "#c4c7c7",
          "on-secondary": "#ffffff",
          "surface-dim": "#dadad9",
          "secondary": "#735c00",
          "primary": "#000000",
          "secondary-fixed-dim": "#e9c349",
          "primary-fixed": "#e5e2e1",
          "background": "#f9f9f8",
          "on-error-container": "#93000a",
          "on-primary-fixed": "#1c1b1b",
          "inverse-surface": "#2f3130",
          "brushed-silver": "#C0C0C0",
          "surface": "#f9f9f8",
          "on-tertiary": "#ffffff",
          "secondary-container": "#fed65b",
          "pale-gold": "#E3C08D",
          "on-surface-variant": "#444748",
          "outline": "#747878",
          "on-tertiary-fixed-variant": "#45474a",
          "surface-container-low": "#f3f4f3",
          "surface-container-high": "#e8e8e7",
          "inverse-on-surface": "#f1f1f0",
          "surface-container-highest": "#e2e2e2",
          "on-background": "#1a1c1c",
          "on-secondary-container": "#745c00",
          "on-primary-container": "#858383",
          "primary-container": "#1c1b1b",
          "himalayan-mist": "rgba(255, 255, 255, 0.7)",
          "on-error": "#ffffff",
          "on-secondary-fixed-variant": "#574500",
          "tertiary-fixed": "#e2e2e6",
          "tertiary-container": "#1a1c1f",
          "inverse-primary": "#c8c6c5",
          "on-tertiary-fixed": "#1a1c1f",
          "primary-fixed-dim": "#c8c6c5",
          "tertiary": "#000000",
          "surface-variant": "#e2e2e2",
          "surface-tint": "#5f5e5e",
          "surface-container-lowest": "#ffffff",
          "secondary-fixed": "#ffe088",
          "stone-gray": "#E2E2E1",
          "tertiary-fixed-dim": "#c5c6ca",
          "alabaster": "#FDFDFD",
          "on-tertiary-container": "#828488",
          "on-primary-fixed-variant": "#474746",
          "error": "#ba1a1a",
          "on-primary": "#ffffff",
          "surface-container": "#eeeeed",
          "error-container": "#ffdad6",
          "on-secondary-fixed": "#241a00",
          "on-surface": "#1a1c1c"
      },
      borderRadius: {
          "DEFAULT": "0.125rem",
          "lg": "0.25rem",
          "xl": "0.5rem",
          "full": "0.75rem"
      },
      spacing: {
          "container-max": "1280px",
          "gutter": "24px",
          "margin-mobile": "20px",
          "unit": "8px",
          "margin-desktop": "64px"
      },
      fontFamily: {
          "headline-lg": ["Playfair Display"],
          "display-lg": ["Playfair Display"],
          "label-md": ["Hanken Grotesk"],
          "headline-md": ["Playfair Display"],
          "label-sm": ["Hanken Grotesk"],
          "body-lg": ["Hanken Grotesk"],
          "headline-lg-mobile": ["Playfair Display"],
          "body-md": ["Hanken Grotesk"]
      },
      fontSize: {
          "headline-lg": ["40px", { "lineHeight": "48px", "fontWeight": "600" }],
          "display-lg": ["64px", { "lineHeight": "72px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
          "label-md": ["14px", { "lineHeight": "20px", "letterSpacing": "0.05em", "fontWeight": "600" }],
          "headline-md": ["28px", { "lineHeight": "36px", "fontWeight": "500" }],
          "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.03em", "fontWeight": "500" }],
          "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
          "headline-lg-mobile": ["32px", { "lineHeight": "40px", "fontWeight": "600" }],
          "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }]
      }
    }
  },
  plugins: [
    forms,
    containerQueries,
  ],
}
