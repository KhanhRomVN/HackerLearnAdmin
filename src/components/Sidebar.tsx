import { useState } from 'react';
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { motion, AnimatePresence } from "framer-motion" // Thêm AnimatePresence
import {
  LayoutGrid,
  Settings,
  LogOut,
  Brain,
  Moon,
  Sun
} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom" // Thêm useLocation
import { useTheme } from "./theme-provider"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const menuItems = [
  {
    icon: Brain,
    label: "Dashboard",
    variant: "secondary" as const,
    iconClassName: "text-primary",
    href: "/",
  },
  {
    icon: LayoutGrid,
    label: "Courses",
    variant: "secondary" as const,
    iconClassName: "text-primary",
    href: "/courses",
  },
  {
    icon: Settings,
    label: "Settings",
    variant: "secondary" as const,
    iconClassName: "text-primary",
    href: "/settings",
  }
]

const sidebarVariants = {
  hidden: { x: -300, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      staggerChildren: 0.05, // Giảm thời gian stagger để animation mượt hơn
    },
  },
}

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
    }
  },
  hover: {
    scale: 1.02,
    x: 8,
    transition: {
      type: "spring",
      stiffness: 400,
    }
  }
}

export function Sidebar({ className }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [activeItem, setActiveItem] = useState<string>(location.pathname);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className={cn(
        "h-[calc(100vh-2rem)] bg-background-secondary border-r flex flex-col",
        "pr-6 pl-4 py-8", // Tăng padding
        "shadow-lg", // Tăng shadow
        className
      )}
    >
      {/* Logo Section */}
      <motion.div 
        className="mb-10" // Tăng margin bottom
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <div className="flex items-center gap-4 px-2">
          <Brain className="h-8 w-8 text-purple-600" /> {/* Tăng kích thước icon */}
          <span className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            HackerLearn
          </span>
        </div>
      </motion.div>

      {/* Menu Items Section */}
      <div className="flex-1 space-y-2"> {/* Tăng space between items */}
        <AnimatePresence>
          {menuItems.map((item) => (
            <motion.div
              key={item.label}
              variants={itemVariants}
              whileHover="hover"
            >
              <Button
                variant={item.variant}
                className={cn(
                  "w-full justify-start rounded-lg px-4 py-3", // Tăng padding
                  "text-primary hover:bg-sidebar-hover",
                  "flex items-center gap-4", // Tăng gap
                  activeItem === item.href && "bg-sidebar-select font-medium shadow-md",
                  "transition-all duration-300 ease-in-out"
                )}
                onClick={() => {
                  setActiveItem(item.href);
                  item.href && navigate(item.href);
                }}
              >
                <item.icon className={cn(
                  "h-5 w-5", // Tăng kích thước icon
                  item.iconClassName,
                  activeItem === item.href && "animate-pulse"
                )} />
                <span className="text-base">{item.label}</span> {/* Tăng font size */}
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom Section */}
      <div className="space-y-3 pt-5 border-t border-gray-200 dark:border-gray-700">
        <motion.div
          variants={itemVariants}
          whileHover="hover"
        >
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start rounded-lg px-4 py-3",
              "text-primary hover:bg-sidebar-hover",
              "flex items-center gap-4"
            )}
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-5 w-5 text-yellow-500" />
                <span className="text-base">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-5 w-5 text-blue-500" />
                <span className="text-base">Dark Mode</span>
              </>
            )}
          </Button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover="hover"
        >
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start rounded-lg px-4 py-3",
              "text-red-500 hover:text-red-600",
              "hover:bg-red-50 dark:hover:bg-red-950/30",
              "flex items-center gap-4",
              "transition-all duration-300 ease-in-out"
            )}
          >
            <LogOut className="h-5 w-5" />
            <span className="text-base">Log out</span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}