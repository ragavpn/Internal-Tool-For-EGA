import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Rocket } from "lucide-react";
import type { BrandTemplate, FormField } from "@shared/schema";

interface FormBuilderProps {
  brandTemplates: BrandTemplate[];
  onPreview?: () => void;
  onPublish?: (formData: any) => void;
}

export default function FormBuilder({ brandTemplates, onPreview, onPublish }: FormBuilderProps) {
  const [formTitle, setFormTitle] = useState("Customer Satisfaction Survey");
  const [formDescription, setFormDescription] = useState("Help us improve by sharing your experience...");
  const [selectedTemplate, setSelectedTemplate] = useState(brandTemplates[0]?.id || "");

  const defaultFields: FormField[] = [
    {
      id: "rating",
      type: "rating",
      label: "Overall Experience",
      required: true,
    },
    {
      id: "comments",
      type: "textarea",
      label: "Comments",
      required: false,
    },
  ];

  const handlePublish = () => {
    if (onPublish) {
      onPublish({
        title: formTitle,
        description: formDescription,
        brandTemplateId: selectedTemplate,
        fields: defaultFields,
        isPublished: true,
      });
    }
  };

  const selectedBrandTemplate = brandTemplates.find(t => t.id === selectedTemplate);

  return (
    <div className="bg-app-surface p-6 rounded-xl border border-slate-200 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Feedback Form Builder</h3>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={onPreview}
            data-testid="button-preview-form"
          >
            <Eye size={16} className="mr-2" />
            Preview
          </Button>
          <Button 
            onClick={handlePublish}
            className="bg-app-primary hover:bg-blue-700 text-white"
            data-testid="button-publish-form"
          >
            <Rocket size={16} className="mr-2" />
            Publish Form
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Configuration */}
        <div>
          <h4 className="font-semibold text-slate-800 mb-4">Form Configuration</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="form-title">Form Title</Label>
              <Input
                id="form-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Customer Satisfaction Survey"
                data-testid="input-form-title"
              />
            </div>
            
            <div>
              <Label htmlFor="form-description">Description</Label>
              <Textarea
                id="form-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Help us improve by sharing your experience..."
                className="h-20 resize-none"
                data-testid="textarea-form-description"
              />
            </div>
            
            <div>
              <Label htmlFor="brand-template">Brand Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger data-testid="select-brand-template">
                  <SelectValue placeholder="Select a brand template" />
                </SelectTrigger>
                <SelectContent>
                  {brandTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Form Preview */}
        <div>
          <h4 className="font-semibold text-slate-800 mb-4">Live Preview</h4>
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div 
                  className="h-12 w-32 mx-auto mb-4 rounded flex items-center justify-center text-white font-semibold"
                  style={{ 
                    backgroundColor: selectedBrandTemplate?.primaryColor || "#2563EB" 
                  }}
                >
                  LOGO
                </div>
                <h3 className="text-lg font-bold text-slate-900">{formTitle}</h3>
                <p className="text-sm text-slate-600 mt-1">{formDescription}</p>
              </div>
              
              <form className="space-y-4">
                <div>
                  <Label>Overall Experience</Label>
                  <div className="flex space-x-2 mt-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        type="button"
                        size="sm"
                        className="w-8 h-8 rounded-full text-white"
                        style={{
                          backgroundColor: rating <= 2 ? "#EF4444" : 
                                         rating === 3 ? "#F59E0B" : "#10B981"
                        }}
                        data-testid={`rating-button-${rating}`}
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="preview-comments">Comments</Label>
                  <Textarea
                    id="preview-comments"
                    placeholder="Share your thoughts..."
                    className="h-20 resize-none"
                    disabled
                  />
                </div>
                
                <Button 
                  type="button" 
                  className="w-full text-white"
                  style={{ 
                    backgroundColor: selectedBrandTemplate?.primaryColor || "#2563EB" 
                  }}
                  disabled
                >
                  Submit Feedback
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
