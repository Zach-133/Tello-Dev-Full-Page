import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2, Flame, Target, TrendingUp, Trophy, Plus, AlertCircle,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";

const DASHBOARD_WEBHOOK = "https://n8n.zach13.com/webhook/45445649-f088-48e2-be5e-ac0ee4a57c23";

interface Session {
  date: string;
  finalScore: number;
  technicalKnowledge: number;
  problemSolving: number;
  communicationSkills: number;
  relevance: number;
}

interface DashboardStats {
  totalSessions: number;
  bestScore: number;
  currentScore: number;
  improvement: number;
  streakDays: number;
}

interface DashboardData {
  sessions: Session[];
  stats: DashboardStats;
}

const formatDateLabel = (isoStr: string) => {
  try {
    return new Date(isoStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } catch {
    return isoStr;
  }
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "loaded" | "empty" | "error">("loading");
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      const email = user?.email;
      if (!email) {
        setError("Not logged in.");
        setStatus("error");
        return;
      }
      try {
        const res = await fetch(DASHBOARD_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) throw new Error("Request failed");
        const json: DashboardData = await res.json();
        if (!json.sessions || json.sessions.length === 0) {
          setStatus("empty");
        } else {
          setData(json);
          setStatus("loaded");
        }
      } catch (err) {
        setError((err as Error).message);
        setStatus("error");
      }
    };
    fetchDashboard();
  }, [user?.email]);

  const stats = data?.stats;

  const chartData = data?.sessions.map((s) => ({
    label: formatDateLabel(s.date),
    "Overall Score": s.finalScore,
    "Problem-Solving": Math.round(s.problemSolving * 10),
    "Technical": Math.round(s.technicalKnowledge * 10),
    "Communication": Math.round(s.communicationSkills * 10),
  })) ?? [];

  const improvementPct =
    data && data.sessions.length > 1 && data.sessions[0].finalScore > 0
      ? Math.round((data.stats.improvement / data.sessions[0].finalScore) * 100)
      : 0;

  return (
    <div className="min-h-screen gradient-hero">
      <AppHeader />
      <div className="container mx-auto px-4 py-10 max-w-5xl">

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground font-serif">Your Progress</h1>
          <p className="text-muted-foreground mt-1">Track your interview performance over time</p>
        </div>

        {/* Loading */}
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-coral animate-spin" />
            <p className="text-muted-foreground">Loading your stats...</p>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <Card className="bg-card rounded-2xl shadow-card border border-border/50 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground font-serif mb-2">Couldn't load dashboard</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button variant="coral" onClick={() => window.location.reload()}>Try Again</Button>
          </Card>
        )}

        {/* Empty */}
        {status === "empty" && (
          <Card className="bg-card rounded-2xl shadow-card border border-border/50 p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-8 h-8 text-coral" />
            </div>
            <h2 className="text-2xl font-bold text-foreground font-serif mb-2">No interviews yet</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Complete your first interview to start tracking your progress here.
            </p>
            <Button variant="coral" onClick={() => navigate("/form")} className="gap-2">
              <Plus className="w-4 h-4" />
              Start Your First Interview
            </Button>
          </Card>
        )}

        {/* Loaded */}
        {status === "loaded" && data && stats && (
          <div className="space-y-6 animate-fade-in">

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card rounded-2xl shadow-card border border-border/50 p-5">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-coral" />
                  </div>
                  <p className="text-2xl font-bold text-foreground font-serif">{stats.streakDays}</p>
                  <p className="text-xs font-medium text-muted-foreground">Day Streak</p>
                  {stats.streakDays > 0 && (
                    <p className="text-xs text-coral font-medium">Keep it up!</p>
                  )}
                </div>
              </Card>

              <Card className="bg-card rounded-2xl shadow-card border border-border/50 p-5">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-teal" />
                  </div>
                  <p className="text-2xl font-bold text-foreground font-serif">{stats.totalSessions}</p>
                  <p className="text-xs font-medium text-muted-foreground">Sessions Done</p>
                </div>
              </Card>

              <Card className="bg-card rounded-2xl shadow-card border border-border/50 p-5">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-gold" />
                  </div>
                  <p className="text-2xl font-bold text-foreground font-serif">
                    {stats.improvement >= 0 ? "+" : ""}{stats.improvement} pts
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">Improvement</p>
                </div>
              </Card>

              <Card className="bg-card rounded-2xl shadow-card border border-border/50 p-5">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-gold" />
                  </div>
                  <p className="text-2xl font-bold text-foreground font-serif">{stats.bestScore}</p>
                  <p className="text-xs font-medium text-muted-foreground">Best Score</p>
                </div>
              </Card>
            </div>

            {/* Line Chart */}
            <Card className="bg-card rounded-2xl shadow-card border border-border/50 p-6">
              <h2 className="text-xl font-bold text-foreground font-serif">Performance Over Time</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Your scores across all 4 criteria</p>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,20%,88%)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "hsl(25,15%,45%)" }}
                      axisLine={{ stroke: "hsl(30,20%,88%)" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "hsl(25,15%,45%)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(30,20%,99%)",
                        border: "1px solid hsl(30,20%,88%)",
                        borderRadius: "0.75rem",
                        fontSize: "12px",
                        boxShadow: "0 4px 20px -4px rgba(60,30,10,0.10)",
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
                    />
                    <Line type="monotone" dataKey="Overall Score"   stroke="#E08060" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="Problem-Solving" stroke="#4D9E8E" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="Technical"       stroke="#D4A843" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="Communication"   stroke="#5CAD7A" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Bottom Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-card rounded-2xl shadow-card border border-border/50 p-6 text-center">
                <p className="text-3xl font-bold text-coral font-serif">
                  {improvementPct >= 0 ? "+" : ""}{improvementPct}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">Overall improvement</p>
              </Card>
              <Card className="bg-card rounded-2xl shadow-card border border-border/50 p-6 text-center">
                <p className="text-3xl font-bold font-serif" style={{ color: "#4D9E8E" }}>
                  {stats.totalSessions}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Practice sessions</p>
              </Card>
              <Card className="bg-card rounded-2xl shadow-card border border-border/50 p-6 text-center">
                <p className="text-3xl font-bold text-foreground font-serif">{stats.currentScore}</p>
                <p className="text-sm text-muted-foreground mt-1">Current score</p>
              </Card>
            </div>

            {/* CTA */}
            <div className="text-center pt-2 pb-6">
              <Button variant="coral" onClick={() => navigate("/form")} className="gap-2">
                <Plus className="w-4 h-4" />
                Start New Interview
              </Button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
