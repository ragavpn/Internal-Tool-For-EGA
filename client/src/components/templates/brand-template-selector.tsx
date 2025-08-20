import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Palette, Leaf, Plus } from "lucide-react";
import type { BrandTemplate } from "@shared/schema";

interface BrandTemplateSelectorProps {
  templates: BrandTemplate[];
  activeTemplateId?: string;
  onSelect?: (templateId: string) => void;
  onCreateNew?: () => void;
  onManage?: () => void;
}

export default function BrandTemplateSelector({ 
  templates, 
  activeTemplateId, 
  onSelect, 
  onCreateNew,
  onManage 
}: BrandTemplateSelectorProps) {
  const getTemplateIcon = (name: string) => {
    if (name.toLowerCase().includes('marketing')) return Palette;
    if (name.toLowerCase().includes('eco')) return Leaf;
    return Building;
  };

  return (
    <div className="bg-app-surface p-6 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Brand Templates</h3>
        {onManage && (
          <Button 
            variant="ghost" 
            onClick={onManage}
            className="text-app-primary hover:text-blue-700 text-sm font-medium"
            data-testid="button-manage-templates"
          >
            Manage
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {templates.map((template) => {
          const Icon = getTemplateIcon(template.name);
          const isActive = template.id === activeTemplateId || template.isActive;
          
          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all ${
                isActive 
                  ? "border-2 border-app-primary bg-blue-50" 
                  : "border border-slate-200 hover:bg-slate-50"
              }`}
              onClick={() => onSelect?.(template.id)}
              data-testid={`template-card-${template.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: template.primaryColor }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{template.name}</h4>
                      <p className="text-xs text-slate-500">{template.description}</p>
                    </div>
                  </div>
                  {isActive && (
                    <Badge className="bg-app-primary text-white">
                      Active
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: template.primaryColor }}
                  />
                  <span>Primary: {template.primaryColor}</span>
                  <div 
                    className="w-3 h-3 rounded-full ml-3" 
                    style={{ backgroundColor: template.secondaryColor }}
                  />
                  <span>Secondary: {template.secondaryColor}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {onCreateNew && (
          <Button
            variant="outline"
            className="w-full border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-slate-400 hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2 text-slate-600"
            onClick={onCreateNew}
            data-testid="button-create-template"
          >
            <Plus size={20} />
            <span>Create New Template</span>
          </Button>
        )}
      </div>
    </div>
  );
}
