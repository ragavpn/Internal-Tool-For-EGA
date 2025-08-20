import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FormBuilder from "@/components/forms/form-builder";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FileText, Eye, Settings, Trash2, Copy } from "lucide-react";
import type { FeedbackForm, BrandTemplate } from "@shared/schema";

export default function Forms() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: forms = [], isLoading } = useQuery<FeedbackForm[]>({
    queryKey: ["/api/feedback-forms"],
  });

  const { data: brandTemplates = [] } = useQuery<BrandTemplate[]>({
    queryKey: ["/api/brand-templates"],
  });

  const createFormMutation = useMutation({
    mutationFn: (formData: any) => apiRequest("POST", "/api/feedback-forms", formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback-forms"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Form Created",
        description: "Your feedback form has been created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create the feedback form.",
        variant: "destructive",
      });
    },
  });

  const handleCreateForm = () => {
    setIsCreateDialogOpen(true);
  };

  const handlePublishForm = (formData: any) => {
    createFormMutation.mutate(formData);
  };

  const copyEmbedCode = (form: FeedbackForm) => {
    if (form.embedCode) {
      navigator.clipboard.writeText(form.embedCode);
      toast({
        title: "Copied!",
        description: "Embed code copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-app-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Loading forms...</p>
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
          title="Feedback Forms"
          subtitle="Create and manage customer feedback collection forms"
          onCreateForm={handleCreateForm}
        />
        
        <div className="flex-1 overflow-auto p-8">
          {forms.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No feedback forms yet</h3>
              <p className="text-slate-500 mb-6">Create your first feedback form to start collecting customer insights.</p>
              <Button 
                onClick={handleCreateForm}
                className="bg-app-primary hover:bg-blue-700 text-white"
                data-testid="button-create-first-form"
              >
                Create Your First Form
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map((form) => (
                <Card key={form.id} className="hover:shadow-lg transition-shadow" data-testid={`form-card-${form.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{form.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2">{form.description}</p>
                      </div>
                      <Badge 
                        className={form.isPublished ? "bg-app-success text-white" : "bg-slate-500 text-white"}
                      >
                        {form.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-slate-500 mb-4">
                      Created: {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : "Unknown"}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        data-testid={`button-preview-${form.id}`}
                      >
                        <Eye size={14} className="mr-1" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyEmbedCode(form)}
                        data-testid={`button-copy-embed-${form.id}`}
                      >
                        <Copy size={14} className="mr-1" />
                        Embed
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        data-testid={`button-settings-${form.id}`}
                      >
                        <Settings size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Feedback Form</DialogTitle>
          </DialogHeader>
          <FormBuilder
            brandTemplates={brandTemplates}
            onPublish={handlePublishForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
