import { MessageSquare, Upload, BarChart3 } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "AI Assistant",
    url: "#",
    icon: MessageSquare,
    view: "chat",
  },
  {
    title: "Import Data",
    url: "#",
    icon: Upload,
    view: "import",
  },
  {
    title: "Analytics",
    url: "#",
    icon: BarChart3,
    view: "analytics",
  },
]

interface AppSidebarProps {
  currentView: string
  onViewChange: (view: string) => void
}

export function AppSidebar({ currentView, onViewChange }: AppSidebarProps) {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md">
            <MessageSquare className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Alex
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={currentView === item.view}
                    onClick={() => onViewChange(item.view)}
                    tooltip={item.title}
                  >
                    <button>
                      <item.icon />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">SM</span>
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium text-sidebar-foreground">Store Manager</p>
              <p className="text-xs text-sidebar-foreground/70">admin@store.com</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}