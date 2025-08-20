import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  FileText, 
  Brain, 
  Palette, 
  FileDown,
  MessageSquare,
  Settings
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Feedback Forms", href: "/forms", icon: FileText },
  { name: "Sentiment Analysis", href: "/sentiment", icon: Brain },
  { name: "Brand Templates", href: "/templates", icon: Palette },
  { name: "Reports & Export", href: "/reports", icon: FileDown },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-app-surface border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-app-primary rounded-lg flex items-center justify-center">
            <MessageSquare className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">FeedbackFlow</h1>
            <p className="text-xs text-slate-500">Sentiment Analytics</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || 
              (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive
                        ? "bg-app-primary text-white"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" 
            alt="User profile" 
            className="w-10 h-10 rounded-full object-cover" 
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">Sarah Johnson</p>
            <p className="text-xs text-slate-500 truncate">Customer Success Manager</p>
          </div>
          <button 
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            data-testid="button-user-settings"
          >
            <Settings className="text-slate-400" size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
