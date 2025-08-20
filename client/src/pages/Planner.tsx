import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Wrench,
  ArrowLeft,
  CheckCircle,
  Filter
} from "lucide-react";
import type { DeviceWithChecks } from "@shared/schema";

export default function Planner() {
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [daysAhead, setDaysAhead] = useState("7");

  const { data: overdueDevices = [], isLoading: overdueLoading } = useQuery<DeviceWithChecks[]>({
    queryKey: ["/api/devices/overdue"],
  });

  const { data: upcomingDevices = [], isLoading: upcomingLoading } = useQuery<DeviceWithChecks[]>({
    queryKey: ["/api/devices/upcoming", daysAhead],
  });

  const { data: locations = [] } = useQuery<string[]>({
    queryKey: ["/api/locations"],
  });

  const { data: allDevices = [] } = useQuery<DeviceWithChecks[]>({
    queryKey: ["/api/devices"],
  });

  const filteredOverdueDevices = selectedLocation 
    ? overdueDevices.filter(device => device.location === selectedLocation)
    : overdueDevices;

  const filteredUpcomingDevices = selectedLocation 
    ? upcomingDevices.filter(device => device.location === selectedLocation)
    : upcomingDevices;

  const recentlyCompletedDevices = allDevices
    .filter(device => device.lastCheck)
    .filter(device => {
      if (!device.lastCheck) return false;
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(device.lastCheck.completedDate) > oneWeekAgo;
    })
    .filter(device => !selectedLocation || device.location === selectedLocation)
    .sort((a, b) => {
      if (!a.lastCheck || !b.lastCheck) return 0;
      return new Date(b.lastCheck.completedDate).getTime() - new Date(a.lastCheck.completedDate).getTime();
    });

  const isLoading = overdueLoading || upcomingLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading maintenance planner...</p>
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
              <h1 className="text-xl font-semibold text-gray-900">Maintenance Planner</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger data-testid="select-location-filter">
                    <SelectValue placeholder="Filter by location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Select value={daysAhead} onValueChange={setDaysAhead}>
                  <SelectTrigger data-testid="select-days-ahead">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Next 7 days</SelectItem>
                    <SelectItem value="14">Next 14 days</SelectItem>
                    <SelectItem value="30">Next 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue Checks</p>
                  <p className="text-2xl font-bold text-red-600">{filteredOverdueDevices.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Checks</p>
                  <p className="text-2xl font-bold text-orange-600">{filteredUpcomingDevices.length}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recently Completed</p>
                  <p className="text-2xl font-bold text-green-600">{recentlyCompletedDevices.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="overdue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overdue" data-testid="tab-overdue">
              Overdue ({filteredOverdueDevices.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">
              Upcoming ({filteredUpcomingDevices.length})
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">
              Recently Completed ({recentlyCompletedDevices.length})
            </TabsTrigger>
          </TabsList>

          {/* Overdue Devices */}
          <TabsContent value="overdue">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Overdue Maintenance Checks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredOverdueDevices.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-600">No devices are overdue for maintenance checks.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOverdueDevices.map(device => (
                      <div key={device.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{device.name}</h3>
                              <Badge variant="destructive">Overdue</Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-2">
                                <Wrench className="w-4 h-4" />
                                <span>ID: {device.identificationNumber}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{device.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Every {device.plannedFrequencyWeeks} week(s)</span>
                              </div>
                              {device.lastCheck && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>Last: {new Date(device.lastCheck.completedDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>

                            {device.planComment && (
                              <div className="bg-white p-2 rounded text-sm mb-3">
                                <p className="font-medium text-gray-600">Notes:</p>
                                <p>{device.planComment}</p>
                              </div>
                            )}
                          </div>
                          
                          <Link href={`/devices/${device.id}/checks`}>
                            <Button size="sm" data-testid={`button-check-${device.id}`}>
                              Record Check
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upcoming Devices */}
          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Clock className="w-5 h-5" />
                  Upcoming Maintenance Checks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredUpcomingDevices.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming checks</h3>
                    <p className="text-gray-600">
                      No devices need maintenance in the next {daysAhead} days.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUpcomingDevices.map(device => (
                      <div key={device.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{device.name}</h3>
                              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                Due {device.nextScheduledCheck ? new Date(device.nextScheduledCheck).toLocaleDateString() : 'Soon'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-2">
                                <Wrench className="w-4 h-4" />
                                <span>ID: {device.identificationNumber}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{device.location}</span>
                              </div>
                            </div>
                          </div>
                          
                          <Link href={`/devices/${device.id}/checks`}>
                            <Button variant="outline" size="sm" data-testid={`button-schedule-${device.id}`}>
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recently Completed */}
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  Recently Completed Checks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentlyCompletedDevices.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recent checks</h3>
                    <p className="text-gray-600">No devices have been checked in the past week.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentlyCompletedDevices.map(device => (
                      <div key={device.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{device.name}</h3>
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                Completed
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-2">
                              <p>Checked on {device.lastCheck ? new Date(device.lastCheck.completedDate).toLocaleDateString() : 'Unknown'}</p>
                              <p>Next check due: {device.nextScheduledCheck ? new Date(device.nextScheduledCheck).toLocaleDateString() : 'To be scheduled'}</p>
                            </div>
                          </div>
                          
                          <Link href={`/devices/${device.id}/checks`}>
                            <Button variant="outline" size="sm" data-testid={`button-history-${device.id}`}>
                              View History
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
          <Link href="/devices">
            <Button variant="ghost" size="sm" className="flex flex-col gap-1 h-auto py-2">
              <Wrench className="w-5 h-5" />
              <span className="text-xs">Devices</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="flex flex-col gap-1 h-auto py-2 text-blue-600">
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Planner</span>
          </Button>
        </div>
      </div>
    </div>
  );
}