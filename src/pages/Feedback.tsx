import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle2, Gift } from "lucide-react";

const QUESTIONS = [
  { id: "realism",       label: "How realistic did the interview feel?" },
  { id: "feedback",      label: "How useful was the post-interview feedback?" },
  { id: "understanding", label: "How well did Ivy understand your responses?" },
  { id: "likelihood",    label: "How likely are you to use Tello to prepare for a real interview?" },
  { id: "overall",       label: "How would you rate your overall early access experience?" },
];

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

// ── Star rating ────────────────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="p-0.5 transition-transform duration-100 hover:scale-110 active:scale-95"
          aria-label={`Rate ${star} out of 5`}
        >
          <Star
            className="w-6 h-6"
            fill={active >= star ? "hsl(38,75%,52%)" : "none"}
            stroke={active >= star ? "hsl(38,70%,48%)" : "hsl(25,15%,68%)"}
            strokeWidth={1.5}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-xs text-muted-foreground font-medium">
          {LABELS[value]}
        </span>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Feedback() {
  const [ratings, setRatings]               = useState<Record<string, number>>({});
  const [ratingsComment, setRatingsComment] = useState("");
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [submitted, setSubmitted]           = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Stub — feedback logged to console, no network call
    console.log("[Feedback] submitted", { ratings, ratingsComment, generalFeedback });
    setSubmitted(true);
  };

  // ── Success state ────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen gradient-hero">
        <AppHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <div className="text-center space-y-4 animate-fade-in px-4 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-foreground">
              Thank you!
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your feedback has been sent to the Tello team. We'll reach out with your free month of PRO before launch on{" "}
              <span className="font-semibold text-foreground">1st May 2026</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Feedback form ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen gradient-hero page-slide-right">
      <AppHeader />

      <div className="container mx-auto px-4 pt-6 pb-10 max-w-2xl">

        {/* Incentive banner */}
        <Card
          className="mb-6 p-5 border-0 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(22,52%,20%) 0%, hsl(18,55%,15%) 100%)",
          }}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5" style={{ color: "hsl(42,85%,80%)" }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "hsl(42,85%,85%)" }}>
                Early Access Reward
              </p>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: "hsl(30,20%,80%)" }}>
                Share your experience and receive{" "}
                <span className="font-semibold" style={{ color: "hsl(42,85%,82%)" }}>
                  1 month of Tello PRO free
                </span>{" "}
                when we officially launch on{" "}
                <span className="font-semibold" style={{ color: "hsl(42,85%,82%)" }}>
                  1st May 2026
                </span>
                . Your feedback shapes the product.
              </p>
            </div>
          </div>
        </Card>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-serif text-foreground">
            Share your experience
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Honest feedback from you, a founding member, helps us build a better Tello.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Star ratings */}
          <Card className="p-5 rounded-2xl shadow-card border border-border/50">
            <h3 className="text-base font-semibold text-foreground mb-5">
              Rate your experience
            </h3>
            <div className="space-y-5">
              {QUESTIONS.map((q, i) => (
                <div key={q.id}>
                  <p className="text-sm text-foreground mb-2">
                    <span className="text-muted-foreground text-xs font-mono mr-2">{i + 1}.</span>
                    {q.label}
                  </p>
                  <StarRating
                    value={ratings[q.id] ?? 0}
                    onChange={(v) => setRatings((r) => ({ ...r, [q.id]: v }))}
                  />
                  {i < QUESTIONS.length - 1 && (
                    <div className="mt-4 border-t border-border/40" />
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Comments on ratings */}
          <Card className="p-5 rounded-2xl shadow-card border border-border/50">
            <label className="text-sm font-semibold text-foreground block mb-2">
              Any specific comments on the above ratings?{" "}
              <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              value={ratingsComment}
              onChange={(e) => setRatingsComment(e.target.value)}
              placeholder="E.g. The interview felt a bit rushed at the 5-minute mark..."
              rows={3}
              className="w-full rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 p-3 outline-none resize-none transition-[border-color] duration-150 focus:border-muted-foreground/40"
            />
          </Card>

          {/* General feedback */}
          <Card className="p-5 rounded-2xl shadow-card border border-border/50">
            <label className="text-sm font-semibold text-foreground block mb-2">
              What would make Tello better for you?
            </label>
            <textarea
              value={generalFeedback}
              onChange={(e) => setGeneralFeedback(e.target.value)}
              placeholder="Tell us anything — features you'd love, things that frustrated you, what you'd show a friend..."
              rows={5}
              className="w-full rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 p-3 outline-none resize-none transition-[border-color] duration-150 focus:border-muted-foreground/40"
            />
          </Card>

          <Button
            type="submit"
            variant="coral"
            className="w-full h-12 font-semibold"
          >
            Submit Feedback
          </Button>

        </form>
      </div>
    </div>
  );
}
