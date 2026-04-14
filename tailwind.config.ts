import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        mist: "#f7f5ef",
        coral: "#ee6c4d",
        sand: "#f1d8b3",
        pine: "#325449",
        ocean: "#005f73"
      },
      boxShadow: {
        panel: "0 20px 60px rgba(23, 23, 23, 0.12)"
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top left, rgba(238,108,77,0.25), transparent 30%), radial-gradient(circle at 80% 20%, rgba(0,95,115,0.22), transparent 28%), radial-gradient(circle at bottom right, rgba(241,216,179,0.35), transparent 30%)"
      }
    }
  },
  plugins: []
};

export default config;
