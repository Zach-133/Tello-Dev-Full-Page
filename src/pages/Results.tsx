import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";

const Results = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-card rounded-2xl shadow-card border border-border/50 p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground font-serif">
              Interview Results
            </h1>
            <p className="text-sm text-muted-foreground font-mono">
              Session ID: {sessionId}
            </p>
            <p className="text-muted-foreground">Loading your results...</p>
          </div>

          {/* Status Card */}
          <div className="bg-secondary/50 p-6 rounded-xl border border-border/30">
            <div className="flex items-center gap-3 text-foreground">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Session ID:</p>
                <p className="text-muted-foreground font-mono text-sm">{sessionId}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/30">
              <p className="text-lg text-foreground">Status: <span className="text-primary">Initializing...</span></p>
            </div>
          </div>

          {/* Back Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Results;
