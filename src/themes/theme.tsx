// theme.ts
import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    displayLarge: React.CSSProperties;
    displayMedium: React.CSSProperties;
    displaySmall: React.CSSProperties;
    headlineLarge: React.CSSProperties;
    headlineMedium: React.CSSProperties;
    headlineSmall: React.CSSProperties;
    titleLarge: React.CSSProperties;
    titleMedium: React.CSSProperties;
    titleSmall: React.CSSProperties;
    bodyLarge: React.CSSProperties;
    bodyMedium: React.CSSProperties;
    bodySmall: React.CSSProperties;
    labelLarge: React.CSSProperties;
    labelMedium: React.CSSProperties;
    labelSmall: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    displayLarge?: React.CSSProperties;
    displayMedium?: React.CSSProperties;
    displaySmall?: React.CSSProperties;
    headlineLarge?: React.CSSProperties;
    headlineMedium?: React.CSSProperties;
    headlineSmall?: React.CSSProperties;
    titleLarge?: React.CSSProperties;
    titleMedium?: React.CSSProperties;
    titleSmall?: React.CSSProperties;
    bodyLarge?: React.CSSProperties;
    bodyMedium?: React.CSSProperties;
    bodySmall?: React.CSSProperties;
    labelLarge?: React.CSSProperties;
    labelMedium?: React.CSSProperties;
    labelSmall?: React.CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    displayLarge: true;
    displayMedium: true;
    displaySmall: true;
    headlineLarge: true;
    headlineMedium: true;
    headlineSmall: true;
    titleLarge: true;
    titleMedium: true;
    titleSmall: true;
    bodyLarge: true;
    bodyMedium: true;
    bodySmall: true;
    labelLarge: true;
    labelMedium: true;
    labelSmall: true;
  }
}

const theme = createTheme({
  typography: {
    fontFamily: "Roboto, sans-serif",
    displayLarge: {
      fontSize: "3.5rem",
      fontWeight: 400,
      lineHeight: 1.16,
    },
    displayMedium: {
      fontSize: "2.8rem",
      fontWeight: 400,
      lineHeight: 1.2,
    },
    displaySmall: {
      fontSize: "2.25rem",
      fontWeight: 400,
      lineHeight: 1.25,
    },
    headlineLarge: {
      fontSize: "2rem",
      fontWeight: 500,
      lineHeight: 1.25,
    },
    headlineMedium: {
      fontSize: "1.75rem",
      fontWeight: 500,
      lineHeight: 1.3,
    },
    headlineSmall: {
      fontSize: "1.5rem",
      fontWeight: 500,
      lineHeight: 1.35,
    },
    titleLarge: {
      fontSize: "1.375rem",
      fontWeight: 500,
      lineHeight: 1.4,
    },
    titleMedium: {
      fontSize: "1.1rem",
      fontWeight: 500,
      lineHeight: 1.45,
    },
    titleSmall: {
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    bodyLarge: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    bodyMedium: {
      fontSize: "0.875rem",
      lineHeight: 1.55,
    },
    bodySmall: {
      fontSize: "0.75rem",
      lineHeight: 1.6,
    },
    labelLarge: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.65,
    },
    labelMedium: {
      fontSize: "0.75rem",
      fontWeight: 500,
      lineHeight: 1.7,
    },
    labelSmall: {
      fontSize: "0.625rem",
      fontWeight: 500,
      lineHeight: 1.75,
    },
  },
});

export default theme;
