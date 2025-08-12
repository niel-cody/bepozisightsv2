import { MessageSquare, BarChart3, Settings } from "lucide-react"

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
  useSidebar,
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
    title: "Analytics",
    url: "#",
    icon: BarChart3,
    view: "analytics",
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    view: "import",
  },
]

interface AppSidebarProps {
  currentView: string
  onViewChange: (view: string) => void
}

export function AppSidebar({ currentView, onViewChange }: AppSidebarProps) {
  const { state } = useSidebar()
  const isCollapsed = state === "closed"
  
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-md">
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-sidebar-foreground text-lg tracking-tight">Alex</span>
            <p className="text-xs text-sidebar-foreground/70 font-medium">AI Assistant</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={currentView === item.view}
                    onClick={() => onViewChange(item.view)}
                    tooltip={item.title}
                    className="transition-colors group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent"
                  >
                    <item.icon className="h-4 w-4 text-sidebar-foreground" />
                    <span className="text-sm font-medium text-sidebar-foreground group-data-[collapsible=icon]:hidden">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md">
              <span className="text-sm font-semibold text-primary-foreground">SM</span>
            </div>
            <div className="group-data-[collapsible=icon]:hidden flex-1">
              <p className="text-sm font-semibold text-sidebar-foreground">Store Manager</p>
              <p className="text-xs text-sidebar-foreground/70">admin@store.com</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}