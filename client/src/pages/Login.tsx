import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { validatePasswordStrength, validateEmail, areRequiredFieldsFilled, type PasswordStrength } from "@/lib/validation";
import { Wrench, UserPlus, LogIn, Check, X, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    employeeId: "",
  });
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const [emailValidation, setEmailValidation] = useState<{ isValid: boolean; error?: string }>({ isValid: true });

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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Real-time password validation
    if (name === "password") {
      setPasswordStrength(validatePasswordStrength(value));
    }

    // Real-time email validation
    if (name === "email") {
      setEmailValidation(validateEmail(value));
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setFormData({ email: "", password: "", name: "", employeeId: "" });
    setPasswordStrength(null);
    setEmailValidation({ isValid: true });
  };

  // Check if form is valid for submission
  const requiredFields = isRegistering ? ["name", "employeeId", "email", "password"] : ["email", "password"];
  const validationResults = {
    email: emailValidation,
    password: { isValid: !isRegistering || (passwordStrength?.score || 0) >= 2 } // Only check strength for registration
  };
  
  const isFormValid = areRequiredFieldsFilled(formData, requiredFields, validationResults) && 
    (isRegistering ? (passwordStrength?.score || 0) >= 2 : true);

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
                className={!emailValidation.isValid && formData.email ? "border-red-500" : ""}
              />
              {!emailValidation.isValid && formData.email && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <X className="w-4 h-4" />
                  <span>{emailValidation.error}</span>
                </div>
              )}
              {emailValidation.isValid && formData.email && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <Check className="w-4 h-4" />
                  <span>Valid email address</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  data-testid="input-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password strength indicator (only for registration) */}
              {isRegistering && passwordStrength && formData.password && (
                <div className="space-y-3">
                  {/* Strength bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Password strength:</span>
                      <span className={`font-medium text-${passwordStrength.color}-600`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-${passwordStrength.color}-500 transition-all duration-300`}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Requirements checklist */}
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-gray-700 mb-2">Password requirements:</p>
                    <div className="space-y-1 text-sm">
                      {[
                        { key: 'minLength', label: 'At least 8 characters' },
                        { key: 'hasUppercase', label: 'One uppercase letter' },
                        { key: 'hasLowercase', label: 'One lowercase letter' },
                        { key: 'hasNumber', label: 'One number' },
                        { key: 'hasSpecialChar', label: 'One special character' }
                      ].map((req) => (
                        <div key={req.key} className="flex items-center gap-2">
                          {passwordStrength.checks[req.key as keyof typeof passwordStrength.checks] ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-red-500" />
                          )}
                          <span className={passwordStrength.checks[req.key as keyof typeof passwordStrength.checks] ? "text-green-700" : "text-gray-600"}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {(loginError || registerError) && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
                {loginError?.message || registerError?.message}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoggingIn || isRegisteringUser || !isFormValid}
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