import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Plus,
  Calendar
} from "lucide-react";
import type { DeviceWithChecks, DeviceCheckWithRelations } from "@shared/schema";

export default function DeviceChecks() {
  const [, params] = useRoute("/devices/:id/checks");
  const deviceId = params?.id;
  const { toast } = useToast();
  const [showCheckForm, setShowCheckForm] = useState(false);
  const [checkComment, setCheckComment] = useState("");

  const { data: device } = useQuery<DeviceWithChecks>({
    queryKey: ["/api/devices", deviceId],
    enabled: !!deviceId,
  });

  const { data: checks = [] } = useQuery<DeviceCheckWithRelations[]>({
    queryKey: ["/api/device-checks", deviceId],
    enabled: !!deviceId,
  });

  const createCheckMutation = useMutation({
    mutationFn: () => {
      const now = new Date();
      const scheduledDate = device?.nextScheduledCheck 
        ? new Date(device.nextScheduledCheck)
        : new Date(now.getTime() - (device?.plannedFrequencyWeeks || 1) * 7 * 24 * 60 * 60 * 1000);
      
      return apiRequest("POST", "/api/device-checks", {
        deviceId,
        scheduledDate: scheduledDate.toISOString(),
        status: now > scheduledDate ? "delayed" : "completed",
        checkComment: checkComment || null,
        isDelayed: now > scheduledDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/device-checks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Device check recorded successfully",
      });
      setShowCheckForm(false);
      setCheckComment("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record check",
        variant: "destructive",
      });
    },
  });

  const handleSubmitCheck = (e: React.FormEvent) => {
    e.preventDefault();
    createCheckMutation.mutate();
  };

  if (!device) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading device...</p>
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
              <Link href="/devices">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{device.name}</h1>
                <p className="text-sm text-gray-600">Maintenance Checks</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowCheckForm(true)}
              disabled={showCheckForm}
              data-testid="button-add-check"
            >
              <Plus className="w-4 h-4 mr-2" />
              Record Check
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Device Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Identification</p>
                <p className="text-lg">{device.identificationNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Location</p>
                <p className="text-lg">{device.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Check Frequency</p>
                <p className="text-lg">Every {device.plannedFrequencyWeeks} week(s)</p>
              </div>
            </div>
            
            {device.planComment && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-2">Plan Notes:</p>
                <p className="text-gray-800">{device.planComment}</p>
              </div>
            )}

            <div className="mt-4 flex items-center gap-4">
              <Badge variant={device.status === 'active' ? 'default' : 'secondary'}>
                {device.status}
              </Badge>
              {device.isOverdue && (
                <Badge variant="destructive">
                  Overdue for Check
                </Badge>
              )}
              {device.nextScheduledCheck && (
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Next check due: {new Date(device.nextScheduledCheck).toLocaleDateString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Check Form */}
        {showCheckForm && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Record New Check</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitCheck} className="space-y-4">
                <div>
                  <Label htmlFor="checkComment">Check Notes (Optional)</Label>
                  <Textarea
                    id="checkComment"
                    value={checkComment}
                    onChange={(e) => setCheckComment(e.target.value)}
                    placeholder="Record any observations, issues found, or maintenance performed..."
                    rows={3}
                    data-testid="textarea-check-comment"
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={createCheckMutation.isPending}
                    data-testid="button-submit-check"
                  >
                    {createCheckMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Recording...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Record Check
                      </div>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCheckForm(false)}
                    disabled={createCheckMutation.isPending}
                    data-testid="button-cancel-check"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Check History */}
        <Card>
          <CardHeader>
            <CardTitle>Check History</CardTitle>
          </CardHeader>
          <CardContent>
            {checks.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No checks recorded</h3>
                <p className="text-gray-600 mb-6">
                  Start by recording the first maintenance check for this device.
                </p>
                <Button 
                  onClick={() => setShowCheckForm(true)}
                  data-testid="button-first-check"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Record First Check
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {checks.map((check) => (
                  <div 
                    key={check.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-medium">
                              Checked by {check.checkedBy.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Employee ID: {check.checkedBy.employeeId}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Scheduled Date</p>
                            <p className="text-sm">{new Date(check.scheduledDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Completed Date</p>
                            <p className="text-sm">{new Date(check.completedDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {check.checkComment && (
                          <div className="bg-gray-50 p-3 rounded text-sm">
                            <p className="font-medium text-gray-600 mb-1">Notes:</p>
                            <p className="text-gray-800">{check.checkComment}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 text-right">
                        <Badge 
                          variant={
                            check.status === 'completed' ? 'default' : 
                            check.status === 'delayed' ? 'destructive' : 'secondary'
                          }
                        >
                          {check.status}
                        </Badge>
                        {check.isDelayed && (
                          <p className="text-xs text-red-600 mt-1">Delayed</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}