import "./globals.css";
import type { Metadata } from "next";
import LoaderWrapper from "@/components/Loader";

export const metadata: Metadata = {
  title: "Vaquero Market",
  description: "A community-powered marketplace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <LoaderWrapper>{children}</LoaderWrapper>
      </body>
    </html>
  );
}
