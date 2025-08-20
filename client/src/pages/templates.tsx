import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import BrandTemplateSelector from "@/components/templates/brand-template-selector";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertBrandTemplateSchema } from "@shared/schema";
import { Palette, Plus } from "lucide-react";
import type { BrandTemplate, InsertBrandTemplate } from "@shared/schema";
import { z } from "zod";

export default function Templates() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string>();

  const { data: templates = [], isLoading } = useQuery<BrandTemplate[]>({
    queryKey: ["/api/brand-templates"],
  });

  const createTemplateMutation = useMutation({
    mutationFn: (templateData: InsertBrandTemplate) => 
      apiRequest("POST", "/api/brand-templates", templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brand-templates"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Template Created",
        description: "Your brand template has been created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create the brand template.",
        variant: "destructive",
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<InsertBrandTemplate> }) =>
      apiRequest("PUT", `/api/brand-templates/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brand-templates"] });
      toast({
        title: "Template Updated",
        description: "Brand template has been updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update the brand template.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertBrandTemplate>({
    resolver: zodResolver(insertBrandTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      primaryColor: "#2563EB",
      secondaryColor: "#64748B",
      isActive: false,
    },
  });

  const handleCreateTemplate = () => {
    setIsCreateDialogOpen(true);
  };

  const handleSelectTemplate = (templateId: string) => {
    // Set as active template
    const currentActive = templates.find(t => t.isActive);
    if (currentActive && currentActive.id !== templateId) {
      updateTemplateMutation.mutate({
        id: currentActive.id,
        updates: { isActive: false }
      });
    }
    
    updateTemplateMutation.mutate({
      id: templateId,
      updates: { isActive: true }
    });
    
    setActiveTemplateId(templateId);
  };

  const onSubmit = (data: InsertBrandTemplate) => {
    createTemplateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-app-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Loading templates...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-app-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Brand Templates"
          subtitle="Customize your feedback forms with branded templates"
        />
        
        <div className="flex-1 overflow-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Template Selector */}
            <div className="lg:col-span-2">
              <BrandTemplateSelector
                templates={templates}
                activeTemplateId={activeTemplateId || templates.find(t => t.isActive)?.id}
                onSelect={handleSelectTemplate}
                onCreateNew={handleCreateTemplate}
              />
            </div>

            {/* Template Preview */}
            <div className="bg-app-surface p-6 rounded-xl border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Template Preview</h3>
              
              {templates.length > 0 ? (
                <div className="space-y-4">
                  {/* Preview of selected/active template */}
                  {(() => {
                    const previewTemplate = templates.find(t => 
                      t.id === activeTemplateId || (activeTemplateId === undefined && t.isActive)
                    ) || templates[0];
                    
                    return (
                      <div className="border border-slate-200 rounded-lg p-4">
                        <div className="text-center mb-4">
                          <div 
                            className="h-12 w-24 mx-auto mb-3 rounded flex items-center justify-center text-white font-semibold text-sm"
                            style={{ backgroundColor: previewTemplate.primaryColor }}
                          >
                            LOGO
                          </div>
                          <h4 className="font-semibold text-slate-900">{previewTemplate.name}</h4>
                          <p className="text-xs text-slate-500">{previewTemplate.description}</p>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Primary Color
                            </label>
                            <div 
                              className="w-full h-8 rounded border flex items-center justify-center text-white text-xs font-medium"
                              style={{ backgroundColor: previewTemplate.primaryColor }}
                            >
                              {previewTemplate.primaryColor}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Secondary Color
                            </label>
                            <div 
                              className="w-full h-8 rounded border flex items-center justify-center text-white text-xs font-medium"
                              style={{ backgroundColor: previewTemplate.secondaryColor }}
                            >
                              {previewTemplate.secondaryColor}
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t border-slate-200">
                            <Button 
                              className="w-full text-white"
                              style={{ backgroundColor: previewTemplate.primaryColor }}
                              disabled
                            >
                              Sample Button
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="text-center pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-3">
                      This is how your forms will appear with the selected template
                    </p>
                    <Badge className="bg-app-primary text-white">
                      Live Preview
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Palette className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                  <p className="text-slate-500 text-sm">No templates available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Brand Template</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Marketing Campaign" 
                        {...field} 
                        data-testid="input-template-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of this template..." 
                        className="resize-none h-20"
                        {...field} 
                        data-testid="textarea-template-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <FormControl>
                        <div className="flex space-x-2">
                          <Input 
                            type="color" 
                            {...field}
                            className="w-12 h-10 p-1 rounded"
                            data-testid="input-primary-color"
                          />
                          <Input 
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="#2563EB"
                            className="flex-1"
                            data-testid="input-primary-color-text"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="secondaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Color</FormLabel>
                      <FormControl>
                        <div className="flex space-x-2">
                          <Input 
                            type="color" 
                            {...field}
                            className="w-12 h-10 p-1 rounded"
                            data-testid="input-secondary-color"
                          />
                          <Input 
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="#64748B"
                            className="flex-1"
                            data-testid="input-secondary-color-text"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  data-testid="button-cancel-template"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-app-primary hover:bg-blue-700 text-white"
                  disabled={createTemplateMutation.isPending}
                  data-testid="button-save-template"
                >
                  {createTemplateMutation.isPending ? "Creating..." : "Create Template"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
