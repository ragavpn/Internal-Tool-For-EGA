import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Wrench, UserPlus, LogIn } from "lucide-react";

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    employeeId: "",
  });

  const { login, register, isLoggingIn, isRegistering: isRegisteringUser, loginError, registerError } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isRegistering) {
        register(formData);
      } else {
        login({ email: formData.email, password: formData.password });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: isRegistering ? "Registration failed" : "Login failed",
        variant: "destructive",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setFormData({ email: "", password: "", name: "", employeeId: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isRegistering ? "Create Account" : "Device Manager"}
          </CardTitle>
          <p className="text-gray-600">
            {isRegistering 
              ? "Register your employee account" 
              : "Sign in to manage industrial devices"
            }
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    name="employeeId"
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="EMP001"
                    data-testid="input-employee-id"
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@company.com"
                data-testid="input-email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                data-testid="input-password"
              />
            </div>

            {(loginError || registerError) && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
                {loginError?.message || registerError?.message}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoggingIn || isRegisteringUser}
              data-testid={isRegistering ? "button-register" : "button-login"}
            >
              {(isLoggingIn || isRegisteringUser) ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isRegistering ? "Creating Account..." : "Signing In..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isRegistering ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  {isRegistering ? "Create Account" : "Sign In"}
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              data-testid="button-toggle-mode"
            >
              {isRegistering
                ? "Already have an account? Sign in"
                : "Need an account? Register here"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}