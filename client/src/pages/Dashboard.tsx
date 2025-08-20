import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Settings,
  LogOut
} from "lucide-react";

interface DashboardStats {
  totalDevices: number;
  activeDevices: number;
  overdueChecks: number;
  completedThisWeek: number;
  devicesByLocation: Record<string, number>;
  recentChecks: Array<{
    id: string;
    device: { name: string; location: string };
    checkedBy: { name: string };
    completedDate: string;
    status: string;
  }>;
}

export default function Dashboard() {
  const { employee, logout } = useAuth();
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: overdueDevices = [] } = useQuery({
    queryKey: ["/api/devices/overdue"],
  });

  const { data: upcomingChecks = [] } = useQuery({
    queryKey: ["/api/devices/upcoming"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Device Manager</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {employee?.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Devices</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalDevices || 0}</p>
                </div>
                <Wrench className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Devices</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.activeDevices || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue Checks</p>
                  <p className="text-2xl font-bold text-red-600">{stats?.overdueChecks || 0}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed This Week</p>
                  <p className="text-2xl font-bold text-blue-600">{stats?.completedThisWeek || 0}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/devices/new">
                <Button className="w-full justify-start" data-testid="button-add-device">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Device
                </Button>
              </Link>
              
              <Link href="/devices">
                <Button variant="outline" className="w-full justify-start" data-testid="button-view-devices">
                  <Wrench className="w-4 h-4 mr-2" />
                  View All Devices
                </Button>
              </Link>
              
              <Link href="/planner">
                <Button variant="outline" className="w-full justify-start" data-testid="button-maintenance-planner">
                  <Calendar className="w-4 h-4 mr-2" />
                  Maintenance Planner
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Devices by Location */}
          <Card>
            <CardHeader>
              <CardTitle>Devices by Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.devicesByLocation && Object.entries(stats.devicesByLocation).map(([location, count]) => (
                  <div key={location} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">{location}</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
                
                {(!stats?.devicesByLocation || Object.keys(stats.devicesByLocation).length === 0) && (
                  <p className="text-gray-500 text-sm text-center py-4">No devices registered yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {stats?.recentChecks && stats.recentChecks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Device Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentChecks.map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">{check.device.name}</p>
                        <p className="text-sm text-gray-600">
                          {check.device.location} • Checked by {check.checkedBy.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={check.status === 'completed' ? 'default' : 'secondary'}
                      >
                        {check.status}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(check.completedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bottom Navigation for Mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
          <div className="flex justify-around py-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex flex-col gap-1 h-auto py-2">
                <Wrench className="w-5 h-5" />
                <span className="text-xs">Dashboard</span>
              </Button>
            </Link>
            <Link href="/devices">
              <Button variant="ghost" size="sm" className="flex flex-col gap-1 h-auto py-2">
                <Settings className="w-5 h-5" />
                <span className="text-xs">Devices</span>
              </Button>
            </Link>
            <Link href="/planner">
              <Button variant="ghost" size="sm" className="flex flex-col gap-1 h-auto py-2">
                <Calendar className="w-5 h-5" />
                <span className="text-xs">Planner</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}