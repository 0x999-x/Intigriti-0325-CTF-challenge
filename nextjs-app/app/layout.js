import { Sniglet } from "next/font/google";
import "./globals.css";
import ClientLayout from "./client-layout";

const SnigletFont = Sniglet({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Leaky Flagment",
  description: "Can you steal my flag?",
  image: "/favicon.ico",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${SnigletFont.className} flex flex-col min-h-screen bg-gradient-to-r from-[#ee9ca7] to-[#ffdde1]`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
