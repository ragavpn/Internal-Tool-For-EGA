import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Feedback } from "@shared/schema";

interface FeedbackListProps {
  feedback: Feedback[];
  onViewAll?: () => void;
}

export default function FeedbackList({ feedback, onViewAll }: FeedbackListProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getCommentFromResponses = (responses: Record<string, any>) => {
    // Extract text responses from form responses
    const textResponses = Object.values(responses)
      .filter(response => typeof response === 'string' && response.length > 10);
    return textResponses[0] || "No text feedback provided";
  };

  return (
    <div className="bg-app-surface p-6 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Recent Feedback</h3>
        {onViewAll && (
          <Button 
            variant="ghost" 
            onClick={onViewAll}
            className="text-app-primary hover:text-blue-700 text-sm font-medium"
            data-testid="button-view-all-feedback"
          >
            View All
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {feedback.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No feedback available yet
          </div>
        ) : (
          feedback.slice(0, 3).map((item) => (
            <div 
              key={item.id} 
              className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              data-testid={`feedback-item-${item.id}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge className={getSentimentColor(item.sentiment)}>
                    {item.sentiment}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : "Unknown time"}
                  </span>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal size={16} className="text-slate-400" />
                </Button>
              </div>
              
              <p className="text-sm text-slate-700 mb-2 line-clamp-2">
                "{getCommentFromResponses(item.responses)}"
              </p>
              
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span>{item.category || "General"}</span>
                <span>•</span>
                <span>Rating: {item.sentimentScore}/5</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
