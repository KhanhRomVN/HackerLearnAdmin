import React from "react";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose }) => {
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      direction="right"
      size={350}
      className="bg-background"
    >
      {/* History Header */}
      <div className="h-24 border-b flex items-center justify-between px-6">
        <h2 className="text-xl font-semibold">Chat History</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* History List */}
      <div className="p-4">
        {/* Example history items */}
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="p-4 border rounded-lg mb-3 hover:bg-accent cursor-pointer"
          >
            <div className="font-medium mb-1">Conversation {item}</div>
            <div className="text-sm text-muted-foreground">
              Last message from this conversation...
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
};