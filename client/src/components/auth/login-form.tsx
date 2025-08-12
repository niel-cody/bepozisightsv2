import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import bepozLogo from "@assets/bepoz-positive_1754981127623.png";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LoginFormProps {
  onLoginSuccess: (user: { id: string; username: string }) => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Authentication failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      onLoginSuccess(data.user);
    },
    onError: (error: any) => {
      setError(error.message || "Authentication failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo/Brand Area */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <img 
              src={bepozLogo} 
              alt="Bepoz" 
              className="h-12 mx-auto"
            />
          </div>
        </div>

        {/* Login Card */}
        <Card className="border border-border/20 shadow-sm bg-card">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-medium">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials below
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1">
                <Label htmlFor="username" className="text-sm">
                  Email
                </Label>
                <Input
                  id="username"
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your email"
                  className="h-10"
                  data-testid="input-username"
                  autoComplete="username"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-10 pr-10"
                    data-testid="input-password"
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-10 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-md bg-destructive/10 p-3">
                  <div className="flex">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <div className="ml-3">
                      <div className="text-sm text-destructive">{error}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-[#002D6A] via-[#303F9F] to-[#002455] hover:from-[#003580] hover:via-[#3A4AB5] hover:to-[#002E66] text-white border-0 shadow-lg transition-all duration-200"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>


          </CardContent>
        </Card>


      </div>
    </div>
  );
}