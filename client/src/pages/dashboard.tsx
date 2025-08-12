import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/dashboard/sidebar";

import ChatInterface from "@/components/chat/chat-interface";
import CSVUpload from "@/components/import/csv-upload";
import { Button } from "@/components/ui/button";
import { Menu, Package } from "lucide-react";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
        {/* Minimal Sidebar - only show when needed */}
        {sidebarOpen && (
          <aside className="w-64 bg-gray-50 border-r border-gray-100 lg:block hidden">
            <div className="p-6">
              <nav className="space-y-1">
                <Button
                  variant={currentView === "chat" ? "default" : "ghost"}
                  className="w-full justify-start font-normal"
                  onClick={() => setCurrentView("chat")}
                  data-testid="button-nav-chat"
                >
                  Chat
                </Button>
                <Button
                  variant={currentView === "import" ? "default" : "ghost"}
                  className="w-full justify-start font-normal"
                  onClick={() => setCurrentView("import")}
                  data-testid="button-nav-import"
                >
                  Import
                </Button>
              </nav>
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-hidden">
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
