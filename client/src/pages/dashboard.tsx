import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SentimentChart from "@/components/charts/sentiment-chart";
import CategoryChart from "@/components/charts/category-chart";
import FeedbackList from "@/components/feedback/feedback-list";
import FormBuilder from "@/components/forms/form-builder";
import BrandTemplateSelector from "@/components/templates/brand-template-selector";
import { MessageSquare, Smile, Frown, PieChart, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Feedback, BrandTemplate, FeedbackForm } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/stats"],
  });

  const { data: feedback = [], isLoading: feedbackLoading } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback"],
  });

  const { data: brandTemplates = [] } = useQuery<BrandTemplate[]>({
    queryKey: ["/api/brand-templates"],
  });

  const handleCreateForm = () => {
    toast({
      title: "Form Builder",
      description: "Opening form creation wizard...",
    });
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export/feedback?format=csv');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'feedback-export.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Complete",
        description: "Feedback data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export feedback data.",
        variant: "destructive",
      });
    }
  };

  const handlePublishForm = async (formData: any) => {
    try {
      await apiRequest("POST", "/api/feedback-forms", formData);
      toast({
        title: "Form Published",
        description: "Your feedback form has been published successfully!",
      });
    } catch (error) {
      toast({
        title: "Publish Failed",
        description: "Failed to publish the feedback form.",
        variant: "destructive",
      });
    }
  };

  // Mock sentiment trend data
  const sentimentData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    positive: [65, 68, 70, 68],
    neutral: [20, 18, 16, 14],
    negative: [15, 14, 14, 18],
  };

  if (statsLoading || feedbackLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-app-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  const currentStats = stats || {
    total: 0,
    positive: 0,
    negative: 0,
    neutral: 0,
    responseRate: 0,
    categories: {},
  };

  const positivePercentage = currentStats.total > 0 ? Math.round((currentStats.positive / currentStats.total) * 100) : 0;
  const negativePercentage = currentStats.total > 0 ? Math.round((currentStats.negative / currentStats.total) * 100) : 0;

  return (
    <div className="flex h-screen bg-app-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Dashboard Overview"
          subtitle="Real-time customer sentiment analysis and feedback insights"
          onCreateForm={handleCreateForm}
          onExport={handleExport}
        />
        
        <div className="flex-1 overflow-auto p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow" data-testid="stat-total-feedback">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Feedback</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{currentStats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="text-app-primary" size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="text-app-success mr-1" size={16} />
                  <span className="text-app-success font-medium">12%</span>
                  <span className="text-slate-500 ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow" data-testid="stat-positive-sentiment">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Positive Sentiment</p>
                    <p className="text-2xl font-bold text-app-success mt-1">{positivePercentage}%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Smile className="text-app-success" size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="text-app-success mr-1" size={16} />
                  <span className="text-app-success font-medium">5%</span>
                  <span className="text-slate-500 ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow" data-testid="stat-negative-sentiment">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Negative Sentiment</p>
                    <p className="text-2xl font-bold text-app-danger mt-1">{negativePercentage}%</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Frown className="text-app-danger" size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingDown className="text-app-danger mr-1" size={16} />
                  <span className="text-app-danger font-medium">3%</span>
                  <span className="text-slate-500 ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow" data-testid="stat-response-rate">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Response Rate</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{currentStats.responseRate}%</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <PieChart className="text-purple-600" size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="text-app-success mr-1" size={16} />
                  <span className="text-app-success font-medium">8%</span>
                  <span className="text-slate-500 ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 bg-app-surface p-6 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Sentiment Trends</h3>
                <Select defaultValue="30d">
                  <SelectTrigger className="w-40" data-testid="select-time-range">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <SentimentChart data={sentimentData} />
            </div>

            <div className="bg-app-surface p-6 rounded-xl border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Feedback Categories</h3>
              <div className="space-y-4 mb-6">
                {Object.entries(currentStats.categories).length > 0 ? (
                  Object.entries(currentStats.categories).map(([category, count]) => {
                    const total = Object.values(currentStats.categories).reduce((sum, val) => sum + val, 0);
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-app-primary rounded-full"></div>
                          <span className="text-sm font-medium text-slate-700">{category}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{percentage}%</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-slate-500 text-sm">
                    No category data available yet
                  </div>
                )}
              </div>
              {Object.keys(currentStats.categories).length > 0 && (
                <div className="border-t border-slate-200 pt-6">
                  <CategoryChart data={currentStats.categories} />
                </div>
              )}
            </div>
          </div>

          {/* Recent Feedback and Brand Templates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <FeedbackList feedback={feedback} />
            <BrandTemplateSelector templates={brandTemplates} />
          </div>

          {/* Form Builder */}
          <FormBuilder 
            brandTemplates={brandTemplates}
            onPublish={handlePublishForm}
          />

          {/* Embed and Export Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Embed Options */}
            <div className="bg-app-surface p-6 rounded-xl border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Embed Options</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Embed Code</label>
                  <div className="bg-slate-100 p-3 rounded-lg border relative">
                    <code className="text-xs text-slate-700 font-mono break-all">
                      &lt;iframe src="https://feedbackflow.app/embed/abc123" width="100%" height="400"&gt;&lt;/iframe&gt;
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 h-6 px-2"
                      onClick={() => {
                        navigator.clipboard.writeText('<iframe src="https://feedbackflow.app/embed/abc123" width="100%" height="400"></iframe>');
                        toast({ title: "Copied!", description: "Embed code copied to clipboard" });
                      }}
                      data-testid="button-copy-embed"
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1" data-testid="button-share-form">
                    Share Form
                  </Button>
                  <Button variant="outline" className="flex-1" data-testid="button-generate-qr">
                    Generate QR
                  </Button>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-app-surface p-6 rounded-xl border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Export & Reports</h3>
              <div className="space-y-4">
                <Card className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-800">Feedback Data Export</h4>
                      <Badge variant="outline">CSV</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">Export all feedback data with sentiment analysis</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={handleExport} data-testid="button-export-csv">
                        CSV
                      </Button>
                      <Button size="sm" variant="outline" data-testid="button-export-excel">
                        Excel
                      </Button>
                      <Button size="sm" variant="outline" data-testid="button-export-json">
                        JSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-800">Analytics Report</h4>
                      <Badge variant="outline" className="bg-app-success text-white">Report</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">Comprehensive sentiment analysis and trends</p>
                    <Button 
                      size="sm" 
                      className="w-full bg-app-success hover:bg-green-700 text-white"
                      data-testid="button-generate-report"
                    >
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
