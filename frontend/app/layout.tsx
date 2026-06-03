import "./globals.css";
import { ToastProvider } from "../components/toast-provider";

export const metadata = {
  title: "SocialOps Studio",
  description: "Persian-first multi-channel social operations workspace"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body><ToastProvider>{children}</ToastProvider></body>
    </html>
  );
}
