import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
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
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-6 bg-background/80 backdrop-blur-sm">
          <SidebarTrigger className="-ml-1 hover:bg-accent hover:text-accent-foreground transition-colors" />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground tracking-tight">
                {currentView === "chat" && "AI Assistant"}
                {currentView === "import" && "Import Data"} 
                {currentView === "analytics" && "Analytics"}
              </h1>
              <div className="h-4 w-px bg-border" />
              <span className="text-sm text-muted-foreground">
                {currentView === "chat" && "Chat with Alex for business insights"}
                {currentView === "import" && "Upload your CSV data files"}
                {currentView === "analytics" && "Explore your business data"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/50 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-accent-foreground">Online</span>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md">
                <span className="text-sm font-semibold text-primary-foreground">SM</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {currentView === "chat" && (
            <div className="flex-1 flex flex-col">
              <ChatInterface />
            </div>
          )}
          
          {currentView === "import" && (
            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-background to-accent/5">
              <div className="max-w-3xl mx-auto p-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-semibold text-foreground mb-4 tracking-tight">Import Your Data</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">Upload CSV files to unlock powerful AI-driven business insights and analytics.</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                  <CSVUpload />
                </div>
              </div>
            </div>
          )}
          
          {currentView === "analytics" && (
            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-background to-accent/5">
              <div className="max-w-4xl mx-auto p-8">
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">Analytics Dashboard</h3>
                  <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">Use the AI Assistant to explore your data and generate comprehensive business insights.</p>
                  <button 
                    onClick={() => setCurrentView("chat")}
                    className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Start AI Analysis
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
