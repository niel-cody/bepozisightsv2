import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function AuthWrapper() {
  const { user, isAuthenticated, login } = useAuth();
  
  // Check if user is already authenticated
  const { data: authData, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: !isAuthenticated,
    retry: false
  });

  useEffect(() => {
    console.log("Auth check result:", authData);
    if (authData && typeof authData === 'object' && 'user' in authData && authData.user && !isAuthenticated) {
      console.log("Auto-logging in user:", authData.user);
      login(authData.user as any);
    }
  }, [authData, isAuthenticated, login]);

  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={login} />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthWrapper />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
