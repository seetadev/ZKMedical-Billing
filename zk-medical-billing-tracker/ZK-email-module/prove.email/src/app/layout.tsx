import "./globals.css";
import Headers from "@/components/Headers";
import { ThemeProvider } from "@/components/ThemeProviders";
import SearchModalProvider from "@/components/providers/SearchModalProvider";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";

export const metadata = {
  title: "ZK Email",
  description: "Proof of Email allows for trust-minimized identity proofs, on/off-ramp flows, and unique email-based on-chain interactions",
};

const font = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("overflow-x-clip", font.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Headers />
          <SearchModalProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
