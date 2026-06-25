import "./globals.css";
import { ToastProvider } from "../components/toast-provider";
import { productName, productTagline } from "../lib/product";

export const metadata = {
  title: productName,
  description: productTagline
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem("theme");
                  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                  const theme = savedTheme || systemTheme || "light";
                  document.documentElement.setAttribute("data-theme", theme);
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body><ToastProvider>{children}</ToastProvider></body>
    </html>
  );
}
