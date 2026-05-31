import "./globals.css";
import { ToastProvider } from "../components/toast-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body><ToastProvider>{children}</ToastProvider></body>
    </html>
  );
}
