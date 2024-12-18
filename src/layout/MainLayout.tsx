import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="w-72 h-full border-r" />
      <main className="bg-background-primary flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
