// src/components/Navbar.tsx
import React from "react";
import { 
  Bell, 
  Folder, 
  Search, 
  Settings, 
  HelpCircle, 
  Mail, 
  Calendar,
  MessageSquare,
  Globe,
  Sun,
  Moon,
  Menu,
  User,
  CreditCard,
  Users,
  Activity,
  LogOut
} from "lucide-react";
import { Input } from "@/components/ui/input";  // Import từ shadcn/ui
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";  // Import từ shadcn/ui
import { useTheme } from "@/components/theme-provider";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden mr-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="flex items-center w-96">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search anything..."
              className="pl-8 w-full bg-muted"
            />
          </div>
        </div>

        {/* Center Navigation Items */}
        <div className="mx-6 hidden md:flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Calendar</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Messages</span>
            <Badge>New</Badge>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Browse</span>
          </Button>
        </div>

        {/* Right side icons and profile */}
        <div className="ml-auto flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative group"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 transition-all" />
            ) : (
              <Moon className="h-5 w-5 transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
            <div className="absolute hidden group-hover:block right-0 top-full mt-2 bg-popover rounded-md shadow-md p-2 text-sm">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </div>
          </Button>

          {/* Folder */}
          <Button variant="ghost" size="icon" className="relative group">
            <Folder className="h-5 w-5" />
            <div className="absolute hidden group-hover:block right-0 top-full mt-2 bg-popover rounded-md shadow-md p-2 text-sm">
              Files
            </div>
          </Button>
          
          {/* Mail with Badge */}
          <Button variant="ghost" size="icon" className="relative group">
            <Mail className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
              3
            </Badge>
            <div className="absolute hidden group-hover:block right-0 top-full mt-2 bg-popover rounded-md shadow-md p-2 text-sm">
              Unread messages
            </div>
          </Button>

          {/* Notifications with Badge */}
          <Button variant="ghost" size="icon" className="relative group">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
              5
            </Badge>
            <div className="absolute hidden group-hover:block right-0 top-full mt-2 bg-popover rounded-md shadow-md p-2 text-sm">
              Notifications
            </div>
          </Button>

          {/* Help */}
          <Button variant="ghost" size="icon" className="relative group">
            <HelpCircle className="h-5 w-5" />
            <div className="absolute hidden group-hover:block right-0 top-full mt-2 bg-popover rounded-md shadow-md p-2 text-sm">
              Help Center
            </div>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon" className="relative group">
            <Settings className="h-5 w-5" />
            <div className="absolute hidden group-hover:block right-0 top-full mt-2 bg-popover rounded-md shadow-md p-2 text-sm">
              Settings
            </div>
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-fit space-x-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex flex-col items-start hidden lg:block">
                    <span className="font-medium">John Doe</span>
                    <span className="text-xs text-muted-foreground">Administrator</span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    john@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="mr-2 h-4 w-4" />
                Team Management
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Activity className="mr-2 h-4 w-4" />
                Activity Log
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t p-4">
          <div className="flex flex-col space-y-4">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 justify-start">
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 justify-start">
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
              <Badge>New</Badge>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 justify-start">
              <Globe className="h-4 w-4" />
              <span>Browse</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}