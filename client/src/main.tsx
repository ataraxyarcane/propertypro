import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from './hooks/use-simple-auth';
import { ThemeProvider } from './components/theme-provider';

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light">
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
);
