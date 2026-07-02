"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { LangProvider } from "@/lib/i18n";
import { SessionProvider } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <LangProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </LangProvider>
    </SessionProvider>
  );
}
