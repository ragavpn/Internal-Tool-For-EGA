import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Wrench, 
  MapPin, 
  Clock, 
  Plus, 
  ArrowLeft,
  Search,
  Filter
} from "lucide-react";
import type { DeviceWithChecks } from "@shared/schema";

export default function Devices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  const { data: devices = [], isLoading } = useQuery<DeviceWithChecks[]>({
    queryKey: ["/api/devices", selectedLocation],
  });

  const { data: locations = [] } = useQuery<string[]>({
    queryKey: ["/api/locations"],
  });

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.identificationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === "all" || !selectedLocation || device.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading devices...</p>
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
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Devices</h1>
            </div>
            
            <Link href="/devices/new">
              <Button data-testid="button-add-device">
                <Plus className="w-4 h-4 mr-2" />
                Add Device
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search devices by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger data-testid="select-location">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Device Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            <Card key={device.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{device.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      ID: {device.identificationNumber}
                    </p>
                  </div>
                  <Badge 
                    variant={device.status === 'active' ? 'default' : 'secondary'}
                    data-testid={`status-${device.id}`}
                  >
                    {device.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{device.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Check every {device.plannedFrequencyWeeks} week(s)</span>
                  </div>

                  {device.planComment && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <p className="font-medium">Plan Notes:</p>
                      <p>{device.planComment}</p>
                    </div>
                  )}

                  {device.isOverdue && (
                    <Badge variant="destructive" className="w-full justify-center">
                      Overdue for Check
                    </Badge>
                  )}

                  {device.lastCheck && (
                    <div className="text-sm text-gray-500">
                      Last checked: {new Date(device.lastCheck.completedDate).toLocaleDateString()}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Link href={`/devices/${device.id}/checks`}>
                      <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-checks-${device.id}`}>
                        View Checks
                      </Button>
                    </Link>
                    <Link href={`/devices/edit/${device.id}`}>
                      <Button variant="outline" size="sm" data-testid={`button-edit-${device.id}`}>
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDevices.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No devices found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedLocation 
                ? "Try adjusting your filters or search terms" 
                : "Get started by adding your first device"
              }
            </p>
            {!searchTerm && !selectedLocation && (
              <Link href="/devices/new">
                <Button data-testid="button-add-first-device">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Device
                </Button>
              </Link>
            )}
          </div>
        )}
      </main>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
        <div className="flex justify-around py-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex flex-col gap-1 h-auto py-2">
              <Wrench className="w-5 h-5" />
              <span className="text-xs">Dashboard</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="flex flex-col gap-1 h-auto py-2 text-blue-600">
            <Wrench className="w-5 h-5" />
            <span className="text-xs">Devices</span>
          </Button>
          <Link href="/planner">
            <Button variant="ghost" size="sm" className="flex flex-col gap-1 h-auto py-2">
              <Clock className="w-5 h-5" />
              <span className="text-xs">Planner</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}