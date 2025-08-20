import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Save, Wrench } from "lucide-react";
import type { Device, InsertDevice } from "@shared/schema";

export default function DeviceForm() {
  const [, params] = useRoute("/devices/edit/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const isEdit = !!params?.id;
  const deviceId = params?.id;

  const [formData, setFormData] = useState<InsertDevice>({
    name: "",
    identificationNumber: "",
    location: "",
    plannedFrequencyWeeks: 1,
    planComment: "",
    status: "active",
    createdBy: "", // Will be set by the backend
  });

  // Fetch existing device data if editing
  const { data: existingDevice } = useQuery<Device>({
    queryKey: ["/api/devices", deviceId],
    enabled: isEdit && !!deviceId,
  });

  useEffect(() => {
    if (existingDevice && isEdit) {
      setFormData({
        name: existingDevice.name,
        identificationNumber: existingDevice.identificationNumber,
        location: existingDevice.location,
        plannedFrequencyWeeks: existingDevice.plannedFrequencyWeeks,
        planComment: existingDevice.planComment || "",
        status: existingDevice.status,
        createdBy: existingDevice.createdBy || "",
      });
    }
  }, [existingDevice, isEdit]);

  const createMutation = useMutation({
    mutationFn: (deviceData: InsertDevice) => 
      apiRequest("POST", "/api/devices", deviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Device created successfully",
      });
      setLocation("/devices");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create device",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (deviceData: Partial<InsertDevice>) => 
      apiRequest("PUT", `/api/devices/${deviceId}`, deviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Device updated successfully",
      });
      setLocation("/devices");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update device",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEdit) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 1 : value,
    }));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

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
              <h1 className="text-xl font-semibold text-gray-900">
                {isEdit ? "Edit Device" : "Add Device"}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Device Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Device Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Compressor Unit A1"
                    data-testid="input-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identificationNumber">Identification Number *</Label>
                  <Input
                    id="identificationNumber"
                    name="identificationNumber"
                    type="text"
                    required
                    value={formData.identificationNumber}
                    onChange={handleChange}
                    placeholder="e.g., CMP-001"
                    data-testid="input-identification"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Building A - Floor 2"
                    data-testid="input-location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plannedFrequencyWeeks">Check Frequency (weeks) *</Label>
                  <Input
                    id="plannedFrequencyWeeks"
                    name="plannedFrequencyWeeks"
                    type="number"
                    min="1"
                    required
                    value={formData.plannedFrequencyWeeks}
                    onChange={handleChange}
                    placeholder="e.g., 2"
                    data-testid="input-frequency"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="planComment">Plan Notes</Label>
                <Textarea
                  id="planComment"
                  name="planComment"
                  value={formData.planComment}
                  onChange={handleChange}
                  placeholder="Any special instructions or notes for maintenance checks..."
                  rows={3}
                  data-testid="textarea-notes"
                />
                <p className="text-sm text-gray-500">
                  Optional notes about the maintenance plan or special requirements
                </p>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                  data-testid="button-save"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {isEdit ? "Updating..." : "Creating..."}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      {isEdit ? "Update Device" : "Create Device"}
                    </div>
                  )}
                </Button>

                <Link href="/devices">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}