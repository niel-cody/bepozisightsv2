import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ChatInterface from "@/components/chat/chat-interface";
import CSVUpload from "@/components/import/csv-upload";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Dashboard() {
  const [currentView, setCurrentView] = useState("chat");

  const { data: todaySummary } = useQuery({
    queryKey: ["/api/summary"],
  });

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar currentView={currentView} onViewChange={setCurrentView} />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">
                {currentView === "chat" && "AI Assistant"}
                {currentView === "import" && "Import Data"}
                {currentView === "analytics" && "Analytics"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground">SM</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {currentView === "chat" && (
            <div className="flex-1">
              <ChatInterface />
            </div>
          )}
          
          {currentView === "import" && (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-light text-foreground mb-4 tracking-tight">Import CSV Data</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">Upload your CSV files to enhance analysis capabilities</p>
                </div>
                <CSVUpload />
              </div>
            </div>
          )}
          
          {currentView === "analytics" && (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto p-8">
                <div className="text-center py-16">
                  <svg className="mx-auto h-12 w-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <h3 className="text-lg font-medium text-foreground mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground">Use the AI Assistant to explore your data and generate insights.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
