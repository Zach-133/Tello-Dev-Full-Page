import { LucideIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ScoreCardProps {
  icon: LucideIcon;
  title: string;
  score: number;
  comment: string;
  accentColor: "purple" | "amber" | "blue" | "emerald";
}

const colorMap = {
  purple: {
    icon: "text-purple-600",
    progress: "bg-purple-600",
  },
  amber: {
    icon: "text-amber-600",
    progress: "bg-amber-600",
  },
  blue: {
    icon: "text-blue-600",
    progress: "bg-blue-600",
  },
  emerald: {
    icon: "text-emerald-600",
    progress: "bg-emerald-600",
  },
};

const ScoreCard = ({ icon: Icon, title, score, comment, accentColor }: ScoreCardProps) => {
  const colors = colorMap[accentColor];

  return (
    <div className="bg-card p-6 rounded-xl shadow-card border border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`w-8 h-8 ${colors.icon}`} />
        <h3 className="text-lg font-semibold text-foreground font-serif">{title}</h3>
      </div>

      <p className="text-3xl font-bold text-foreground mb-3">
        {score}/100
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-secondary rounded-full h-2 mb-4 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-700 ease-out ${colors.progress}`}
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {comment}
      </p>
    </div>
  );
};

export default ScoreCard;
