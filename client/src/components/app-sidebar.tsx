import { MessageSquare, LineChart, Package, Users, Calculator, Settings, ChevronDown } from "lucide-react"
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import * as React from "react"

export interface AppSidebarProps {
  currentView: string
  setCurrentView: (view: string) => void
}

export function AppSidebar({ currentView, setCurrentView }: AppSidebarProps) {
  const [orgs] = React.useState<Array<{ id: string; name: string }>>([
    { id: "org_1", name: "Primary Store" },
  ])
  const [selectedOrg, setSelectedOrg] = React.useState(orgs[0])

  const isActive = (view: string) => currentView === view

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" })
      window.location.reload()
    } catch {
      window.location.href = "/"
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="px-3 py-3">
          {orgs.length <= 1 ? (
            <Button
              variant="outline"
              className={cn(
                "w-full justify-between truncate",
                "group-data-[collapsible=icon]:hidden"
              )}
              disabled
            >
              <span className="truncate">{selectedOrg.name}</span>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between",
                    "group-data-[collapsible=icon]:hidden"
                  )}
                >
                  <span className="truncate">{selectedOrg.name}</span>
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {orgs.map((org) => (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => setSelectedOrg(org)}
                  >
                    {org.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Section 1: Main */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("chat")}
                  onClick={() => setCurrentView("chat")}
                  tooltip="AI Chat"
                >
                  <MessageSquare />
                  <span>AI Chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarGroupLabel className="mt-2">Insights</SidebarGroupLabel>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isActive("sales")}
                  >
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView("sales") }}>
                      <LineChart />
                      <span>Sales</span>
                    </a>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isActive("products")}
                  >
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView("products") }}>
                      <Package />
                      <span>Products</span>
                    </a>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isActive("operators")}
                  >
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView("operators") }}>
                      <Users />
                      <span>Operators</span>
                    </a>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isActive("accounts")}
                  >
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView("accounts") }}>
                      <Calculator />
                      <span>Accounts</span>
                    </a>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Section 2: Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("settings")}
                  onClick={() => setCurrentView("settings")}
                  tooltip="Settings"
                >
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer: User */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip="Account">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary-foreground">SM</span>
                    </div>
                    <div className="group-data-[collapsible=icon]:hidden">
                      <span className="text-sm font-medium text-sidebar-foreground">Store Manager</span>
                      <p className="text-xs text-sidebar-foreground/70">admin@store.com</p>
                    </div>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}