import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/dashboard/sidebar";

import ChatInterface from "@/components/chat/chat-interface";
import CSVUpload from "@/components/import/csv-upload";
import { Button } from "@/components/ui/button";
import { Menu, Package } from "lucide-react";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState("chat");

  const { data: todaySummary } = useQuery({
    queryKey: ["/api/summary"],
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2 hover:bg-gray-50"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                data-testid="button-sidebar-toggle"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </Button>
              <h1 className="text-2xl font-light text-gray-900 tracking-tight">Alex</h1>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">SM</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="flex h-screen">
        {/* Clean Navigation Sidebar */}
        <aside className={`w-64 bg-white border-r border-gray-100 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:relative z-30 h-full`}>
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Navigation</h2>
              <nav className="space-y-2">
                <Button
                  variant={currentView === "chat" ? "default" : "ghost"}
                  className="w-full justify-start font-normal h-11"
                  onClick={() => {
                    setCurrentView("chat");
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  data-testid="button-nav-chat"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                  AI Assistant
                </Button>
                <Button
                  variant={currentView === "import" ? "default" : "ghost"}
                  className="w-full justify-start font-normal h-11"
                  onClick={() => {
                    setCurrentView("import");
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  data-testid="button-nav-import"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  Import Data
                </Button>
                <Button
                  variant={currentView === "analytics" ? "default" : "ghost"}
                  className="w-full justify-start font-normal h-11"
                  onClick={() => {
                    setCurrentView("analytics");
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  data-testid="button-nav-analytics"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  Analytics
                </Button>
              </nav>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-hidden lg:ml-0">
          {currentView === "chat" && (
            <ChatInterface />
          )}
          
          {currentView === "import" && (
            <div className="h-full overflow-y-auto">
              <div className="max-w-2xl mx-auto p-12">
                <div className="mb-12">
                  <h1 className="text-3xl font-light text-gray-900 mb-4 tracking-tight">Import Data</h1>
                  <p className="text-gray-600 text-lg leading-relaxed">Upload your CSV files to enhance analysis capabilities</p>
                </div>
                <CSVUpload />
              </div>
            </div>
          )}
          
          {currentView === "analytics" && (
            <div className="h-full overflow-y-auto">
              <div className="max-w-4xl mx-auto p-12">
                <div className="text-center py-16">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-500">Use the AI Assistant to explore your data and generate insights.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            data-testid="overlay-sidebar"
          />
        )}
    </div>
  );
}
