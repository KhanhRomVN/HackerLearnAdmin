import React from "react";
import { Sidebar } from "@/components/Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen p-4 overflow-hidden">
      <Sidebar className="w-60 border-r" />
      <main className="flex-1 bg-background-secondary rounded-2xl">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
