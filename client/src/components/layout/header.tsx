import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
  onCreateForm?: () => void;
  onExport?: () => void;
}

export default function Header({ title, subtitle, onCreateForm, onExport }: HeaderProps) {
  return (
    <header className="bg-app-surface border-b border-slate-200 px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          {onCreateForm && (
            <Button 
              onClick={onCreateForm}
              className="bg-app-primary hover:bg-blue-700 text-white"
              data-testid="button-create-form"
            >
              <Plus size={16} className="mr-2" />
              Create Form
            </Button>
          )}
          {onExport && (
            <Button 
              variant="outline" 
              onClick={onExport}
              data-testid="button-export-data"
            >
              <Download size={16} className="mr-2" />
              Export Data
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
