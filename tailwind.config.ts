import type { Config } from "tailwindcss";

// Tokens de marca do Family Pom's — ver docs/design.md para o racional
// por trás de cada escolha (paleta extraída da logo, tipografia etc.)
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FAF7F1", // fundo geral, off-white quente
        surface: "#FFFFFF",
        ink: "#26241F", // texto principal
        "ink-soft": "#59564C",
        pine: {
          50: "#F1F6F2",
          100: "#E1ECE3",
          200: "#C2D9C7",
          300: "#9CC0A4",
          400: "#7C9C82", // verde-sálvia — cor de marca
          500: "#5E8267",
          600: "#476651",
          700: "#324A3B", // verde profundo — botões, texto de destaque
          800: "#26372B"
        },
        blush: "#E8CFCC", // rosa pastel
        sand: "#EBDFBE", // amarelo pastel
        sky: "#D4E2E6", // azul pastel
        line: "#E5E0D3"
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"]
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "14px",
        lg: "22px",
        blob: "63% 37% 54% 46% / 43% 47% 53% 57%"
      },
      maxWidth: {
        prose: "68ch"
      },
      boxShadow: {
        card: "0 1px 2px rgba(38,36,31,0.06), 0 8px 24px -12px rgba(38,36,31,0.18)"
      }
    }
  },
  plugins: []
};

export default config;
