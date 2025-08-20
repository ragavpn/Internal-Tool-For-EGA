import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Badge, 
  LogOut, 
  Moon, 
  Sun,
  Shield
} from "lucide-react";

export default function Profile() {
  const { employee, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">My Profile</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Personal Information */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="dark:text-gray-200">Full Name</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white" data-testid="text-employee-name">
                      {employee.name}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="dark:text-gray-200">Employee ID</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <Badge className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-mono" data-testid="text-employee-id">
                      {employee.employeeId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="dark:text-gray-200">Email Address</Label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white" data-testid="text-employee-email">
                    {employee.email}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="dark:text-gray-200">Account Status</Label>
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300 font-medium">
                    Active Employee
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                {theme === "light" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="dark:text-gray-200">Theme</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose between light and dark mode
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                    data-testid="switch-theme"
                  />
                  <Moon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full sm:w-auto"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                You will be signed out of your account and redirected to the login page.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}