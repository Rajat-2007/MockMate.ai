"use client";

import Link from "next/link";
import {
  Award,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  History,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";

export default function HistoryPage() {
  const { profile } = useAuth();

  const sessions = [
    {
      id: "sess-101",
      category: "Technical Round",
      role: profile?.target_role || "Software Engineer",
      course: profile?.course || "BCA / Tech",
      date: "Today, 4:30 PM",
      score: 8.2,
      duration: "18 mins",
      language: profile?.preferred_language || "English",
      status: "Completed",
    },
    {
      id: "sess-102",
      category: "HR & Behavioral",
      role: profile?.target_role || "Associate",
      course: profile?.course || "BCA / Tech",
      date: "Yesterday at 11:20 AM",
      score: 7.5,
      duration: "15 mins",
      language: "Hinglish",
      status: "Completed",
    },
    {
      id: "sess-103",
      category: "Resume Project Deep-Dive",
      role: profile?.course || "BCA / Tech",
      course: profile?.course || "BCA / Tech",
      date: "2 days ago",
      score: 7.7,
      duration: "20 mins",
      language: "English",
      status: "Completed",
    },
    {
      id: "sess-104",
      category: "Live DSA Coding",
      role: "SDE 1 Candidate",
      course: "Engineering & IT",
      date: "4 days ago",
      score: 8.8,
      duration: "25 mins",
      language: "English",
      status: "Completed",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Interview History & Archives
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Review every turn, oral answer, feedback report and rubric score from your past mock interviews.
          </p>
        </div>

        <Button asChild className="bg-brand-gradient hover:bg-brand-gradient text-white text-xs">
          <Link href="/interview/setup">Start New Interview</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {sessions.map((sess) => (
          <Card key={sess.id} className="border-border/80 overflow-hidden hover:border-primary/40 transition-colors">
            <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">
                    {sess.category}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold text-primary">
                    {sess.language}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-medium text-emerald-600">
                    {sess.status}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Target: <span className="text-foreground font-medium">{sess.role}</span> ({sess.course})
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3 text-muted-foreground" /> {sess.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3 text-muted-foreground" /> {sess.duration}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:self-center border-t border-border/40 sm:border-t-0 pt-3 sm:pt-0">
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">
                    {sess.score} <span className="text-xs font-normal text-muted-foreground">/ 10</span>
                  </div>
                  <span className="text-[0.65rem] font-medium text-emerald-600 block">
                    Passed Rubric
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                    <Link href={`/interview/report/${sess.id}`}>
                      View Report <ExternalLink className="ml-1 size-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
