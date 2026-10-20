import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import "./functional.css";
import { WasteLoopProvider } from "../context/WasteLoopContext";

export const metadata: Metadata = {
  title: "WasteLoop CG — Environmental Operations & Citizen Waste Management",
  description: "Cleaner Communities for a Better Chhattisgarh. Full-stack civic complaint resolution and field management system.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased text-[#1c241c] bg-[#f2f6f0]">
        <ClerkProvider dynamic>
          <WasteLoopProvider>
            <Show when="signed-in">
              <div className="global-auth-control">
                <UserButton />
              </div>
            </Show>
            {children}
          </WasteLoopProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
