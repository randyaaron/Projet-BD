import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./app/App.tsx";
import { SettingsProvider } from "./app/contexts/SettingsContext";
import "./styles/index.css";
import "./i18n/i18n";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </ThemeProvider>
);