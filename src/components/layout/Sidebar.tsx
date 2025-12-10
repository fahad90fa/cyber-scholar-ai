import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Search,
  Bug,
  Package,
  Code,
  Terminal,
  Shield,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Skull,
  Upload,
  Settings,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const modules = [
  {
    id: "chat",
    name: "AI Chat",
    icon: MessageSquare,
    path: "/",
    description: "Chat with CyberAI",
  },
  {
    id: "recon",
    name: "Reconnaissance",
    icon: Search,
    path: "/module/recon",
    description: "Information gathering",
  },
  {
    id: "exploitation",
    name: "Exploitation",
    icon: Bug,
    path: "/module/exploitation",
    description: "Vulnerability exploitation",
  },
  {
    id: "payloads",
    name: "Payloads",
    icon: Package,
    path: "/module/payloads",
    description: "Payload creation",
  },
  {
    id: "python",
    name: "Python Security",
    icon: Code,
    path: "/module/python",
    description: "Security scripting",
  },
  {
    id: "kali",
    name: "Kali Tools",
    icon: Terminal,
    path: "/module/kali",
    description: "Kali Linux toolkit",
  },
  {
    id: "defense",
    name: "Defense",
    icon: Shield,
    path: "/module/defense",
    description: "Defensive strategies",
  },
  {
    id: "training-chat",
    name: "Training Chat",
    icon: BookOpen,
    path: "/training-chat",
    description: "Chat with your documents",
  },
];

const bottomItems = [
  {
    id: "training",
    name: "Training Data",
    icon: Upload,
    path: "/training",
    description: "Upload documents",
  },
  {
    id: "settings",
    name: "Settings",
    icon: Settings,
    path: "/settings",
    description: "Configuration",
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 relative",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Skull className="w-6 h-6 text-primary" />
            <span className="font-mono font-bold text-primary text-glow">
              CyberAI
            </span>
          </div>
        )}
        {collapsed && <Skull className="w-6 h-6 text-primary mx-auto" />}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("h-8 w-8", collapsed && "mx-auto mt-2")}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {!collapsed && (
          <span className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Modules
          </span>
        )}
        {modules.map((module) => {
          const isActive = location.pathname === module.path;
          return (
            <NavLink
              key={module.id}
              to={module.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/30 shadow-[0_0_10px_hsl(var(--primary)/0.2)]"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                collapsed && "justify-center px-2"
              )}
            >
              <module.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  isActive && "text-glow"
                )}
              />
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{module.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {module.description}
                  </span>
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{item.name}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Version */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground font-mono">
            v1.0.0 • <span className="text-primary">Educational Use Only</span>
          </p>
        </div>
      )}
    </aside>
  );
}
