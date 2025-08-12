import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  MessageCircle, 
  Building2, 
  Users, 
  Package, 
  Calculator,
  Upload
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ open, onClose, currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: "chat", label: "AI Assistant", icon: MessageCircle },
    { id: "import", label: "Import Data", icon: Upload },
    { id: "tills", label: "Till Summaries", icon: Building2 },
    { id: "operators", label: "Operator Performance", icon: Users },
    { id: "products", label: "Product Analysis", icon: Package },
    { id: "accounts", label: "Account Summaries", icon: Calculator },
  ];

  const quickQueries = [
    { label: "Yesterday's Summary", query: "What happened yesterday?" },
    { label: "Top Products This Week", query: "Show me top performing products this week" },
    { label: "Operator Alerts", query: "Which operators need attention?" },
  ];

  const handleQuickQuery = (query: string) => {
    // This will be handled by the chat interface
    onViewChange("chat");
    // TODO: Trigger query in chat interface
  };

  return (
    <aside 
      className={cn(
        "bg-card text-card-foreground shadow-sm w-64 border-r h-full fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-30",
        open ? "translate-x-0" : "-translate-x-full"
      )}
      data-testid="sidebar"
    >
      <nav className="p-4 space-y-2">
        <div className="pb-4 border-b">
          <h2 className="text-sm font-semibold uppercase tracking-wider">Data Views</h2>
        </div>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start space-x-3 h-auto py-2",
                isActive 
                  ? "bg-accent text-accent-foreground font-medium" 
                  : ""
              )}
              onClick={() => onViewChange(item.id)}
              data-testid={`button-nav-${item.id}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Button>
          );
        })}
        
        <div className="pt-4 border-t">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">Quick Queries</h3>
          {quickQueries.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-sm h-auto py-2"
              onClick={() => handleQuickQuery(item.query)}
              data-testid={`button-quick-query-${index}`}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </nav>
    </aside>
  );
}
